import React, { useRef, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { X, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useCreateOrder } from '../../hooks/usePOS';
import { buildReceiptHtml } from '../../utils/receiptHtml';

export const CheckoutModal = ({ isOpen, onClose, total }) => {
  const { items, clearCart, discount, setDiscount, pendingOrderNumber, alreadyPaid, existingPayments } = useCartStore();
  const [paymentAmounts, setPaymentAmounts] = useState({ CASH: '', UPI: '', CARD: '', NEFT: '', RTGS: '', OTHERS: '' });
  const [billNo, setBillNo] = useState(pendingOrderNumber || '');
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorField, setErrorField] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const successTimerRef = useRef(null);

  const handleClose = () => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setIsSuccess(false);
    onClose();
  };

  const scheduleSuccessClose = () => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = window.setTimeout(() => {
      successTimerRef.current = null;
      setIsSuccess(false);
      onClose();
    }, 3000);
  };

  const createOrderMutation = useCreateOrder();

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const discountAmount = discount.type === 'FLAT' 
    ? parseFloat(discount.value || 0) 
    : subtotal * (parseFloat(discount.value || 0) / 100);
  
  const effectiveDiscount = Math.min(subtotal, Math.max(0, discountAmount));
  const discountedSubtotal = subtotal - effectiveDiscount;

  const { gstAmount, vatAmount } = items.reduce((acc, item) => {
    const lineTotal = parseFloat(item.price) * item.quantity;
    const itemDiscount = subtotal > 0 ? (lineTotal / subtotal) * effectiveDiscount : 0;
    const discountedLine = Math.max(0, lineTotal - itemDiscount);
    const tax = (discountedLine * parseFloat(item.gst_percentage || 0) / 100);
    
    if (item.gst_type?.toUpperCase() === 'VAT') {
      acc.vatAmount += tax;
    } else {
      acc.gstAmount += tax;
    }
    return acc;
  }, { gstAmount: 0, vatAmount: 0 });

  const taxAmount = gstAmount + vatAmount;

  const exactTotal = discountedSubtotal + taxAmount;
  const roundedTotal = Math.round(exactTotal);
  const roundOff = roundedTotal - exactTotal;

  const remainingDue = Math.max(0, exactTotal - (alreadyPaid || 0));

  const displayBillNo = billNo || 'NEW_ORDER';
  
  const previewHtml = React.useMemo(() => {
    const orderItems = items.map(i => {
      const lineTotal = parseFloat(i.price) * i.quantity;
      const itemDiscount = subtotal > 0 ? (lineTotal / subtotal) * effectiveDiscount : 0;
      const discountedLine = Math.max(0, lineTotal - itemDiscount);
      return {
        product: { name: i.name },
        quantity: i.quantity,
        unit_price: i.price,
        line_total: lineTotal,
        gst_type: i.gst_type,
        gst_percentage: i.gst_percentage,
        gst_amount: discountedLine * parseFloat(i.gst_percentage || 0) / 100
      };
    });
    const paymentLabel = Object.entries(paymentAmounts)
      .filter(([, amount]) => parseFloat(amount || 0) > 0)
      .map(([paymentMethod]) => paymentMethod)
      .join(' + ') || '';
    const currentPaid = Object.values(paymentAmounts).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
    const totalPaidAmt = (alreadyPaid || 0) + currentPaid;
    
    const currentPaymentsList = Object.entries(paymentAmounts)
      .filter(([, amount]) => parseFloat(amount || 0) > 0)
      .map(([method, amount]) => ({ method, amount: parseFloat(amount) }));
    const allPayments = [...(existingPayments || []), ...currentPaymentsList];
      
    return buildReceiptHtml(displayBillNo, orderItems, subtotal, taxAmount, parseFloat(total), paymentLabel, paymentAmounts.CASH, discountAmount, null, totalPaidAmt, allPayments);
  }, [items, subtotal, effectiveDiscount, taxAmount, total, paymentAmounts, displayBillNo, discountAmount, alreadyPaid, existingPayments]);

  const handleCheckout = async (isPayLater = false) => {
    setErrorMsg(null);
    setErrorField(null);

    if (!billNo || billNo.trim() === '') {
      setErrorField('billNo');
      setErrorMsg('Bill Number is required.');
      return;
    }

    const totalPaid = Object.values(paymentAmounts).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
    
    if (!isPayLater) {
      if (totalPaid <= 0) {
        setErrorField('payment');
        setErrorMsg('Please add at least one payment or use Pay Later.');
        return;
      }
      // Allow payment if it covers at least the rounded down remaining due
      const minAllowed = Math.floor(remainingDue);
      if (totalPaid < minAllowed) {
        setErrorField('payment');
        setErrorMsg(`Payment is short by ₹${(minAllowed - totalPaid).toFixed(2)}. Minimum accepted payment is ₹${minAllowed.toFixed(2)}.`);
        return;
      }
    }

    const payload = {
      order_number: billNo.trim(),
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      })),
      discount_amount: discountAmount,
      discount_type: discount.type,
      discount_rate: parseFloat(discount.value || 0),
      payment: Object.entries(paymentAmounts)
        .filter(([, amount]) => parseFloat(amount || 0) > 0)
        .map(([paymentMethod, amount]) => ({
          method: paymentMethod,
          amount: parseFloat(amount).toFixed(2),
          ...(paymentMethod === 'CASH' ? { amount_tendered: parseFloat(paymentAmounts.CASH || amount).toFixed(2) } : {})
        }))
    };

    try {
      const response = await createOrderMutation.mutateAsync(payload);
      const order = response.order;
      clearCart();
      setIsSuccess(true);
      // Start the success countdown immediately after the order is saved.
      // Receipt printing is intentionally independent of this timer.
      scheduleSuccessClose();

      // Build final receipt with Sherwoods format
      const finalBillNo = billNo || order.order_number;
      const orderItems = order.items
        ? order.items.map(i => ({ product: { name: i.product?.name || i.name }, quantity: i.quantity, unit_price: i.unit_price, line_total: i.line_total, gst_type: i.gst_type, gst_percentage: i.gst_percentage, gst_amount: i.gst_amount }))
        : items.map(i => ({ product: { name: i.name }, quantity: i.quantity, unit_price: i.price, line_total: parseFloat(i.price) * i.quantity, gst_type: i.gst_type, gst_percentage: i.gst_percentage, gst_amount: parseFloat(i.price) * i.quantity * parseFloat(i.gst_percentage || 0) / 100 }));
      const finalSubtotal = order.subtotal ? parseFloat(order.subtotal) : subtotal;
      const finalTax = order.tax_amount ? parseFloat(order.tax_amount) : taxAmount;
      const paymentLabel = isPayLater ? '' : Object.entries(paymentAmounts)
        .filter(([, amount]) => parseFloat(amount || 0) > 0)
        .map(([paymentMethod]) => paymentMethod)
        .join(' + ');
      const finalTotal = order.total_amount ? parseFloat(order.total_amount) : parseFloat(total);
      
      const currentPaid = isPayLater ? 0 : Object.values(paymentAmounts).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
      const totalPaidAmt = (alreadyPaid || 0) + currentPaid;
      
      const currentPaymentsList = isPayLater ? [] : Object.entries(paymentAmounts)
        .filter(([, amount]) => parseFloat(amount || 0) > 0)
        .map(([method, amount]) => ({ method, amount: parseFloat(amount) }));
      const allPayments = [...(existingPayments || []), ...currentPaymentsList];
      
      const receiptHtml = buildReceiptHtml(finalBillNo, orderItems, finalSubtotal, finalTax, finalTotal, paymentLabel, paymentAmounts.CASH, discountAmount, null, totalPaidAmt, allPayments);

      const pw = window.open('', '_blank', 'width=420,height=640');
      if (pw) {
        pw.document.write(receiptHtml);
        pw.document.close();
        pw.focus();
        setTimeout(() => { pw.print(); pw.close(); }, 600);
      }
    } catch (error) {
      setErrorMsg(error?.message || 'Failed to process checkout. Please try again.');
    }
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Sale Complete!</h3>
          <p className="text-gray-500 mb-6">Receipt has been sent to the printer automatically.</p>
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Start New Sale
          </button>
        </div>
      </div>
    );
  }

  const paymentMethods = ['CASH', 'UPI', 'CARD', 'NEFT', 'RTGS', 'OTHERS'];
  const totalPaid = Object.values(paymentAmounts).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
  const remainingAmount = Math.max(0, remainingDue - totalPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-2 sm:p-4">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:max-h-[95vh]">
        {/* Header */}
        <div className="flex flex-none items-center justify-between border-b border-gray-100 bg-[#2c3e50] px-4 py-3 text-white sm:px-6 sm:py-4">
          <h2 className="text-lg font-bold">Checkout</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
              <div>
                <p className="font-semibold">Please check the form</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            
            {/* Left Column - Form */}
            <div className="space-y-4">
               {/* Bill Number */}
               <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-4 shadow-sm">
                 <label className="mb-2 flex items-center gap-2 text-sm font-bold text-indigo-900">
                   <span className="rounded-md bg-indigo-600 px-2 py-1 text-xs uppercase tracking-wide text-white">Required</span>
                   Bill Number <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="text"
                   value={billNo}
                   onChange={e => {
                     setBillNo(e.target.value);
                     if (errorField === 'billNo') {
                       setErrorField(null);
                       setErrorMsg(null);
                     }
                   }}
                   placeholder="Enter bill number (will print on receipt)"
                   aria-invalid={errorField === 'billNo'}
                  className={`w-full rounded-lg border-2 bg-white px-4 py-3 text-base font-semibold tracking-wide shadow-inner placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                     errorField === 'billNo'
                       ? 'border-red-400 bg-red-50 focus:ring-red-300'
                       : 'border-indigo-300 focus:border-indigo-500 focus:ring-indigo-300'
                   }`}
                 />
                 {errorField === 'billNo' && (
                   <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                     <AlertCircle className="h-3.5 w-3.5" /> Bill Number is required.
                   </p>
                 )}
               </div>

              {/* Order Summary */}
              <div className={`rounded-lg border p-4 ${
                errorField === 'payment' ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-gray-50'
              }`}>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">Order Summary</h3>
                <div className="space-y-1.5 text-sm">
                  {items.map(item => (
                    <div key={item.product_id} className="flex justify-between text-gray-600">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium text-gray-900">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                    
                    {/* Discount Input */}
                    <div className="flex items-center justify-between text-gray-500">
                      <span>Discount</span>
                      <div className="flex items-center gap-2">
                        <div className="flex bg-gray-200 rounded-md p-0.5">
                          <button 
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${discount.type === 'FLAT' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                            onClick={() => setDiscount(discount.value, 'FLAT')}
                          >
                            ₹
                          </button>
                          <button 
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${discount.type === 'PERCENT' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                            onClick={() => setDiscount(discount.value, 'PERCENT')}
                          >
                            %
                          </button>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          max={discount.type === 'PERCENT' ? '100' : undefined}
                          step="any"
                          value={discount.value}
                          onChange={e => setDiscount(e.target.value, discount.type)}
                          className="w-16 px-1 text-right bg-transparent border-b border-gray-300 focus:outline-none focus:border-indigo-500 focus:text-indigo-600 tabular-nums text-sm font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-red-600 text-xs">
                        <span>Discount Amount</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {gstAmount > 0 && (
                      <>
                        <div className="flex justify-between text-gray-500 text-xs mt-1"><span>CGST</span><span>₹{(gstAmount / 2).toFixed(2)}</span></div>
                        <div className="flex justify-between text-gray-500 text-xs"><span>SGST</span><span>₹{(gstAmount / 2).toFixed(2)}</span></div>
                      </>
                    )}
                    {vatAmount > 0 && (
                      <div className="flex justify-between text-gray-500 text-xs mt-1"><span>VAT</span><span>₹{vatAmount.toFixed(2)}</span></div>
                    )}
                    
                    <div className="flex justify-between text-gray-400 text-xs mt-1">
                      <span>Round Off</span>
                      <span>{roundOff >= 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
                      <span>{alreadyPaid > 0 ? 'Order Total' : 'Final Total'}</span><span>₹{parseFloat(total).toFixed(2)}</span>
                    </div>
                    {alreadyPaid > 0 && (
                      <>
                        <div className="flex justify-between font-semibold text-gray-800 text-sm mt-1 border-t border-gray-200 pt-1">
                          <span>Already Paid</span><span>-₹{parseFloat(alreadyPaid).toFixed(2)}</span>
                        </div>
                        {existingPayments && existingPayments.length > 0 && (
                          <div className="space-y-0.5 ml-2 mt-0.5">
                            {existingPayments.map((p, idx) => (
                              <div key={idx} className="flex justify-between text-green-700 text-xs">
                                <span>{p.method} {p.created_at ? `(${new Date(p.created_at).toLocaleDateString()})` : ''}</span>
                                <span>₹{parseFloat(p.amount).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-red-600 text-base mt-1">
                          <span>Remaining Due</span><span>₹{parseFloat(remainingDue).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  {paymentMethods.map(m => {
                    return (
                      <div key={m} className="flex items-center gap-3">
                        <label className="w-16 text-sm text-gray-600 font-medium">{m}</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentAmounts[m]}
                          onChange={e => {
                            const value = e.target.value;
                            setPaymentAmounts(prev => ({
                              ...prev,
                              [m]: value
                            }));
                            setErrorMsg(null);
                            setErrorField(null);
                          }}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          placeholder="0.00"
                        />
                      </div>
                    );
                  })}
                </div>
                {totalPaid > remainingDue && (
                  <div className="mt-3 flex justify-between text-sm font-semibold text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <span>Change</span>
                    <span>₹{(totalPaid - remainingDue).toFixed(2)}</span>
                  </div>
                )}
                <div className="mt-3 flex justify-between text-sm font-semibold bg-white border rounded-lg px-3 py-2">
                  <span>Remaining</span>
                  <span className={remainingAmount > 0 ? 'text-red-600' : 'text-green-700'}>₹{remainingAmount.toFixed(2)}</span>
                </div>
                {errorField === 'payment' && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {errorMsg}
                  </p>
                )}
              </div>

            </div>

            {/* Right Column - Bill Preview */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 hidden lg:flex flex-col">
              <div className="bg-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 text-center border-b border-gray-300 shadow-sm flex-none">
                Bill Preview (Live)
              </div>
              <div className="flex-1 p-4 flex justify-center bg-gray-50 overflow-hidden">
                <iframe 
                  srcDoc={previewHtml} 
                  title="Bill Preview"
                  className="bg-white shadow-sm border border-gray-200 w-full max-w-[350px] h-full min-h-[400px] pointer-events-none" 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 flex-none">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {!pendingOrderNumber && (
            <button
              onClick={() => handleCheckout(true)}
              disabled={createOrderMutation.isPending}
              className="w-full sm:w-auto px-4 py-2 text-sm font-bold text-amber-700 bg-amber-100 border border-amber-300 hover:bg-amber-200 rounded-lg disabled:opacity-70 transition-colors flex justify-center items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Punch (Pay Later)
            </button>
          )}
          <button
            onClick={() => handleCheckout(false)}
            disabled={createOrderMutation.isPending}
            className="w-full sm:w-auto px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-70 transition-colors flex justify-center items-center"
          >
            {createOrderMutation.isPending ? 'Processing...' : `Complete Sale — ₹${parseFloat(total).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};
