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

    const qtyGst = 1; // e.g. 1
    const qtyVat = 1; // e.g. 1
    
    const lineTotalGst = parseFloat(gstProduct.price) * qtyGst;
    const lineTotalVat = parseFloat(vatProduct.price) * qtyVat;
    
    const subtotal = lineTotalGst + lineTotalVat;
    const discountAmt = parseFloat((subtotal * 0.05).toFixed(2)); // 5% discount rounded exactly

    const orderData = {
      items: [
        { product_id: gstProduct.id, quantity: qtyGst },
        { product_id: vatProduct.id, quantity: qtyVat }
      ],
      discount_type: 'PERCENT',
      discount_rate: 5,
      discount_amount: discountAmt,
      payment: [
        { method: 'CASH', amount: 0 }
      ]
    };

    const result = await orderService.createOrder(orderData, 1);
    const order = result.order;
    
    // Need exact pre-rounding calculation
    // From service: exactTotal = discountedSubtotal.add(taxAmount)
    const discountedSubtotal = parseFloat(order.subtotal) - parseFloat(order.discount_amount);
    const preRoundingTotal = discountedSubtotal + parseFloat(order.tax_amount);

    console.log(`\n--- Test #3: 5% + GST + VAT ---`);
    
    let sumDiscounts = 0;
    let gstSum = 0;
    let vatSum = 0;

    order.items.forEach((item, idx) => {
      console.log(`\nProduct ${idx + 1}:`);
      console.log(`  Name: ${item.product.name}`);
      console.log(`  Tax Type: ${item.gst_type}`);
      console.log(`  Tax Rate: ${item.gst_percentage}%`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Unit Price: ₹${item.unit_price}`);
      console.log(`  Line Total: ₹${item.line_total}`);
      console.log(`  Allocated Discount: ₹${item.discount_amount}`);
      const taxable = (parseFloat(item.line_total) - parseFloat(item.discount_amount)).toFixed(2);
      console.log(`  Taxable Amount: ₹${taxable}`);
      console.log(`  Tax: ₹${item.gst_amount}`);
      
      sumDiscounts += parseFloat(item.discount_amount);
      if (item.gst_type === 'VAT') {
        vatSum += parseFloat(item.gst_amount);
      } else {
        gstSum += parseFloat(item.gst_amount);
      }
    });

    console.log(`\nSubtotal: ₹${order.subtotal}`);
    console.log(`Total Discount: ₹${order.discount_amount}`);
    console.log(`Sum of Item Discounts: ₹${sumDiscounts.toFixed(2)}`);
    console.log(`Taxable Total: ₹${discountedSubtotal.toFixed(2)}`);
    console.log(`GST: ₹${gstSum.toFixed(2)}`);
    console.log(`VAT: ₹${vatSum.toFixed(2)}`);
    console.log(`Total Tax: ₹${order.tax_amount}`);
    console.log(`Pre-Rounding Grand Total: ₹${preRoundingTotal.toFixed(2)}`);
    console.log(`Final Grand Total: ₹${order.total_amount}`);

    console.log(`\nDB discount_type: ${order.discount_type}`);
    console.log(`DB discount_rate: ${order.discount_rate}`);
    console.log(`DB discount_amount: ${order.discount_amount}\n`);

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
