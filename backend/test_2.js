const { PrismaClient } = require('@prisma/client');
const orderService = require('./modules/orders/order.service.js');
const prisma = new PrismaClient();

async function run() {
  try {
    // Find a VAT product
    const vatProduct = await prisma.product.findFirst({
      where: { gst_type: 'VAT', is_active: true }
    });
    
    if (!vatProduct) {
      console.log("No VAT product found");
      return;
    }

    const qty = 2;
    const baseSubtotal = parseFloat(vatProduct.price) * qty;
    const discountAmt = baseSubtotal * 0.05; // 5% discount

    const orderData = {
      items: [
        { product_id: vatProduct.id, quantity: qty }
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
    const item = order.items[0];
    
    console.log(`\n--- Test #2: 5% + VAT ---`);
    console.log(`Product: ${vatProduct.name} (Tax Type: ${item.gst_type} ${item.gst_percentage}%)`);
    console.log(`Quantity: ${qty}`);
    console.log(`Base Price: ₹${vatProduct.price}`);
    console.log(`Subtotal: ${order.subtotal}`);
    console.log(`Discount: ${order.discount_amount}`);
    console.log(`Taxable Amount: ${(parseFloat(order.subtotal) - parseFloat(order.discount_amount)).toFixed(2)}`);
    console.log(`Tax (VAT): ${order.tax_amount}`);
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
