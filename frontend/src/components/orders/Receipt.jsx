import React from 'react';

// This component is specifically styled for printing using @media print.
// In the UI, it's typically hidden or shown in a specific modal container.
export const Receipt = ({ order }) => {
  if (!order) return null;

  const payment = order.payments?.[0];
  
  return (
    <div id="print-receipt" className="p-8 max-w-sm mx-auto bg-white text-black font-mono">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider">Antigravity POS</h2>
        <p className="text-sm mt-1">123 Business Street</p>
        <p className="text-sm">City, State 12345</p>
        <p className="text-sm">Tel: (555) 123-4567</p>
      </div>

      <div className="border-b border-dashed border-gray-400 pb-4 mb-4 text-sm">
        <div className="flex justify-between mb-1">
          <span>Order No:</span>
          <span className="font-semibold">{order.order_number}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Date:</span>
          <span>{new Date(order.created_at).toLocaleString()}</span>
        </div>
        {order.user && (
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{order.user.name}</span>
          </div>
        )}
      </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-dashed border-gray-400">
            <th className="text-left font-semibold py-1">Item</th>
            <th className="text-center font-semibold py-1">Qty</th>
            <th className="text-right font-semibold py-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2 text-left pr-2 break-words">
                {item.product?.name || `Product #${item.product_id}`}
                <div className="text-xs text-gray-500">@ ₹{parseFloat(item.unit_price).toFixed(2)}</div>
              </td>
              <td className="py-2 text-center align-top">{item.quantity}</td>
              <td className="py-2 text-right align-top font-medium">₹{parseFloat(item.line_total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-b border-dashed border-gray-400 pb-4 mb-4 text-sm">
        <div className="flex justify-between mb-1">
          <span>Subtotal:</span>
          <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Tax:</span>
          <span>₹{parseFloat(order.tax_amount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2">
          <span>TOTAL:</span>
          <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      <div className="text-sm mb-8">
        <div className="flex justify-between mb-1 font-semibold">
          <span>Payment ({payment?.method || 'UNKNOWN'}):</span>
          <span>₹{parseFloat(payment?.amount || order.total_amount).toFixed(2)}</span>
        </div>
        {/* Only show amount tendered / change if they exist in the backend schema/response */}
        {payment?.amount_tendered && (
          <div className="flex justify-between mb-1">
            <span>Tendered:</span>
            <span>₹{parseFloat(payment.amount_tendered).toFixed(2)}</span>
          </div>
        )}
        {payment?.change_amount && (
          <div className="flex justify-between mb-1">
            <span>Change:</span>
            <span>₹{parseFloat(payment.change_amount).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="text-center text-sm">
        <p className="font-bold">Thank you for your business!</p>
        <p className="mt-2 text-xs text-gray-500">Please come again</p>
      </div>
    </div>
  );
};
