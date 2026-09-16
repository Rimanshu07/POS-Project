const { PrismaClient } = require('@prisma/client');
const orderService = require('./modules/orders/order.service.js');
const prisma = new PrismaClient();

async function run() {
  try {
    const gstProduct = await prisma.product.findFirst({
      where: { gst_type: 'GST', is_active: true }
    });
    
    if (!gstProduct) return;

    const qty = 2;
    const baseSubtotal = parseFloat(gstProduct.price) * qty;
    const discountAmt = baseSubtotal * 0.05; // 5% discount
    const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const orderNumber = `TEST-${datePrefix}-${Math.floor(Math.random()*10000)}`;

    console.log(`\n--- Test #5: Pay Later -> Settle -> Paid ---`);
    console.log(`[1] Creating Pay Later Order (Order Number: ${orderNumber})`);
    
    const initialOrderData = {
      order_number: orderNumber,
      items: [{ product_id: gstProduct.id, quantity: qty }],
      discount_type: 'PERCENT',
      discount_rate: 5,
      discount_amount: discountAmt,
      payment: [{ method: 'CASH', amount: 0 }] // Pay later = 0 amount
    };

    const result1 = await orderService.createOrder(initialOrderData, 1);
    const order1 = result1.order;
    console.log(`Order ID: ${order1.id}, Status: ${order1.status}, Subtotal: ₹${order1.subtotal}, Grand Total: ₹${order1.total_amount}`);
    
    // Check DB counts
    let countOrders = await prisma.order.count({ where: { order_number: orderNumber } });
    let countItems = await prisma.orderItem.count({ where: { order_id: order1.id } });
    let countPayments = await prisma.payment.count({ where: { order_id: order1.id } });
    
    console.log(`DB Before Settle -> Orders: ${countOrders}, Items: ${countItems}, Payments: ${countPayments} (Status: ${order1.payments[0]?.status || 'None'})`);

    console.log(`\n[2] Simulating Settle Flow (Updating same order with full payment)`);
    
    const settleOrderData = {
      order_number: orderNumber,
      items: [{ product_id: gstProduct.id, quantity: qty }],
      discount_type: 'PERCENT',
      discount_rate: 5,
      discount_amount: discountAmt,
      payment: [{ method: 'CASH', amount: parseFloat(order1.total_amount) }] // Full Payment
    };

    const result2 = await orderService.createOrder(settleOrderData, 1);
    const order2 = result2.order;
    
    console.log(`Order ID after Settle: ${order2.id}, Status: ${order2.status}, Grand Total: ₹${order2.total_amount}`);
    
    // Check DB counts again
    countOrders = await prisma.order.count({ where: { order_number: orderNumber } });
    countItems = await prisma.orderItem.count({ where: { order_id: order2.id } });
    countPayments = await prisma.payment.count({ where: { order_id: order2.id } });
    
    console.log(`DB After Settle  -> Orders: ${countOrders}, Items: ${countItems}, Payments: ${countPayments} (Status: ${order2.payments[0]?.status})`);

    console.log(`\nDB discount_type: ${order2.discount_type}`);
    console.log(`DB discount_rate: ${order2.discount_rate}`);
    console.log(`DB discount_amount: ${order2.discount_amount}\n`);

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
