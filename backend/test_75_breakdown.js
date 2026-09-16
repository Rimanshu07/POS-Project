const { PrismaClient } = require('@prisma/client');
const orderService = require('./modules/orders/order.service.js');
const prisma = new PrismaClient();

async function run() {
  try {
    const gstProduct = await prisma.product.findFirst({
      where: { gst_type: 'GST', is_active: true }
    });
    const vatProduct = await prisma.product.findFirst({
      where: { gst_type: 'VAT', is_active: true }
    });

    console.log("Found Products:");
    console.log(`1. ${gstProduct.name} (Price: ₹${gstProduct.price}, Type: ${gstProduct.gst_type}, Rate: ${gstProduct.gst_percentage}%)`);
    console.log(`2. ${vatProduct.name} (Price: ₹${vatProduct.price}, Type: ${vatProduct.gst_type}, Rate: ${vatProduct.gst_percentage}%)`);

    const orderData = {
      order_number: `VERIFY_75_${Date.now()}`,
      items: [
        { product_id: gstProduct.id, quantity: 1 },
        { product_id: vatProduct.id, quantity: 1 }
      ],
      discount_type: 'PERCENT',
      discount_rate: 7.5,
      payment: []
    };

    const res = await orderService.createOrder(orderData, 1);
    const order = res.order;

    console.log("\n================ ACTUAL BACKEND DB ORDER ================");
    console.log(`Order ID: ${order.id}`);
    console.log(`Order Number: ${order.order_number}`);
    console.log(`Subtotal: ₹${order.subtotal}`);
    console.log(`Discount Type: ${order.discount_type}`);
    console.log(`Discount Rate: ${order.discount_rate}%`);
    console.log(`Discount Amount: ₹${order.discount_amount}`);
    
    console.log("\n---------------- ITEM-BY-ITEM BREAKDOWN ----------------");
    let sumItemDiscounts = 0;
    let sumGst = 0;
    let sumVat = 0;
    let sumTaxable = 0;

    order.items.forEach((item, index) => {
      const lineTotal = parseFloat(item.line_total);
      const discount = parseFloat(item.discount_amount);
      const taxable = lineTotal - discount;
      const tax = parseFloat(item.gst_amount);

      sumItemDiscounts += discount;
      sumTaxable += taxable;
      if (item.gst_type === 'VAT') {
        sumVat += tax;
      } else {
        sumGst += tax;
      }

      console.log(`Item #${index + 1}: ${item.product?.name || item.name} (${item.gst_type} @ ${item.gst_percentage}%)`);
      console.log(`   Line Total:        ₹${lineTotal.toFixed(2)}`);
      console.log(`   Allocated Disc:    ₹${discount.toFixed(2)}`);
      console.log(`   Taxable Base:      ₹${taxable.toFixed(2)}`);
      console.log(`   Tax (${item.gst_percentage}%):          ₹${tax.toFixed(2)}`);
    });

    const preRoundingTotal = sumTaxable + sumGst + sumVat;
    const finalTotal = parseFloat(order.total_amount);
    const roundOff = (finalTotal - preRoundingTotal).toFixed(2);

    console.log("\n---------------- TOTALS & RECONCILIATION ----------------");
    console.log(`Sum of Item Discounts: ₹${sumItemDiscounts.toFixed(2)} (Matches Order Discount ₹${order.discount_amount}: ${sumItemDiscounts.toFixed(2) === parseFloat(order.discount_amount).toFixed(2) ? 'YES' : 'NO'})`);
    console.log(`Total Taxable Amount:  ₹${sumTaxable.toFixed(2)}`);
    console.log(`Total GST:             ₹${sumGst.toFixed(2)}`);
    console.log(`Total VAT:             ₹${sumVat.toFixed(2)}`);
    console.log(`Combined Tax:          ₹${(sumGst + sumVat).toFixed(2)} (Matches Order Tax ₹${order.tax_amount}: ${(sumGst + sumVat).toFixed(2) === parseFloat(order.tax_amount).toFixed(2) ? 'YES' : 'NO'})`);
    console.log(`Pre-Rounding Total:    ₹${preRoundingTotal.toFixed(2)}`);
    console.log(`Round Off:             ${parseFloat(roundOff) >= 0 ? '+' : ''}${roundOff}`);
    console.log(`Final Grand Total:     ₹${finalTotal.toFixed(2)}`);

    // Now test buildReceiptHtml with the EXACT items from the backend order!
    console.log("\n---------------- RECEIPT GENERATION TEST ----------------");
    const { buildReceiptHtml } = await import('../frontend/src/utils/receiptHtml.js');
    const receiptHtml = buildReceiptHtml(
      order.order_number,
      order.items,
      parseFloat(order.subtotal),
      parseFloat(order.tax_amount),
      parseFloat(order.total_amount),
      'CASH',
      parseFloat(order.total_amount),
      parseFloat(order.discount_amount)
    );

    const receiptLines = receiptHtml
      .split('\n')
      .map(l => l.trim())
      .filter(l => 
        l.includes('Sub Total') || 
        l.includes('Discount') || 
        l.includes('SGST') || 
        l.includes('CGST') || 
        l.includes('VAT') || 
        l.includes('Round off') || 
        l.includes('Grand Total')
      );
    
    console.log("Lines extracted from generated Receipt HTML:");
    receiptLines.forEach(line => console.log("  ", line));

    // Clean up test order
    await prisma.orderItem.deleteMany({ where: { order_id: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    console.log("\nTest order cleaned up successfully.");

  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
