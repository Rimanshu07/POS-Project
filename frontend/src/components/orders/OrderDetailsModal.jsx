import React, { useRef, useState } from 'react';
import { useOrderDetails } from '../../hooks/useOrders';
import { X, Printer, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { Receipt } from './Receipt';
import { InvoiceModal } from './InvoiceModal';
import clsx from 'clsx';

export const OrderDetailsModal = ({ isOpen, onClose, orderId }) => {
  const { data, isLoading, isError } = useOrderDetails(orderId);
  const printRef = useRef(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  if (!isOpen) return null;

  const order = data?.order;
  const itemTaxTotal = order?.items?.reduce(
    (sum, item) => sum + parseFloat(item.gst_amount || 0),
    0
  ) || 0;
  const itemTaxRate = parseFloat(order?.subtotal || 0) > 0
    ? (itemTaxTotal / parseFloat(order.subtotal)) * 100
    : 0;

  // Open a dedicated print popup with the receipt HTML so @media print CSS
  // conflicts with the main page don't cause a blank page.
  const handlePrint = () => {
    if (!order) return;
    const payment = order.payments?.[0];
    const receiptHtml = `
      <!DOCTYPE html><html><head>
        <title>Receipt - ${order.order_number}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 16px; max-width: 350px; margin: 0 auto; font-size: 12px; color: #000; }
          h2 { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0; }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { text-align: left; padding-bottom: 4px; border-bottom: 1px dashed #000; }
          th.right, td.right { text-align: right; }
          th.center, td.center { text-align: center; }
          td { padding: 3px 0; }
          .total-row { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 16px; font-size: 11px; }
          @media print { body { margin: 0; } }
        </style>
      </head><body>
        <div class="center">
          <h2>POS Receipt</h2>
          <p style="margin:2px 0;font-size:11px;">MULTIPACK SUPREME PLASTIC INDUSTRIES</p>
        </div>
        <div class="divider"></div>
        <div class="row"><span>Order No:</span><span><b>${order.order_number}</b></span></div>
        <div class="row"><span>Date:</span><span>${new Date(order.created_at).toLocaleString('en-IN')}</span></div>
        ${order.user ? `<div class="row"><span>Cashier:</span><span>${order.user.name}</span></div>` : ''}
        <div class="divider"></div>
        <table>
          <thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Amt</th></tr></thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${item.product?.name || 'Product'}<br/><span style="color:#555;font-size:10px;">@ ₹${parseFloat(item.unit_price).toFixed(2)}</span></td>
                <td class="center">${item.quantity}</td>
                <td class="right">₹${parseFloat(item.line_total).toFixed(2)}<br/><span style="color:#555;font-size:10px;">${item.gst_type || 'GST'} ${parseFloat(item.gst_percentage || 0).toFixed(2)}%: ₹${parseFloat(item.gst_amount || 0).toFixed(2)}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="row"><span>Subtotal:</span><span>₹${parseFloat(order.subtotal).toFixed(2)}</span></div>
        <div class="row"><span>Tax:</span><span>₹${parseFloat(order.tax_amount).toFixed(2)}</span></div>
        <div class="row total-row"><span>TOTAL:</span><span>₹${parseFloat(order.total_amount).toFixed(2)}</span></div>
        <div class="divider"></div>
        <div class="row"><span>Payment (${payment?.method || 'N/A'}):</span><span>₹${parseFloat(payment?.amount || order.total_amount).toFixed(2)}</span></div>
        <div class="footer"><b>*** THANK YOU ***</b><br/>Please visit again</div>
      </body></html>`;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 sm:p-6 !m-0 print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-w-none print:shadow-none print:h-auto print:max-h-none print:rounded-none">
        
        {/* Header - Hidden when printing */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">
          <h2 className="text-lg font-bold text-gray-900">
            Order Details {order ? `- ${order.order_number}` : ''}
          </h2>
          <div className="flex items-center space-x-2">
            {order && (
              <>
                <button
                  onClick={() => setIsInvoiceOpen(true)}
                  id="order-details-invoice-btn"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  Invoice
                </button>
                <button 
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none transition-colors"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  Print Receipt
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-md hover:bg-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white print:p-0 print:overflow-visible">
          {isLoading ? (
            <div className="animate-pulse space-y-6 print:hidden">
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          ) : isError || !order ? (
            <div className="text-center py-12 print:hidden">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Failed to load order details</h3>
              <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
            </div>
          ) : (
            <>
              {/* Visible on Screen only */}
              <div className="print:hidden space-y-6">
                
                {/* Status Card */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <div className="flex items-center">
                      {order.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> :
                       order.status === 'CANCELLED' ? <X className="w-5 h-5 text-red-500 mr-2" /> :
                       <Clock className="w-5 h-5 text-yellow-500 mr-2" />}
                      <span className={clsx(
                        "font-bold text-lg",
                        order.status === 'COMPLETED' ? "text-green-700" :
                        order.status === 'CANCELLED' ? "text-red-700" : "text-yellow-700"
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.product?.name || `Product ID #${item.product_id}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-center">{item.quantity}</td>
                          {/* HISTORICAL UNIT PRICE - AUTHORITATIVE */}
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">
                            {item.gst_type || 'GST'} {parseFloat(item.gst_percentage || 0).toFixed(2)}%<br />
                            ₹{parseFloat(item.gst_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">₹{parseFloat(item.line_total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Details */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Payment Details</h3>
                    {order.payments && order.payments.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Method:</span>
                          <span className="font-medium text-gray-900">{order.payments[0].method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount Paid:</span>
                          <span className="font-medium text-gray-900">₹{parseFloat(order.payments[0].amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="font-medium text-green-600">{order.payments[0].status}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No payment records found.</p>
                    )}
                  </div>

                   {/* Financial Summary */}
                   <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                     <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Order Summary</h3>
                     <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span className="text-gray-500">Subtotal:</span>
                         <span className="font-medium text-gray-900">₹{parseFloat(order.subtotal).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-500">GST (item-wise {itemTaxRate.toFixed(2)}%):</span>
                         <span className="font-medium text-gray-900">₹{itemTaxTotal.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                         <span className="font-bold text-gray-900">Total:</span>
                         <span className="font-bold text-gray-900 text-lg">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                       </div>
                     </div>
                   </div>
                </div>
              </div>

              {/* Receipt wrapper - ONLY visible when printing */}
              <div className="hidden print:block" ref={printRef}>
                <Receipt order={order} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceOpen && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          orderId={orderId}
        />
      )}
    </div>
  );
};
