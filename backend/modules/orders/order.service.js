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

        let totalDiscount = new Prisma.Decimal(orderData.discount_amount || 0);
        let discountType = orderData.discount_type || 'FLAT';
        let discountRate = new Prisma.Decimal(orderData.discount_rate || 0);
        let subtotal = new Prisma.Decimal(0);
        const preDiscountItems = [];

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

          preDiscountItems.push({
            product_id: dbProduct.id,
            quantity: item.quantity,
            unit_price: dbProduct.price,
            line_total: lineTotal,
            gst_type: dbProduct.gst_type || 'GST',
            gst_percentage: new Prisma.Decimal(dbProduct.gst_percentage || 0)
          });
        }

        if (discountType === 'PERCENT') {
          if (discountRate.lt(0) || discountRate.gt(100)) {
            throw new AppError('Percentage discount must be between 0% and 100%', 'VALIDATION_ERROR', 400);
          }
          totalDiscount = subtotal.mul(discountRate).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        } else {
          if (totalDiscount.lt(0)) {
            throw new AppError('Discount amount cannot be negative', 'VALIDATION_ERROR', 400);
          }
          if (totalDiscount.gt(subtotal)) {
            throw new AppError('Discount amount cannot exceed the subtotal', 'VALIDATION_ERROR', 400);
          }
        }

        // Discount is applied to item amount before tax (Subtotal without GST - Discount = Taxable amount)
        // GST / VAT is calculated on the discounted line total
        let remainingDiscount = new Prisma.Decimal(totalDiscount);

        const orderItems = preDiscountItems.map((item, index) => {
          let itemDiscount = new Prisma.Decimal(0);
          if (subtotal.gt(0) && totalDiscount.gt(0)) {
            if (index === preDiscountItems.length - 1) {
              // Last item gets the exact remaining discount to prevent penny rounding differences
              itemDiscount = Prisma.Decimal.max(0, Prisma.Decimal.min(remainingDiscount, item.line_total));
            } else {
              itemDiscount = item.line_total.mul(totalDiscount).div(subtotal).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
            }
            remainingDiscount = remainingDiscount.sub(itemDiscount);
          }
          const discountedLineTotal = Prisma.Decimal.max(0, item.line_total.sub(itemDiscount));
          // GST or VAT is calculated on the discounted line total
          const gstAmount = discountedLineTotal.mul(item.gst_percentage).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
          
          return {
            ...item,
            discount_amount: itemDiscount,
            gst_amount: gstAmount
          };
        });

        // 2. Financial Calculations
        const taxAmount = orderItems.reduce((sum, item) => sum.add(item.gst_amount), new Prisma.Decimal(0))
          .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        const discountedSubtotal = subtotal.sub(totalDiscount);
        const taxPercent = discountedSubtotal.isZero()
          ? new Prisma.Decimal(0)
          : taxAmount.mul(100).div(discountedSubtotal).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        const exactTotal = discountedSubtotal.add(taxAmount);
        let totalAmount = new Prisma.Decimal(Math.max(0, Math.round(exactTotal.toNumber())));

        // Fetch existing order early to include already paid amount in validation
        let orderNumber = orderData.order_number;
        let existingOrder = null;
        let alreadyPaidAmount = new Prisma.Decimal(0);
        
        if (orderNumber && String(orderNumber).trim() !== '') {
          existingOrder = await tx.order.findUnique({ 
            where: { order_number: String(orderNumber).trim() },
            include: { payments: true }
          });
          if (existingOrder) {
            alreadyPaidAmount = (existingOrder.payments || [])
              .filter(p => p.status === 'PAID')
              .reduce((sum, p) => sum.add(new Prisma.Decimal(p.amount)), new Prisma.Decimal(0));
              
            const isFullyPaid = alreadyPaidAmount.gte(existingOrder.total_amount);
            if (isFullyPaid) {
              throw new AppError('This order has already been settled and fully paid.', 'VALIDATION_ERROR', 400);
            }
          }
        }

        const payments = Array.isArray(orderData.payment)
          ? orderData.payment
          : [];
          
        const newPaidAmount = payments.reduce(
          (sum, payment) => sum.add(new Prisma.Decimal(payment.amount)),
          new Prisma.Decimal(0)
        );
        
        if (newPaidAmount.lt(0)) {
          throw new AppError('Payment amount cannot be negative', 'VALIDATION_ERROR', 400);
        }

        const totalPaidSoFar = alreadyPaidAmount.add(newPaidAmount);

        let orderStatus = 'COMPLETED';
        if (totalPaidSoFar.lt(totalAmount)) {
          if (totalPaidSoFar.isZero()) {
            orderStatus = 'COMPLETED';
          } else {
             const floorTotal = new Prisma.Decimal(Math.floor(exactTotal.toNumber()));
             if (totalPaidSoFar.gte(floorTotal)) {
               totalAmount = totalPaidSoFar;
             } else {
               orderStatus = 'COMPLETED';
             }
          }
        } else if (totalPaidSoFar.gt(totalAmount) && totalPaidSoFar.lt(totalAmount.add(1))) {
          // Exact change rounding logic
        }
        
        const cashPayment = payments.find(payment => payment.method === 'CASH');
        const changeAmount = cashPayment && totalPaidSoFar.gt(totalAmount)
          ? totalPaidSoFar.sub(totalAmount)
          : new Prisma.Decimal(0);

        // 4. Order Number Generation
        if (!orderNumber || String(orderNumber).trim() === '') {
          const today = new Date();
          const datePrefix = today.toISOString().split('T')[0].replace(/-/g, '');
          orderNumber = await orderRepo.generateOrderNumber(tx, datePrefix);
        }

        // 5. Database Inserts / Updates
        let finalOrder;
        
        if (existingOrder) {
          // Update existing pending order
          await tx.orderItem.deleteMany({ where: { order_id: existingOrder.id } });
          // DO NOT delete existing payments!
          
          finalOrder = await tx.order.update({
            where: { id: existingOrder.id },
            data: {
              status: orderStatus,
              subtotal: subtotal,
              discount_type: discountType,
              discount_rate: discountRate,
              discount_amount: totalDiscount,
              tax_percent: taxPercent,
              tax_amount: taxAmount,
              total_amount: totalAmount,
              items: {
                create: orderItems
              },
              payments: {
                create: payments.filter(p => new Prisma.Decimal(p.amount).gt(0)).map(payment => ({
                  method: payment.method,
                  amount: new Prisma.Decimal(payment.amount),
                  status: 'PAID'
                }))
              }
            },
            include: {
              items: {
                include: {
                  product: { select: { id: true, name: true } }
                }
              },
              payments: true
            }
          });
        } else {
          // Create new order
          finalOrder = await tx.order.create({
            data: {
              order_number: orderNumber,
              invoice_no: orderNumber,
              reference_no: orderNumber,
              status: orderStatus,
              subtotal: subtotal,
              discount_type: discountType,
              discount_rate: discountRate,
              discount_amount: totalDiscount,
              tax_percent: taxPercent,
              tax_amount: taxAmount,
              total_amount: totalAmount,
              created_by: userId,
              items: {
                create: orderItems
              },
              payments: {
                create: payments.filter(p => new Prisma.Decimal(p.amount).gt(0)).map(payment => ({
                  method: payment.method,
                  amount: new Prisma.Decimal(payment.amount),
                  status: 'PAID'
                }))
              }
            },
            include: {
              items: {
                include: {
                  product: { select: { id: true, name: true } }
                }
              },
              payments: true
            }
          });
        }

        await tx.auditLog.create({
          data: {
            user_id: userId,
            action: 'ORDER_CREATED',
            entity: 'ORDER',
            entity_id: finalOrder.id,
            metadata: JSON.stringify({ order_number: orderNumber, total: totalAmount.toString(), updated: !!existingOrder })
          }
        });

        return {
          order: finalOrder,
          change_amount: changeAmount.gt(0) ? changeAmount.toFixed(2) : undefined
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

  const payments = (order.payments || []).map((payment) => ({
    method: payment.method,
    amount: parseFloat(payment.amount).toFixed(2),
    status: payment.status
  }));

  return {
    invoice_number: order.invoice_no || order.order_number,
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
      line_total: parseFloat(item.line_total).toFixed(2),
      gst_type: item.gst_type,
      gst_percentage: parseFloat(item.gst_percentage || 0).toFixed(2),
      gst_amount: parseFloat(item.gst_amount || 0).toFixed(2)
    })),
    subtotal: parseFloat(order.subtotal).toFixed(2),
    discount_type: order.discount_type || 'FLAT',
    discount_rate: parseFloat(order.discount_rate || 0).toFixed(2),
    discount_amount: parseFloat(order.discount_amount).toFixed(2),
    tax_percent: parseFloat(order.tax_percent).toFixed(2),
    tax_amount: parseFloat(order.tax_amount).toFixed(2),
    total_amount: parseFloat(order.total_amount).toFixed(2),
    payments,
    payment: payments[0] || null
  };
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  getOrderInvoice
};
