const orderRepo = require('./order.repository');
const AppError = require('../../utils/AppError');
const { Prisma } = require('@prisma/client');

const getOrders = async (options) => {
  const { orders, total } = await orderRepo.findAll(options);
  return {
    orders,
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    }
  };
};

const getOrderById = async (id) => {
  const order = await orderRepo.findById(id);
  if (!order) {
    throw new AppError('Order not found', 'ORDER_NOT_FOUND', 404);
  }
  return order;
};

const createOrder = async (orderData, userId) => {
  const MAX_RETRIES = 30;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await orderRepo.executeTransaction(async (tx) => {
        // 1. Fetch products and validate
        const productIds = orderData.items.map(i => i.product_id);
        const dbProducts = await orderRepo.getProductsForOrder(tx, productIds);
        
        const productsMap = new Map(dbProducts.map(p => [p.id, p]));

        let subtotal = new Prisma.Decimal(0);
        const orderItems = [];

        for (const item of orderData.items) {
          const dbProduct = productsMap.get(item.product_id);
          if (!dbProduct) {
            throw new AppError(`Product ${item.product_id} not found`, 'PRODUCT_NOT_FOUND', 404);
          }
          if (!dbProduct.is_active || dbProduct.deleted_at !== null) {
            throw new AppError(`Product ${dbProduct.name} is inactive or deleted`, 'VALIDATION_ERROR', 400);
          }

          const quantity = new Prisma.Decimal(item.quantity);
          const lineTotal = dbProduct.price.mul(quantity);
          subtotal = subtotal.add(lineTotal);

          orderItems.push({
            product_id: dbProduct.id,
            quantity: item.quantity,
            unit_price: dbProduct.price, // Snapshot of current price
            discount_amount: new Prisma.Decimal(0), // No discounts in V1 Phase 6
            line_total: lineTotal
          });
        }

        // 2. Financial Calculations
        const taxPercent = new Prisma.Decimal(orderData.tax_percent || '18.00');
        
        // tax_amount = subtotal * (taxPercent / 100)
        const taxAmount = subtotal.mul(taxPercent).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        const totalAmount = subtotal.add(taxAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

        let changeAmount = new Prisma.Decimal(0);
        let amountTendered;

        // 3. Payment Validation
        if (orderData.payment.method === 'CASH') {
          amountTendered = new Prisma.Decimal(orderData.payment.amount_tendered);
          if (amountTendered.lt(totalAmount)) {
            throw new AppError('Amount tendered is less than total amount', 'VALIDATION_ERROR', 400);
          }
          changeAmount = amountTendered.sub(totalAmount);
        } else {
          amountTendered = totalAmount;
        }

        // 4. Order Number Generation / Assignment
        let orderNumber = orderData.order_number;
        if (!orderNumber || String(orderNumber).trim() === '') {
          const today = new Date();
          const datePrefix = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
          orderNumber = await orderRepo.generateOrderNumber(tx, datePrefix);
        }

        // 5. Database Inserts
        const newOrder = await tx.order.create({
          data: {
            order_number: orderNumber,
            status: 'COMPLETED',
            subtotal: subtotal,
            discount_amount: new Prisma.Decimal(0), // Fixed to 0.00
            tax_percent: taxPercent,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            created_by: userId,
            items: {
              create: orderItems
            },
            payments: {
              create: [{
                method: orderData.payment.method,
                amount: totalAmount,
                status: 'PAID'
              }]
            }
          },
          include: {
            items: true,
            payments: true
          }
        });

        await tx.auditLog.create({
          data: {
            user_id: userId,
            action: 'ORDER_CREATED',
            entity: 'ORDER',
            entity_id: newOrder.id,
            metadata: JSON.stringify({ order_number: orderNumber, total: totalAmount.toString() })
          }
        });

        return {
          order: newOrder,
          change_amount: orderData.payment.method === 'CASH' ? changeAmount.toFixed(2) : undefined
        };
      });
    } catch (error) {
      // Retry on:
      // 1. P2002 - Unique constraint violation specifically on order_number
      // 2. P2010 - Raw query error (MySQL Deadlock 1213) from SELECT FOR UPDATE contention
      const isOrderNumberCollision =
        error.code === 'P2002' &&
        (error.meta?.target?.includes('order_number') || (error.message || '').includes('order_number'));

      const isDeadlock =
        (error.code === 'P2010' &&
          (error.meta?.code === 1213 || error.meta?.message?.includes('Deadlock') || (error.message || '').includes('Deadlock'))) ||
        error.code === 'P2034'; // Prisma: write conflict or deadlock during transaction

      if ((isOrderNumberCollision || isDeadlock) && attempt < MAX_RETRIES) {
        // Jitter: random backoff between 10ms and 80ms
        const jitter = Math.floor(Math.random() * 70) + 10;
        await new Promise(r => setTimeout(r, jitter));
        continue;
      }
      if (isOrderNumberCollision || isDeadlock) {
        throw new AppError('High order volume. Please try again.', 'ORDER_CREATION_FAILED', 409);
      }
      throw error;
    }
  }
};

const getOrderInvoice = async (id) => {
  const order = await orderRepo.findById(id);
  if (!order) {
    throw new AppError('Order not found', 'ORDER_NOT_FOUND', 404);
  }

  const payment = order.payments?.[0] || null;

  return {
    invoice_number: order.order_number,
    invoice_date: order.created_at,
    order_id: order.id,
    status: order.status,
    cashier: order.user
      ? { name: order.user.name, role: order.user.role }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      product_name: item.product?.name || `Product #${item.product_id}`,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price).toFixed(2),
      discount_amount: parseFloat(item.discount_amount).toFixed(2),
      line_total: parseFloat(item.line_total).toFixed(2)
    })),
    subtotal: parseFloat(order.subtotal).toFixed(2),
    discount_amount: parseFloat(order.discount_amount).toFixed(2),
    tax_percent: parseFloat(order.tax_percent).toFixed(2),
    tax_amount: parseFloat(order.tax_amount).toFixed(2),
    total_amount: parseFloat(order.total_amount).toFixed(2),
    payment: payment
      ? {
          method: payment.method,
          amount: parseFloat(payment.amount).toFixed(2),
          status: payment.status
        }
      : null
  };
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  getOrderInvoice
};
