import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCreateOrder } from '../../hooks/usePOS';

export const CheckoutModal = ({ isOpen, onClose, total }) => {
  const { items, clearCart } = useCartStore();
  const [method, setMethod] = useState('CASH');
  const [amountTendered, setAmountTendered] = useState('');
  const [billNo, setBillNo] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const createOrderMutation = useCreateOrder();

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const taxAmount = parseFloat(total) - subtotal;

  const displayBillNo = billNo || 'NEW_ORDER';
  
  const previewHtml = React.useMemo(() => {
    const orderItems = items.map(i => ({ product: { name: i.name }, quantity: i.quantity, unit_price: i.price, line_total: parseFloat(i.price) * i.quantity }));
    return `<!DOCTYPE html><html><head>
      <title>Receipt - ${displayBillNo}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 16px; max-width: 350px; margin: 0 auto; font-size: 12px; color: #000; background: #fff; }
        .center { text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { text-align: left; padding-bottom: 4px; border-bottom: 1px dashed #000; }
        th.right, td.right { text-align: right; } th.center, td.center { text-align: center; }
        td { padding: 3px 0; } .total-row { font-weight: bold; font-size: 14px; }
        .footer { text-align: center; margin-top: 16px; font-size: 11px; }
      </style>
    </head><body>
      <div class="center"><h2 style="font-size:16px;font-weight:bold;text-transform:uppercase;margin:0 0 4px">POS Receipt</h2>
      <p style="margin:2px 0;font-size:11px;">MULTIPACK SUPREME PLASTIC INDUSTRIES</p></div>
      <div class="divider"></div>
      <div class="row"><span>Bill No:</span><span><b>${displayBillNo}</b></span></div>
      <div class="row"><span>Date:</span><span>${new Date().toLocaleString('en-IN')}</span></div>
      <div class="divider"></div>
      <table><thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Amt</th></tr></thead>
      <tbody>${orderItems.map(item => `<tr>
        <td>${item.product?.name || 'Product'}<br/><span style="color:#555;font-size:10px;">@ \u20b9${parseFloat(item.unit_price).toFixed(2)}</span></td>
        <td class="center">${item.quantity}</td>
        <td class="right">\u20b9${parseFloat(item.line_total).toFixed(2)}</td>
      </tr>`).join('')}</tbody></table>
      <div class="divider"></div>
      <div class="row"><span>Subtotal:</span><span>\u20b9${subtotal.toFixed(2)}</span></div>
      <div class="row"><span>Tax:</span><span>\u20b9${taxAmount.toFixed(2)}</span></div>
      <div class="row total-row"><span>TOTAL:</span><span>\u20b9${parseFloat(total).toFixed(2)}</span></div>
      <div class="divider"></div>
      <div class="row"><span>Payment (${method}):</span><span>\u20b9${method === 'CASH' ? parseFloat(amountTendered || 0).toFixed(2) : parseFloat(total).toFixed(2)}</span></div>
      ${method === 'CASH' && parseFloat(amountTendered || 0) > parseFloat(total) ? `<div class="row"><span>Change:</span><span>\u20b9${(parseFloat(amountTendered || 0) - parseFloat(total)).toFixed(2)}</span></div>` : ''}
      <div class="footer"><b>*** THANK YOU ***</b><br/>Please visit again</div>
    </body></html>`;
  }, [items, subtotal, taxAmount, total, method, amountTendered, displayBillNo]);

  const handleCheckout = async () => {
    setErrorMsg(null);

    if (!billNo || billNo.trim() === '') {
      setErrorMsg('Bill Number is required.');
      return;
    }

    if (method === 'CASH') {
      const tendered = parseFloat(amountTendered);
      const totalAmount = parseFloat(total);
      if (!amountTendered || isNaN(tendered)) {
        setErrorMsg('Amount tendered is required for CASH payment.');
        return;
      }
      if (tendered < totalAmount) {
        setErrorMsg('Amount tendered cannot be less than the total.');
        return;
      }
    }

    const payload = {
      order_number: billNo.trim(),
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      })),
      tax_percent: '18.00',
      payment: {
        method: method,
        ...(method === 'CASH' && { amount_tendered: parseFloat(amountTendered).toFixed(2) })
      }
    };

    try {
      const response = await createOrderMutation.mutateAsync(payload);
      const order = response.order;
      clearCart();
      setIsSuccess(true);

      // We generate the final HTML again to use the real order_number in case billNo was empty
      const finalBillNo = billNo || order.order_number;
      const orderItems = order.items || items.map(i => ({ product: { name: i.name }, quantity: i.quantity, unit_price: i.price, line_total: parseFloat(i.price) * i.quantity }));
      const receiptHtml = `<!DOCTYPE html><html><head>
        <title>Receipt - ${finalBillNo}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 16px; max-width: 350px; margin: 0 auto; font-size: 12px; color: #000; background: #fff; }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { text-align: left; padding-bottom: 4px; border-bottom: 1px dashed #000; }
          th.right, td.right { text-align: right; } th.center, td.center { text-align: center; }
          td { padding: 3px 0; } .total-row { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 16px; font-size: 11px; }
        </style>
      </head><body>
        <div class="center"><h2 style="font-size:16px;font-weight:bold;text-transform:uppercase;margin:0 0 4px">POS Receipt</h2>
        <p style="margin:2px 0;font-size:11px;">MULTIPACK SUPREME PLASTIC INDUSTRIES</p></div>
        <div class="divider"></div>
        <div class="row"><span>Bill No:</span><span><b>${finalBillNo}</b></span></div>
        <div class="row"><span>Date:</span><span>${new Date().toLocaleString('en-IN')}</span></div>
        <div class="divider"></div>
        <table><thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Amt</th></tr></thead>
        <tbody>${orderItems.map(item => `<tr>
          <td>${item.product?.name || 'Product'}<br/><span style="color:#555;font-size:10px;">@ \u20b9${parseFloat(item.unit_price).toFixed(2)}</span></td>
          <td class="center">${item.quantity}</td>
          <td class="right">\u20b9${parseFloat(item.line_total).toFixed(2)}</td>
        </tr>`).join('')}</tbody></table>
        <div class="divider"></div>
        <div class="row"><span>Subtotal:</span><span>\u20b9${subtotal.toFixed(2)}</span></div>
        <div class="row"><span>Tax:</span><span>\u20b9${taxAmount.toFixed(2)}</span></div>
        <div class="row total-row"><span>TOTAL:</span><span>\u20b9${parseFloat(total).toFixed(2)}</span></div>
        <div class="divider"></div>
        <div class="row"><span>Payment (${method}):</span><span>\u20b9${method === 'CASH' ? parseFloat(amountTendered || 0).toFixed(2) : parseFloat(total).toFixed(2)}</span></div>
        ${method === 'CASH' && parseFloat(amountTendered || 0) > parseFloat(total) ? `<div class="row"><span>Change:</span><span>\u20b9${(parseFloat(amountTendered || 0) - parseFloat(total)).toFixed(2)}</span></div>` : ''}
        <div class="footer"><b>*** THANK YOU ***</b><br/>Please visit again</div>
      </body></html>`;

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
            onClick={onClose}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Start New Sale
          </button>
        </div>
      </div>
    );
  }

  const paymentMethods = ['Cash', 'UPI', 'Card', 'NEFT', 'RTGS', 'Others'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#2c3e50] text-white flex-none">
          <h2 className="text-lg font-bold">Checkout</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            
            {/* Left Column - Form */}
            <div className="space-y-4">
               {/* Bill Number */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number <span className="text-red-500">*</span></label>
                 <input
                   type="text"
                   value={billNo}
                   onChange={e => setBillNo(e.target.value)}
                   placeholder="Enter bill number (will print on receipt)"
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                 />
               </div>

              {/* Order Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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
                    const mUpper = m.toUpperCase();
                    const isSelected = method === mUpper;
                    return (
                      <div key={m} className="flex items-center gap-3">
                        <label className="w-16 text-sm text-gray-600 font-medium cursor-pointer flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={isSelected}
                            onChange={() => { setMethod(mUpper); setErrorMsg(null); if (mUpper !== 'CASH') setAmountTendered(total); }}
                            className="text-indigo-600"
                          />
                          {m}
                        </label>
                        {isSelected && (
                          <input
                            type="number"
                            step="0.01"
                            value={mUpper === 'CASH' ? amountTendered : total}
                            readOnly={mUpper !== 'CASH'}
                            onChange={e => { if (mUpper === 'CASH') { setAmountTendered(e.target.value); setErrorMsg(null); } }}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder={mUpper === 'CASH' ? 'Amount received' : ''}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                {method === 'CASH' && amountTendered && parseFloat(amountTendered) >= parseFloat(total) && (
                  <div className="mt-3 flex justify-between text-sm font-semibold text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <span>Change</span>
                    <span>₹{(parseFloat(amountTendered) - parseFloat(total)).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" /> {errorMsg}
                </div>
              )}
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



