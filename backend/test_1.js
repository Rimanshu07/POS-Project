const { PrismaClient } = require('@prisma/client');
const orderService = require('./modules/orders/order.service.js');
const prisma = new PrismaClient();

async function run() {
  try {
    // Find a GST product
    const gstProduct = await prisma.product.findFirst({
      where: { gst_type: 'GST', is_active: true }
    });
    
    if (!gstProduct) {
      console.log("No GST product found");
      return;
    }

    const qty = 2;
    const baseSubtotal = parseFloat(gstProduct.price) * qty;
    const discountAmt = baseSubtotal * 0.05; // 5% discount

    const orderData = {
      items: [
        { product_id: gstProduct.id, quantity: qty }
      ],
      discount_type: 'PERCENT',
      discount_rate: 5,
      discount_amount: discountAmt,
      payment: [
        { method: 'CASH', amount: 0 } // PENDING payment
      ]
    };

    const result = await orderService.createOrder(orderData, 1);
    const order = result.order;
    
    console.log(`\n--- Test #1: 5% + GST ---`);
    console.log(`Product: ${gstProduct.name} @ ₹${gstProduct.price} x ${qty}`);
    console.log(`Subtotal: ${order.subtotal}`);
    console.log(`Discount: ${order.discount_amount}`);
    console.log(`Tax: ${order.tax_amount}`);
    console.log(`Grand Total: ${order.total_amount}`);
    console.log(`DB discount_type: ${order.discount_type}`);
    console.log(`DB discount_rate: ${order.discount_rate}`);
    console.log(`DB discount_amount: ${order.discount_amount}\n`);

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
