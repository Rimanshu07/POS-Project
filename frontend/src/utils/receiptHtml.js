export const buildReceiptHtml = (
  billLabel,
  orderItemsList,
  subtotalAmt,
  taxAmt,
  totalAmt,
  payMethod,
  tenderedAmt,
  discountAmt = 0,
  orderDate = null,
  totalPaidAmt = null, // Newly added
  allPayments = [] // Newly added to show detailed payments
) => {
  const now = orderDate ? new Date(orderDate) : new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const dateStr = `${dd}/${mm}/${yy} ${hh}:${min}`;
  
  const exactTotal = subtotalAmt - discountAmt + taxAmt;
  const roundOff = (totalAmt - exactTotal).toFixed(2);
  const totalQty = orderItemsList.reduce((s, i) => s + i.quantity, 0);
  
  // If totalPaidAmt is not explicitly passed, we fallback to old logic: it's fully paid if there's a payMethod, otherwise 0
  const actualPaid = totalPaidAmt !== null ? parseFloat(totalPaidAmt) : (payMethod ? totalAmt : 0);
  const dueAmount = Math.max(0, totalAmt - actualPaid);
  
  const change = parseFloat(tenderedAmt || 0) > totalAmt
    ? (parseFloat(tenderedAmt) - totalAmt).toFixed(2)
    : null;

  // Aggregate Tax logic
  const taxMap = { GST: {}, VAT: {} };
  orderItemsList.forEach(item => {
    const rate = parseFloat(item.gst_percentage || 0);
    const type = item.gst_type?.toUpperCase() === 'VAT' ? 'VAT' : 'GST';
    if (rate > 0) {
      if (!taxMap[type][rate]) taxMap[type][rate] = 0;
      taxMap[type][rate] += parseFloat(item.gst_amount || 0);
    }
  });

  let taxLinesHtml = '';
  Object.keys(taxMap.GST).forEach(rate => {
    const halfRate = (parseFloat(rate) / 2).toFixed(1);
    const halfAmt = (taxMap.GST[rate] / 2).toFixed(2);
    taxLinesHtml += `
      <div class="row gst-line"><span>SGST ${halfRate}%</span><span>${halfAmt}</span></div>
      <div class="row gst-line"><span>CGST ${halfRate}%</span><span>${halfAmt}</span></div>
    `;
  });
  Object.keys(taxMap.VAT).forEach(rate => {
    const amt = taxMap.VAT[rate].toFixed(2);
    taxLinesHtml += `
      <div class="row gst-line"><span>VAT ${rate}%</span><span>${amt}</span></div>
    `;
  });

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
      .gst-line { font-size: 11px; padding-left: 20%; }
      .right { text-align: right; } .center-t { text-align: center; }
      .grand { font-size: 14px; font-weight: bold; }
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
      <span style="word-break:break-word;padding-right:4px;">${item.product?.name || item.product_name || 'Product'}</span>
      <span class="center-t">${item.quantity}</span>
      <span class="right">${parseFloat(item.unit_price).toFixed(2)}</span>
      <span class="right">${parseFloat(item.line_total).toFixed(2)}</span>
    </div>`).join('')}
    <div class="divider-dash"></div>
    <div class="row"><span>Total Qty: ${totalQty}</span><span>Sub Total &nbsp;&nbsp;&nbsp;${subtotalAmt.toFixed(2)}</span></div>
    ${discountAmt > 0 ? `<div class="row"><span>Discount</span><span>-&#8377;${parseFloat(discountAmt).toFixed(2)}</span></div>` : ''}
    ${taxLinesHtml}
    <div class="divider-solid"></div>
    <div class="row"><span>Round off</span><span>${parseFloat(roundOff) > 0 ? '+'+roundOff : roundOff}</span></div>
    <div class="row grand"><span>Grand Total</span><span>&#8377;${totalAmt.toFixed(2)}</span></div>
    <div class="divider-solid"></div>
    ${allPayments && allPayments.length > 0 
      ? allPayments.map(p => `<div class="row"><span>Paid (${p.method})</span><span>&#8377;${parseFloat(p.amount).toFixed(2)}</span></div>`).join('')
      : (actualPaid > 0 ? `<div class="row"><span>Paid (${payMethod})</span><span>&#8377;${actualPaid.toFixed(2)}</span></div>` : '')
    }
    ${dueAmount > 0 ? `<div class="row" style="font-weight:bold; font-size:12px;"><span>DUE / PENDING:</span><span>&#8377;${dueAmount.toFixed(2)}</span></div>` : ''}
    ${change ? `<div class="row"><span>Change:</span><span>&#8377;${change}</span></div>` : ''}
    <div class="divider-dash"></div>
    <div class="footer">
      <div>FSSAI No : 11420010000718</div>
      <div class="bold">Thank you &amp; Visit Again !!</div>
    </div>
  </body></html>`;
};
