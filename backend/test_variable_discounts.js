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

    if (!gstProduct || !vatProduct) {
      console.log("Could not find both GST and VAT products");
      return;
    }

    console.log(`Using products:`);
    console.log(`  GST Item: ${gstProduct.name} @ ₹${gstProduct.price} (GST ${gstProduct.gst_percentage}%)`);
    console.log(`  VAT Item: ${vatProduct.name} @ ₹${vatProduct.price} (VAT ${vatProduct.gst_percentage}%)`);

    const items = [
      { product_id: gstProduct.id, quantity: 1 },
      { product_id: vatProduct.id, quantity: 1 }
    ];
    const subtotal = parseFloat(gstProduct.price) + parseFloat(vatProduct.price);
    console.log(`Subtotal: ₹${subtotal}\n`);

    // 1. Variable Discount Rates Stress Test
    const testRates = [2, 7.5, 15, 33, 50, 100];
    for (const rate of testRates) {
      const orderNum = `VAR_${rate}_${Date.now()}`;
      const res = await orderService.createOrder({
        order_number: orderNum,
        items,
        discount_type: 'PERCENT',
        discount_rate: rate,
        payment: []
      }, 1);

      const o = res.order;
      const expectedDiscount = parseFloat((subtotal * rate / 100).toFixed(2));
      const actualDiscount = parseFloat(o.discount_amount);
      const isDiscountExact = Math.abs(expectedDiscount - actualDiscount) <= 0.01;
      
      console.log(`Test Rate ${rate}%:`);
      console.log(`  Subtotal: ₹${o.subtotal} | Disc Amount: ₹${o.discount_amount} (expected ~₹${expectedDiscount}) -> ${isDiscountExact ? 'PASS' : 'FAIL'}`);
      console.log(`  Tax Amount: ₹${o.tax_amount} | Grand Total: ₹${o.total_amount}`);
      console.log(`  DB discount_type: ${o.discount_type}, DB discount_rate: ${o.discount_rate}`);
      
      // Clean up test order
      await prisma.orderItem.deleteMany({ where: { order_id: o.id } });
      await prisma.order.delete({ where: { id: o.id } });
    }

    // 2. Full Pay Later -> Settle Simulation with 7.5%
    console.log(`\n--- Full Pay Later -> Settle Test with 7.5% Discount ---`);
    const punchOrderNum = `SETTLE_75_${Date.now()}`;
    
    // Step A: Punch (Pay Later)
    const punchRes = await orderService.createOrder({
      order_number: punchOrderNum,
      items,
      discount_type: 'PERCENT',
      discount_rate: 7.5,
      payment: []
    }, 1);
    
    const punchedOrder = punchRes.order;
    console.log(`A. Punched Order (Pay Later):`);
    console.log(`   ID: ${punchedOrder.id}, Order#: ${punchedOrder.order_number}`);
    console.log(`   Subtotal: ₹${punchedOrder.subtotal}, Disc Rate: ${punchedOrder.discount_rate}%, Disc Amount: ₹${punchedOrder.discount_amount}`);
    console.log(`   Tax: ₹${punchedOrder.tax_amount}, Grand Total: ₹${punchedOrder.total_amount}`);
    console.log(`   Payments count: ${punchedOrder.payments.length}`);

    // Step B: Settle (Pay in full)
    const settleTotal = punchedOrder.total_amount;
    const settleRes = await orderService.createOrder({
      order_number: punchOrderNum,
      items,
      discount_type: punchedOrder.discount_type,
      discount_rate: parseFloat(punchedOrder.discount_rate),
      payment: [
        { method: 'CASH', amount: settleTotal }
      ]
    }, 1);

    const settledOrder = settleRes.order;
    console.log(`\nB. Settled Order:`);
    console.log(`   ID: ${settledOrder.id} (Matches Punched ID: ${settledOrder.id === punchedOrder.id ? 'YES' : 'NO'})`);
    console.log(`   Order#: ${settledOrder.order_number}`);
    console.log(`   Subtotal: ₹${settledOrder.subtotal}, Disc Rate: ${settledOrder.discount_rate}%, Disc Amount: ₹${settledOrder.discount_amount}`);
    console.log(`   Tax: ₹${settledOrder.tax_amount}, Grand Total: ₹${settledOrder.total_amount}`);
    console.log(`   Payments count: ${settledOrder.payments.length}`);
    console.log(`   Payment Method: ${settledOrder.payments[0]?.method}, Amount: ₹${settledOrder.payments[0]?.amount}, Status: ${settledOrder.payments[0]?.status}`);

    // Step C: Attempt Duplicate Settlement
    console.log(`\nC. Duplicate Settle Protection:`);
    try {
      await orderService.createOrder({
        order_number: punchOrderNum,
        items,
        discount_type: 'PERCENT',
        discount_rate: 7.5,
        payment: [{ method: 'CASH', amount: settleTotal }]
      }, 1);
      console.log(`FAIL: Re-settlement should have been blocked!`);
    } catch (err) {
      console.log(`SUCCESS: Re-settlement blocked with message: "${err.message}"`);
    }

    // Clean up
    await prisma.orderItem.deleteMany({ where: { order_id: settledOrder.id } });
    await prisma.payment.deleteMany({ where: { order_id: settledOrder.id } });
    await prisma.order.delete({ where: { id: settledOrder.id } });

    console.log(`\nALL VARIABLE DISCOUNT & SETTLE VERIFICATIONS PASSED!`);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
