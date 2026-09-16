import React, { useRef, useState } from 'react';
import { useOrderDetails } from '../../hooks/useOrders';
import { X, Printer, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { Receipt } from './Receipt';
import { InvoiceModal } from './InvoiceModal';
import clsx from 'clsx';
import { buildReceiptHtml } from '../../utils/receiptHtml';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';

export const OrderDetailsModal = ({ isOpen, onClose, orderId }) => {
  const { data, isLoading, isError } = useOrderDetails(orderId);
  const printRef = useRef(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const navigate = useNavigate();
  const { setItems, setDiscount, setPendingOrderNumber, setAlreadyPaid, setExistingPayments } = useCartStore();

  if (!isOpen) return null;

  const order = data?.order;
  const itemTaxTotal = order?.items?.reduce(
    (sum, item) => sum + parseFloat(item.gst_amount || 0),
    0
  ) || 0;

  // Separate GST and VAT totals
  const { gstTotal, vatTotal } = (order?.items || []).reduce((acc, item) => {
    const amt = parseFloat(item.gst_amount || 0);
    if (item.gst_type?.toUpperCase() === 'VAT') acc.vatTotal += amt;
    else acc.gstTotal += amt;
    return acc;
  }, { gstTotal: 0, vatTotal: 0 });

  const exactTotal = parseFloat(order?.subtotal || 0) - parseFloat(order?.discount_amount || 0) + itemTaxTotal;
  const roundOff = parseFloat(order?.total_amount || 0) - exactTotal;

  // Show Settle button when order is not fully paid
  const totalPaidAmount = (order?.payments || [])
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const isUnpaid = totalPaidAmount < parseFloat(order?.total_amount || 0);

  // Open a dedicated print popup with the receipt HTML so @media print CSS
  // conflicts with the main page don't cause a blank page.
  const handlePrint = () => {
    if (!order) return;
    const payments = order.payments || [];
    
    const paymentLabel = payments.map(p => p.method).join(' + ') || '';
    const cashAmount = payments.find(p => p.method === 'CASH')?.amount || 0;
    
    const receiptHtml = buildReceiptHtml(
      order.order_number,
      order.items,
      parseFloat(order.subtotal),
      parseFloat(order.tax_amount),
      parseFloat(order.total_amount),
      paymentLabel,
      cashAmount,
      parseFloat(order.discount_amount || 0),
      order.created_at,
      totalPaidAmount
    );
      
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  const handleSettle = () => {
    if (!order) return;
    
    // Map order items back to cart items format
    const cartItems = order.items.map(item => ({
      product_id: item.product_id,
      name: item.product?.name || `Product #${item.product_id}`,
      price: item.unit_price,
      quantity: item.quantity,
      gst_type: item.gst_type,
      gst_percentage: item.gst_percentage
    }));
    
    const discountType = order.discount_type || 'FLAT';
    const discountVal = discountType === 'PERCENT'
      ? (order.discount_rate !== undefined && order.discount_rate !== null ? parseFloat(order.discount_rate) : '')
      : (order.discount_amount !== undefined && order.discount_amount !== null ? parseFloat(order.discount_amount) : '');
    
    const validPayments = (order.payments || []).filter(p => p.status === 'PAID');
    const alreadyPaid = validPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    setItems(cartItems);
    setDiscount(discountVal, discountType);
    setPendingOrderNumber(order.order_number);
    setAlreadyPaid(alreadyPaid);
    setExistingPayments(validPayments);
    onClose();
    navigate('/pos', { state: { autoCheckout: true } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-2 sm:p-6 !m-0 print:bg-white print:p-0">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:max-h-[90vh] print:h-auto print:max-h-none print:max-w-none print:rounded-none print:shadow-none">
        
        {/* Header - Hidden when printing */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-3 py-3 print:hidden sm:px-6 sm:py-4">
          <h2 className="min-w-0 text-base font-bold text-gray-900 sm:text-lg">
            Order Details {order ? `- ${order.order_number}` : ''}
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {order && (
              <>
                {isUnpaid && (
                  <button
                    onClick={handleSettle}
                    className="inline-flex items-center rounded-md border border-transparent bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-amber-700 focus:outline-none sm:text-sm animate-pulse shadow-amber-500/50"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Settle Order
                  </button>
                )}
                <button
                  onClick={() => setIsInvoiceOpen(true)}
                  id="order-details-invoice-btn"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none sm:px-3 sm:text-sm"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  Invoice
                </button>
                <button 
                  onClick={handlePrint}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200 focus:outline-none sm:px-3 sm:text-sm"
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
        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-3 print:overflow-visible print:p-0 sm:p-6">
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
                <div className="border border-gray-200 rounded-xl overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>

                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                            {item.product?.name || `Product ID #${item.product_id}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-center">{item.quantity}</td>
                          {/* HISTORICAL UNIT PRICE - AUTHORITATIVE */}
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">₹{parseFloat(item.unit_price).toFixed(2)}</td>

                          <td className="px-4 py-3 text-xs text-gray-500 text-right">
                            {item.gst_type?.toUpperCase() === 'VAT' ? (
                              <span>VAT {parseFloat(item.gst_percentage || 0).toFixed(1)}%: ₹{parseFloat(item.gst_amount || 0).toFixed(2)}</span>
                            ) : (
                              <>
                                CGST {(parseFloat(item.gst_percentage || 0) / 2).toFixed(1)}%: ₹{(parseFloat(item.gst_amount || 0) / 2).toFixed(2)}<br />
                                SGST {(parseFloat(item.gst_percentage || 0) / 2).toFixed(1)}%: ₹{(parseFloat(item.gst_amount || 0) / 2).toFixed(2)}
                              </>
                            )}
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
                        {order.payments.map((payment, idx) => (
                          <div key={payment.id || idx} className="flex justify-between">
                            <span className="text-gray-500">{payment.method}:</span>
                            <span className="font-medium text-gray-900">₹{parseFloat(payment.amount).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="font-semibold text-gray-700">Total Paid:</span>
                          <span className="font-semibold text-gray-900">₹{order.payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Status:</span>
                          <span className={`font-medium ${!isUnpaid ? 'text-green-600' : 'text-amber-600'}`}>
                            {!isUnpaid ? 'PAID' : 'PARTIAL'}
                          </span>
                        </div>
                        {isUnpaid && (
                          <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                            <span className="font-semibold text-red-600">Remaining Due:</span>
                            <span className="font-semibold text-red-600">₹{(parseFloat(order.total_amount) - totalPaidAmount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Status:</span>
                          <span className="font-medium text-amber-600">PENDING (Unpaid)</span>
                        </div>
                        <p className="text-xs text-gray-400">Punched — payment not yet collected</p>
                      </div>
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
                       {parseFloat(order.discount_amount || 0) > 0 && (
                         <div className="flex justify-between text-red-600">
                           <span>Discount:</span>
                           <span className="font-medium">-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                         </div>
                       )}
                       {gstTotal > 0 && (
                         <>
                           <div className="flex justify-between">
                             <span className="text-gray-500">CGST:</span>
                             <span className="font-medium text-gray-900">₹{(gstTotal / 2).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between mt-1">
                             <span className="text-gray-500">SGST:</span>
                             <span className="font-medium text-gray-900">₹{(gstTotal / 2).toFixed(2)}</span>
                           </div>
                         </>
                       )}
                       {vatTotal > 0 && (
                         <div className="flex justify-between mt-1">
                           <span className="text-gray-500">VAT:</span>
                           <span className="font-medium text-gray-900">₹{vatTotal.toFixed(2)}</span>
                         </div>
                       )}
                       {Math.abs(roundOff) > 0.001 && (
                         <div className="flex justify-between mt-1">
                           <span className="text-gray-500">Round Off:</span>
                           <span className="font-medium text-gray-900">{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
                         </div>
                       )}
                       <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                         <span className="font-bold text-gray-900">Final Total:</span>
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
