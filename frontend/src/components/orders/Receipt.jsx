import React from 'react';

// Thermal 80mm receipt — Sherwoods Restaurant format
// Used for POS checkout immediate print
export const Receipt = ({ order }) => {
  if (!order) return null;

  const payments = order.payments || [];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${min}`;
  };

  const subtotal = parseFloat(order.subtotal || 0);
  const taxAmount = parseFloat(order.tax_amount || 0);
  const discountAmount = parseFloat(order.discount_amount || 0);
  const totalAmount = parseFloat(order.total_amount || 0);
  const totalQty = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const grandTotalRounded = Math.round(totalAmount);
  const roundOff = (grandTotalRounded - totalAmount).toFixed(2);

  return (
    <div
      id="print-receipt"
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        width: "100%",
        maxWidth: "300px",
        margin: "0 auto",
        padding: "12px 10px",
        fontSize: "11px",
        lineHeight: "1.5",
        color: "#000",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        <div style={{ fontSize: "10px", marginBottom: "2px" }}>Duplicate</div>
        <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "2px" }}>
          Sherwoods Restaurant
        </div>
        <div style={{ fontSize: "10px" }}>(M/s Da Foodie Restaurant)</div>
        <div style={{ fontSize: "10px" }}>GSTIN : 23AAUFD7167P1ZK</div>
        <div style={{ fontSize: "10px" }}>Plot no 56/2/110,69,79 Canal Road,</div>
        <div style={{ fontSize: "10px" }}>Bawadiya Kalan, Bhopal</div>
        <div style={{ fontSize: "10px" }}>Contact No : 9244291400</div>
      </div>

      <div style={{ borderTop: "1px solid #000", margin: "5px 0" }} />
      <div style={{ borderTop: "1px solid #000", margin: "5px 0" }} />

      {/* Order meta */}
      <div style={{ fontSize: "11px", marginBottom: "2px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Date: {formatDate(order.created_at)}</span>
          <span style={{ fontWeight: "bold" }}>
            {order.order_type ? `${order.order_type}: ${order.table_number || ""}` : ""}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Cashier: {order.user?.name || "biller"}</span>
          <span>Bill No.: {order.invoice_no || order.order_number}</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #000", margin: "5px 0" }} />

      {/* Items header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 30px 55px 50px",
          fontWeight: "bold",
          fontSize: "11px",
          marginBottom: "3px",
        }}
      >
        <span>Item</span>
        <span style={{ textAlign: "center" }}>Qty.</span>
        <span style={{ textAlign: "right" }}>Price</span>
        <span style={{ textAlign: "right" }}>Amount</span>
      </div>

      <div style={{ borderTop: "1px dashed #000", marginBottom: "3px" }} />

      {/* Items */}
      {order.items?.map((item) => (
        <React.Fragment key={item.id}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 30px 55px 50px",
              marginBottom: "1px",
              fontSize: "11px",
            }}
          >
            <span style={{ wordBreak: "break-word", paddingRight: "4px" }}>
              {item.product?.name || `Product #${item.product_id}`}
            </span>
            <span style={{ textAlign: "center" }}>{item.quantity}</span>
            <span style={{ textAlign: "right" }}>{parseFloat(item.unit_price || 0).toFixed(2)}</span>
            <span style={{ textAlign: "right" }}>{parseFloat(item.line_total || 0).toFixed(2)}</span>
          </div>
          <div style={{ fontSize: "10px", paddingLeft: "4px", color: "#333" }}>
            {item.gst_type || "GST"} {parseFloat(item.gst_percentage || 0).toFixed(2)}%: ₹{parseFloat(item.gst_amount || 0).toFixed(2)}
          </div>
        </React.Fragment>
      ))}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Totals */}
      <div style={{ fontSize: "11px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1px" }}>
          <span>Total Qty: {totalQty}</span>
          <div style={{ textAlign: "right" }}>
            <span>Sub Total &nbsp;{subtotal.toFixed(2)}</span>
          </div>
        </div>

        {discountAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1px" }}>
            <span>Item wise Discount</span>
            <span>({discountAmount.toFixed(2)})</span>
          </div>
        )}

        {taxAmount > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1px" }}>
              <span>GST ({parseFloat(order.tax_percent || 0).toFixed(2)}%)</span>
              <span>{taxAmount.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #000", margin: "5px 0" }} />

      {/* Round off & Grand Total */}
      <div style={{ fontSize: "11px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1px" }}>
          <span>Round off</span>
          <span>{parseFloat(roundOff) >= 0 ? `+${roundOff}` : roundOff}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px" }}>
          <span>Grand Total</span>
          <span>₹{grandTotalRounded}.00</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #000", margin: "5px 0" }} />

      {payments.length > 0 && (
        <div style={{ fontSize: "11px", marginBottom: "4px" }}>
          {payments.map((payment) => (
            <div key={payment.id || payment.method}>
              Paid via {payment.method}: ₹{parseFloat(payment.amount || 0).toFixed(2)}
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      <div style={{ textAlign: "center", fontSize: "10px", marginTop: "6px" }}>
        <div>FSSAI No : 11420010000718</div>
        <div style={{ fontWeight: "bold" }}>Thank you &amp; Visit Again !!</div>
      </div>
    </div>
  );
};
