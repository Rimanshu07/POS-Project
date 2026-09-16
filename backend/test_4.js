const { PrismaClient } = require('@prisma/client');
const orderService = require('./modules/orders/order.service.js');
const prisma = new PrismaClient();

async function run() {
  try {
    // Find a GST product and a VAT product
    const gstProduct = await prisma.product.findFirst({
      where: { gst_type: 'GST', is_active: true }
    });
    
    const vatProduct = await prisma.product.findFirst({
      where: { gst_type: 'VAT', is_active: true }
    });
    
    if (!gstProduct || !vatProduct) {
      console.log("Could not find both GST and VAT products");
      return;
    }

    const qtyGst = 1;
    const qtyVat = 1;
    const lineTotalGst = parseFloat(gstProduct.price) * qtyGst;
    const lineTotalVat = parseFloat(vatProduct.price) * qtyVat;
    const subtotal = lineTotalGst + lineTotalVat;

    // --- TEST 4: 100% DISCOUNT ---
    console.log(`\n--- Test #4: 100% Discount ---`);
    const orderData4 = {
      items: [
        { product_id: gstProduct.id, quantity: qtyGst },
        { product_id: vatProduct.id, quantity: qtyVat }
      ],
      discount_type: 'PERCENT',
      discount_rate: 100,
      discount_amount: subtotal, // 100% discount
      payment: [{ method: 'CASH', amount: 0 }]
    };

    const result4 = await orderService.createOrder(orderData4, 1);
    const o4 = result4.order;
    
    console.log(`Subtotal: ₹${o4.subtotal}`);
    console.log(`Total Discount: ₹${o4.discount_amount}`);
    
    o4.items.forEach(item => {
      console.log(`  Product: ${item.product.name} (${item.gst_type})`);
      console.log(`    Line Total: ₹${item.line_total}`);
      console.log(`    Allocated Discount: ₹${item.discount_amount}`);
      const taxable = (parseFloat(item.line_total) - parseFloat(item.discount_amount)).toFixed(2);
      console.log(`    Taxable Amount: ₹${taxable}`);
      console.log(`    Tax: ₹${item.gst_amount}`);
    });

    console.log(`GST: ₹${o4.items.filter(i => i.gst_type !== 'VAT').reduce((sum, i) => sum + parseFloat(i.gst_amount), 0)}`);
    console.log(`VAT: ₹${o4.items.filter(i => i.gst_type === 'VAT').reduce((sum, i) => sum + parseFloat(i.gst_amount), 0)}`);
    console.log(`Total Tax: ₹${o4.tax_amount}`);
    console.log(`Final Grand Total: ₹${o4.total_amount}`);

    console.log(`DB discount_type: ${o4.discount_type}`);
    console.log(`DB discount_rate: ${o4.discount_rate}`);
    console.log(`DB discount_amount: ${o4.discount_amount}\n`);

    // --- TEST 4b: 101% DISCOUNT ---
    console.log(`\n--- Test #4b: 101% Discount ---`);
    try {
      const orderData4b = {
        ...orderData4,
        discount_rate: 101,
        discount_amount: subtotal * 1.01
      };
      await orderService.createOrder(orderData4b, 1);
      console.log("FAIL: Backend accepted 101% discount! This is a bug.");
    } catch(err) {
      console.log(`SUCCESS: Backend rejected 101% discount!`);
      console.log(`Error Message: ${err.message}`);
    }

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
