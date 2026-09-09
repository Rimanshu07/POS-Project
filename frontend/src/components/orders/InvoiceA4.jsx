import React from "react";

// A4-style formal invoice — Sherwoods Restaurant
export const InvoiceA4 = ({ invoice }) => {
  if (!invoice) return null;

  const formatCurrency = (value) =>
    `₹${parseFloat(value || 0).toFixed(2)}`;

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

  const subtotal = parseFloat(invoice.subtotal || 0);
  const taxAmount = parseFloat(invoice.tax_amount || 0);
  const discountAmount = parseFloat(invoice.discount_amount || 0);
  const totalAmount = parseFloat(invoice.total_amount || 0);
  const grandTotalRounded = Math.round(totalAmount);
  const roundOff = grandTotalRounded - totalAmount;
  const totalQty = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  const payments = invoice.payments || (invoice.payment ? [invoice.payment] : []);

  return (
    <div
      id="invoice-print-area"
      className="invoice-a4-document mx-auto overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", width: "100%", maxWidth: "794px", boxSizing: "border-box", padding: "40px" }}
    >
      {/* Header */}
      <div className="invoice-a4-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" }}>
            Sherwoods Restaurant
          </h1>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#6B7280" }}>(M/s Da Foodie Restaurant)</p>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#6B7280" }}>GSTIN: 23AAUFD7167P1ZK</p>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#6B7280" }}>Plot no 56/2/110,69,79 Canal Road, Bawadiya Kalan, Bhopal</p>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#6B7280" }}>Contact: 9244291400</p>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#6B7280" }}>FSSAI No: 11420010000718</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-block",
              background: "#1F2937",
              color: "#fff",
              padding: "6px 18px",
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: "20px",
              letterSpacing: "2px",
              marginBottom: "10px",
            }}
          >
            INVOICE
          </div>
          <p style={{ margin: "4px 0 2px", fontSize: "12px", color: "#6B7280" }}>
            <span style={{ fontWeight: "600", color: "#374151" }}>Bill No:</span> {invoice.invoice_number}
          </p>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#6B7280" }}>
            <span style={{ fontWeight: "600", color: "#374151" }}>Date:</span> {formatDate(invoice.invoice_date)}
          </p>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#6B7280" }}>
            <span style={{ fontWeight: "600", color: "#374151" }}>Time:</span> {formatTime(invoice.invoice_date)}
          </p>
          {invoice.cashier && (
            <p style={{ margin: "2px 0", fontSize: "12px", color: "#6B7280" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Cashier:</span> {invoice.cashier.name}
            </p>
          )}
        </div>
      </div>

      <div style={{ borderTop: "2px solid #1F2937", marginBottom: "24px" }} />

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#1F2937", color: "#fff" }}>
            <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600" }}>Item</th>
            <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600" }}>Qty.</th>
            <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600" }}>Price</th>
            <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600" }}>GST</th>
            <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => {
            const itemDiscount = parseFloat(item.discount_amount || 0);
            return (
              <React.Fragment key={item.id}>
                <tr style={{ background: index % 2 === 0 ? "#F9FAFB" : "#fff", borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ padding: "9px 12px", fontWeight: "500", color: "#111827" }}>{item.product_name}</td>
                  <td style={{ padding: "9px 12px", textAlign: "center", color: "#374151" }}>{item.quantity}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "#374151" }}>
                    {parseFloat(item.unit_price || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "#374151" }}>
                    {item.gst_type || "GST"} {parseFloat(item.gst_percentage || 0).toFixed(2)}%
                    <br />₹{parseFloat(item.gst_amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: "600", color: "#111827" }}>
                    {parseFloat(item.line_total || 0).toFixed(2)}
                  </td>
                </tr>
                {itemDiscount > 0 && (
                  <tr style={{ background: index % 2 === 0 ? "#F9FAFB" : "#fff", borderBottom: "1px solid #E5E7EB" }}>
                    <td colSpan="4" style={{ padding: "2px 12px 6px 24px", color: "#6B7280", fontSize: "12px" }}>
                      (D) Discount
                    </td>
                    <td style={{ padding: "2px 12px 6px", textAlign: "right", color: "#DC2626", fontSize: "12px" }}>
                      ({itemDiscount.toFixed(2)})
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Totals + Payment */}
      <div className="invoice-a4-totals" style={{ display: "flex", justifyContent: "flex-end", gap: "32px" }}>
        {/* Payment box */}
        {payments.length > 0 && (
          <div
            style={{
              flex: "1",
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "16px 20px",
              fontSize: "13px",
              alignSelf: "flex-start",
              maxWidth: "220px",
            }}
          >
            <p style={{ fontWeight: "700", color: "#374151", margin: "0 0 10px", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
              Payment Details
            </p>
            {payments.map((payment) => (
              <div key={payment.method} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#6B7280" }}>{payment.method}:</span>
                <span style={{ fontWeight: "600", color: "#111827" }}>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", borderTop: "1px solid #E5E7EB", paddingTop: "6px" }}>
              <span style={{ color: "#6B7280" }}>Total Paid:</span>
              <span style={{ fontWeight: "600", color: "#111827" }}>{formatCurrency(payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6B7280" }}>Status:</span>
              <span style={{ fontWeight: "600", color: "#16A34A" }}>{payments.every((payment) => payment.status === "PAID") ? "PAID" : "PENDING"}</span>
            </div>
          </div>
        )}

        {/* Amounts summary */}
        <div className="invoice-a4-summary" style={{ minWidth: "260px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ color: "#6B7280" }}>Total Qty: {totalQty} &nbsp;&nbsp; Sub Total</span>
            <span style={{ color: "#374151" }}>{subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
              <span style={{ color: "#6B7280" }}>Item wise Discount</span>
              <span style={{ color: "#DC2626" }}>({discountAmount.toFixed(2)})</span>
            </div>
          )}

          {taxAmount > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ color: "#6B7280" }}>GST ({parseFloat(invoice.tax_percent || 0).toFixed(2)}%)</span>
                <span style={{ color: "#374151" }}>{taxAmount.toFixed(2)}</span>
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ color: "#6B7280" }}>Round off</span>
            <span style={{ color: "#374151" }}>{parseFloat(roundOff) >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0 0",
              borderTop: "2px solid #1F2937",
              marginTop: "4px",
            }}
          >
            <span style={{ fontWeight: "800", fontSize: "16px", color: "#111827" }}>Grand Total</span>
            <span style={{ fontWeight: "800", fontSize: "18px", color: "#111827" }}>
              ₹{grandTotalRounded}.00
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "40px", borderTop: "1px solid #E5E7EB", paddingTop: "16px", textAlign: "center", fontSize: "12px", color: "#9CA3AF" }}>
        <p style={{ margin: 0, fontWeight: "600", color: "#374151" }}>Thank you &amp; Visit Again !!</p>
        <p style={{ margin: "4px 0 0" }}>This is a computer-generated invoice. FSSAI No: 11420010000718</p>
      </div>
    </div>
  );
};
