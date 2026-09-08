import React from "react";

// A4-style professional invoice — distinct from the thermal Receipt component.
// Used for downloading/printing a formal invoice document (not a till receipt).
export const InvoiceA4 = ({ invoice }) => {
  if (!invoice) return null;

  const formatCurrency = (value) =>
    `₹${parseFloat(value).toFixed(2)}`;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      id="invoice-print-area"
      className="bg-white text-gray-900 mx-auto border border-gray-200 shadow-sm rounded-lg overflow-hidden"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: "794px", padding: "48px" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#4F46E5", margin: 0, letterSpacing: "-0.5px" }}>
            Restaurant POS
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B7280" }}>123 Business Street, City, State 110001</p>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6B7280" }}>Tel: (555) 123-4567 | GSTIN: 27AAAPG1234F1Z5</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-block",
              background: "#EEF2FF",
              color: "#4F46E5",
              padding: "6px 18px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "22px",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}
          >
            INVOICE
          </div>
          <p style={{ margin: "6px 0 2px", fontSize: "13px", color: "#6B7280" }}>
            <span style={{ fontWeight: "600", color: "#374151" }}>Invoice No:</span> {invoice.invoice_number}
          </p>
          <p style={{ margin: "2px 0", fontSize: "13px", color: "#6B7280" }}>
            <span style={{ fontWeight: "600", color: "#374151" }}>Date:</span> {formatDate(invoice.invoice_date)}
          </p>
          <p style={{ margin: "2px 0", fontSize: "13px", color: "#6B7280" }}>
            <span style={{ fontWeight: "600", color: "#374151" }}>Time:</span> {formatTime(invoice.invoice_date)}
          </p>
          {invoice.cashier && (
            <p style={{ margin: "2px 0", fontSize: "13px", color: "#6B7280" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Cashier:</span> {invoice.cashier.name}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "2px solid #4F46E5", marginBottom: "32px" }} />

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "32px", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#4F46E5", color: "#fff" }}>
            <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: "600" }}>#</th>
            <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: "600" }}>Item Description</th>
            <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: "600" }}>Qty</th>
            <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: "600" }}>Unit Price</th>
            <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: "600" }}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr
              key={item.id}
              style={{ background: index % 2 === 0 ? "#F9FAFB" : "#fff", borderBottom: "1px solid #E5E7EB" }}
            >
              <td style={{ padding: "10px 14px", color: "#9CA3AF" }}>{index + 1}</td>
              <td style={{ padding: "10px 14px", fontWeight: "500", color: "#111827" }}>{item.product_name}</td>
              <td style={{ padding: "10px 14px", textAlign: "center", color: "#374151" }}>{item.quantity}</td>
              <td style={{ padding: "10px 14px", textAlign: "right", color: "#374151" }}>
                {formatCurrency(item.unit_price)}
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "600", color: "#111827" }}>
                {formatCurrency(item.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals + Payment */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "32px" }}>
        {invoice.payment && (
          <div
            style={{
              flex: "1",
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "18px 22px",
              fontSize: "13px",
              alignSelf: "flex-start",
              maxWidth: "240px",
            }}
          >
            <p style={{ fontWeight: "700", color: "#374151", margin: "0 0 12px", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
              Payment Details
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#6B7280" }}>Method:</span>
              <span style={{ fontWeight: "600", color: "#111827" }}>{invoice.payment.method}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#6B7280" }}>Amount Paid:</span>
              <span style={{ fontWeight: "600", color: "#111827" }}>{formatCurrency(invoice.payment.amount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6B7280" }}>Status:</span>
              <span style={{ fontWeight: "600", color: "#16A34A" }}>{invoice.payment.status || 'Completed'}</span>
            </div>
          </div>
        )}

        <div style={{ minWidth: "260px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ color: "#6B7280" }}>Subtotal</span>
            <span style={{ color: "#374151" }}>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {parseFloat(invoice.discount_amount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F3F4F6" }}>
              <span style={{ color: "#6B7280" }}>Discount</span>
              <span style={{ color: "#DC2626" }}>-{formatCurrency(invoice.discount_amount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ color: "#6B7280" }}>GST / Tax</span>
            <span style={{ color: "#374151" }}>{formatCurrency(invoice.tax_amount)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0 0",
              borderTop: "2px solid #4F46E5",
              marginTop: "4px",
            }}
          >
            <span style={{ fontWeight: "800", fontSize: "16px", color: "#111827" }}>TOTAL DUE</span>
            <span style={{ fontWeight: "800", fontSize: "18px", color: "#4F46E5" }}>
              {formatCurrency(invoice.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "56px", borderTop: "1px solid #E5E7EB", paddingTop: "20px", textAlign: "center", fontSize: "12px", color: "#9CA3AF" }}>
        <p style={{ margin: 0, fontWeight: "600", color: "#6B7280" }}>Thank you for your business!</p>
        <p style={{ margin: "4px 0 0" }}>This is a computer-generated invoice and does not require a signature.</p>
        <p style={{ margin: "4px 0 0" }}>For queries, contact us at: support@restaurantpos.com</p>
      </div>
    </div>
  );
};
