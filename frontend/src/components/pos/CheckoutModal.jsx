import React, { useRef, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCreateOrder } from '../../hooks/usePOS';

export const CheckoutModal = ({ isOpen, onClose, total }) => {
  const { items, clearCart } = useCartStore();
  const [paymentAmounts, setPaymentAmounts] = useState({ CASH: '', UPI: '', CARD: '', NEFT: '', RTGS: '', OTHERS: '' });
  const [billNo, setBillNo] = useState('');
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
  const taxAmount = parseFloat(total) - subtotal;

  const displayBillNo = billNo || 'NEW_ORDER';
  
  const buildReceiptHtml = (billLabel, orderItemsList, subtotalAmt, taxAmt, totalAmt, payMethod, tenderedAmt) => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2,'0');
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2,'0');
    const min = String(now.getMinutes()).padStart(2,'0');
    const dateStr = `${dd}/${mm}/${yy} ${hh}:${min}`;
    const grandRounded = Math.round(totalAmt);
    const roundOff = (grandRounded - totalAmt).toFixed(2);
    const totalQty = orderItemsList.reduce((s, i) => s + i.quantity, 0);
    const change = payMethod === 'CASH' && parseFloat(tenderedAmt || 0) > totalAmt
      ? (parseFloat(tenderedAmt) - totalAmt).toFixed(2) : null;
    return `<!DOCTYPE html><html><head>
      <title>Receipt - ${billLabel}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 12px 10px; max-width: 300px; margin: 0 auto; font-size: 11px; color: #000; background: #fff; line-height: 1.5; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider-solid { border-top: 1px solid #000; margin: 5px 0; }
        .divider-dash { border-top: 1px dashed #000; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; margin: 1px 0; }
        .grid4 { display: grid; grid-template-columns: 1fr 28px 52px 48px; margin: 1px 0; }
        .gst-line { font-size: 10px; color: #333; padding-left: 4px; }
        .right { text-align: right; } .center-t { text-align: center; }
        .grand { font-size: 13px; font-weight: bold; }
        .footer { text-align: center; font-size: 10px; margin-top: 6px; }
      </style>
    </head><body>
      <div class="center">
        <div style="font-size:10px;">Duplicate</div>
        <div style="font-size:15px;font-weight:bold;">Sherwoods Restaurant</div>
        <div style="font-size:10px;">(M/s Da Foodie Restaurant)</div>
        <div style="font-size:10px;">GSTIN : 23AAUFD7167P1ZK</div>
        <div style="font-size:10px;">Plot no 56/2/110,69,79 Canal Road,</div>
        <div style="font-size:10px;">Bawadiya Kalan, Bhopal</div>
        <div style="font-size:10px;">Contact No : 9244291400</div>
      </div>
      <div class="divider-solid"></div>
      <div class="divider-solid"></div>
      <div class="row"><span>Date: ${dateStr}</span></div>
      <div class="row"><span>Cashier: biller</span><span>Bill No.: ${billLabel}</span></div>
      <div class="divider-solid"></div>
      <div class="grid4"><span class="bold">Item</span><span class="center-t bold">Qty.</span><span class="right bold">Price</span><span class="right bold">Amount</span></div>
      <div class="divider-dash"></div>
      ${orderItemsList.map(item => `<div class="grid4">
        <span style="word-break:break-word;padding-right:4px;">${item.product?.name || 'Product'}</span>
        <span class="center-t">${item.quantity}</span>
        <span class="right">${parseFloat(item.unit_price).toFixed(2)}</span>
        <span class="right">${parseFloat(item.line_total).toFixed(2)}</span>
      </div><div class="gst-line">${item.gst_type || 'GST'} ${parseFloat(item.gst_percentage || 0).toFixed(2)}%: ₹${parseFloat(item.gst_amount || 0).toFixed(2)}</div>`).join('')}
      <div class="divider-dash"></div>
      <div class="row"><span>Total Qty: ${totalQty}</span><span>Sub Total &nbsp;${subtotalAmt.toFixed(2)}</span></div>
      ${taxAmt > 0 ? `<div class="row"><span>GST</span><span>${taxAmt.toFixed(2)}</span></div>` : ''}
      <div class="divider-solid"></div>
      <div class="row"><span>Round off</span><span>${parseFloat(roundOff) >= 0 ? '+'+roundOff : roundOff}</span></div>
      <div class="row grand"><span>Grand Total</span><span>&#8377;${grandRounded}.00</span></div>
      <div class="divider-solid"></div>
      <div style="font-size:11px;">Paid via ${payMethod}</div>
      ${change ? `<div class="row"><span>Change:</span><span>&#8377;${change}</span></div>` : ''}
      <div class="divider-dash"></div>
      <div class="footer">
        <div>FSSAI No : 11420010000718</div>
        <div class="bold">Thank you &amp; Visit Again !!</div>
      </div>
    </body></html>`;
  };

  const previewHtml = React.useMemo(() => {
    const orderItems = items.map(i => ({
      product: { name: i.name },
      quantity: i.quantity,
      unit_price: i.price,
      line_total: parseFloat(i.price) * i.quantity,
      gst_type: i.gst_type,
      gst_percentage: i.gst_percentage,
      gst_amount: parseFloat(i.price) * i.quantity * parseFloat(i.gst_percentage || 0) / 100
    }));
    const paymentLabel = Object.entries(paymentAmounts)
      .filter(([, amount]) => parseFloat(amount || 0) > 0)
      .map(([paymentMethod]) => paymentMethod)
      .join(' + ') || 'CASH';
    return buildReceiptHtml(displayBillNo, orderItems, subtotal, taxAmount, parseFloat(total), paymentLabel, paymentAmounts.CASH);
  }, [items, subtotal, taxAmount, total, paymentAmounts, displayBillNo]);

  const handleCheckout = async () => {
    setErrorMsg(null);
    setErrorField(null);

    if (!billNo || billNo.trim() === '') {
      setErrorField('billNo');
      setErrorMsg('Bill Number is required.');
      return;
    }

    const totalPaid = Object.values(paymentAmounts).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
    if (totalPaid <= 0) {
      setErrorField('payment');
      setErrorMsg('Please add at least one payment.');
      return;
    }
    if (totalPaid < parseFloat(total)) {
      setErrorField('payment');
      setErrorMsg(`Payment is short by ₹${(parseFloat(total) - totalPaid).toFixed(2)}.`);
      return;
    }

    const payload = {
      order_number: billNo.trim(),
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      })),
      payment: Object.entries(paymentAmounts)
        .filter(([, amount]) => parseFloat(amount || 0) > 0)
        .map(([paymentMethod, amount]) => ({
          method: paymentMethod,
          amount: parseFloat(amount).toFixed(2)
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
      const finalTotal = order.total_amount ? parseFloat(order.total_amount) : parseFloat(total);
      const paymentLabel = Object.entries(paymentAmounts)
        .filter(([, amount]) => parseFloat(amount || 0) > 0)
        .map(([paymentMethod]) => paymentMethod)
        .join(' + ');
      const receiptHtml = buildReceiptHtml(finalBillNo, orderItems, finalSubtotal, finalTax, finalTotal, paymentLabel, paymentAmounts.CASH);

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
  const remainingAmount = Math.max(0, parseFloat(total) - totalPaid);

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
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Tax</span><span>₹{taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
                      <span>Total</span><span>₹{parseFloat(total).toFixed(2)}</span>
                    </div>
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
                {totalPaid > parseFloat(total) && (
                  <div className="mt-3 flex justify-between text-sm font-semibold text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <span>Change</span>
                    <span>₹{(totalPaid - parseFloat(total)).toFixed(2)}</span>
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
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-none">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            disabled={createOrderMutation.isPending}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-70 transition-colors"
          >
            {createOrderMutation.isPending ? 'Processing...' : `Complete Sale — ₹${parseFloat(total).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};
