import React from "react";

// Thermal Receipt style invoice matching pos1 UI
export const Invoice = ({ invoice }) => {
  if (!invoice) return null;

  const formatCurrency = (value) =>
    `₹${parseFloat(value).toFixed(2)}`;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      id="invoice-print-area"
      className="bg-white text-gray-900 mx-auto"
      style={{ 
        fontFamily: "'Courier New', Courier, monospace", 
        width: "100%", 
        maxWidth: "350px", // 80mm thermal receipt width
        padding: "16px",
        fontSize: "12px",
        lineHeight: "1.4"
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 4px 0", background: "#000", color: "#fff", display: "inline-block", padding: "2px 8px" }}>
          24 Sell POS Printer
        </h1>
        <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "4px 0 2px 0", textTransform: "uppercase" }}>
          MULTIPACK SUPREME PLASTIC INDUSTRIES
        </h2>
        <p style={{ margin: "2px 0", fontSize: "11px" }}>Shop No X, Main Market, City</p>
        <p style={{ margin: "2px 0", fontSize: "11px" }}>Email: pos@example.com</p>
        <p style={{ margin: "2px 0", fontSize: "11px" }}>Tel: 9876543210</p>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Meta Info */}
      <div style={{ marginBottom: "8px", fontSize: "11px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Invoice:</span>
          <span style={{ fontWeight: "bold" }}>{invoice.invoice_number}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Date:</span>
          <span>{formatDate(invoice.invoice_date)} {formatTime(invoice.invoice_date)}</span>
        </div>
        {invoice.cashier && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Cashier:</span>
            <span>{invoice.cashier.name}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "8px" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", paddingBottom: "4px", borderBottom: "1px dashed #000" }}>Item</th>
            <th style={{ textAlign: "right", paddingBottom: "4px", borderBottom: "1px dashed #000" }}>Price</th>
            <th style={{ textAlign: "right", paddingBottom: "4px", borderBottom: "1px dashed #000" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <React.Fragment key={item.id}>
          <tr>
            <td colSpan="3" style={{ paddingTop: "4px", fontWeight: "bold" }}>{item.product_name}</td>
          </tr>
          <tr>
            <td style={{ paddingBottom: "4px", color: "#555" }}>Qty: {item.quantity}</td>
            <td style={{ textAlign: "right", paddingBottom: "4px" }}>{formatCurrency(item.unit_price)}</td>
            <td style={{ textAlign: "right", paddingBottom: "4px", fontWeight: "bold" }}>{formatCurrency(item.line_total)}</td>
          </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Totals */}
      <div style={{ fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
          <span>Total Items:</span>
          <span>{invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        {parseFloat(invoice.discount_amount) > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
            <span>Discount:</span>
            <span>-{formatCurrency(invoice.discount_amount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
          <span>Tax:</span>
          <span>{formatCurrency(invoice.tax_amount)}</span>
        </div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", fontWeight: "bold", fontSize: "14px" }}>
          <span>GRAND TOTAL:</span>
          <span>{formatCurrency(invoice.total_amount)}</span>
        </div>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Payment Details */}
      {invoice.payment && (
        <div style={{ fontSize: "11px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Paid by:</span>
            <span>{invoice.payment.method}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Amount Paid:</span>
            <span>{formatCurrency(invoice.payment.amount)}</span>
          </div>
          {invoice.payment.amount > invoice.total_amount && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Change:</span>
              <span>{formatCurrency(invoice.payment.amount - invoice.total_amount)}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "11px", marginTop: "16px" }}>
        <p style={{ margin: "2px 0", fontWeight: "bold" }}>*** THANK YOU ***</p>
        <p style={{ margin: "2px 0" }}>Please visit again</p>
      </div>
    </div>
  );
};
