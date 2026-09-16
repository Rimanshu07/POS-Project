const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const executeTransaction = async (callback) => {
  return await prisma.$transaction(callback, {
    maxWait: 5000, // default is 2000
    timeout: 10000 // default is 5000
  });
};

const findAll = async ({ skip, take, search, status, date_from, date_to, reference_no, invoice_no, payment_status }) => {
  const where = {};
  
  if (status) {
    const s = status.toUpperCase();
    if (s === 'CANCELLED') {
      where.status = 'CANCELLED';
    } else if (s === 'COMPLETED') {
      const result = await prisma.$queryRaw`
        SELECT o.id FROM \`orders\` o
        LEFT JOIN \`payments\` p ON o.id = p.order_id AND p.status = 'PAID'
        WHERE o.status = 'COMPLETED'
        GROUP BY o.id, o.total_amount
        HAVING COALESCE(SUM(p.amount), 0) >= o.total_amount
      `;
      where.id = { in: result.map(r => r.id) };
    } else if (s === 'PARTIAL') {
      const result = await prisma.$queryRaw`
        SELECT o.id FROM \`orders\` o
        LEFT JOIN \`payments\` p ON o.id = p.order_id AND p.status = 'PAID'
        WHERE o.status = 'COMPLETED'
        GROUP BY o.id, o.total_amount
        HAVING COALESCE(SUM(p.amount), 0) > 0 AND COALESCE(SUM(p.amount), 0) < o.total_amount
      `;
      where.id = { in: result.map(r => r.id) };
    } else if (s === 'PENDING') {
      const result = await prisma.$queryRaw`
        SELECT o.id FROM \`orders\` o
        LEFT JOIN \`payments\` p ON o.id = p.order_id AND p.status = 'PAID'
        WHERE o.status = 'COMPLETED'
        GROUP BY o.id, o.total_amount
        HAVING COALESCE(SUM(p.amount), 0) = 0
      `;
      const pendingStatusOrders = await prisma.order.findMany({ where: { status: 'PENDING' }, select: { id: true } });
      where.id = { in: [...result.map(r => r.id), ...pendingStatusOrders.map(r => r.id)] };
    }
  }
  if (search) {
    where.order_number = { contains: search };
  }
  if (reference_no) {
    where.reference_no = { contains: reference_no };
  }
  if (invoice_no) {
    where.invoice_no = { contains: invoice_no };
  }
  if (payment_status) {
    const pStatus = payment_status.toUpperCase();
    if (pStatus === 'PAID') {
      const result = await prisma.$queryRaw`
        SELECT o.id FROM \`orders\` o
        LEFT JOIN \`payments\` p ON o.id = p.order_id AND p.status = 'PAID'
        GROUP BY o.id, o.total_amount
        HAVING COALESCE(SUM(p.amount), 0) >= o.total_amount
      `;
      where.id = { ...(where.id || {}), in: result.map(r => r.id) };
    } else if (pStatus === 'PARTIAL') {
      const result = await prisma.$queryRaw`
        SELECT o.id FROM \`orders\` o
        LEFT JOIN \`payments\` p ON o.id = p.order_id AND p.status = 'PAID'
        GROUP BY o.id, o.total_amount
        HAVING COALESCE(SUM(p.amount), 0) > 0 AND COALESCE(SUM(p.amount), 0) < o.total_amount
      `;
      where.id = { ...(where.id || {}), in: result.map(r => r.id) };
    } else if (pStatus === 'PENDING') {
      const result = await prisma.$queryRaw`
        SELECT o.id FROM \`orders\` o
        LEFT JOIN \`payments\` p ON o.id = p.order_id AND p.status = 'PAID'
        GROUP BY o.id, o.total_amount
        HAVING COALESCE(SUM(p.amount), 0) = 0
      `;
      where.id = { ...(where.id || {}), in: result.map(r => r.id) };
    } else if (pStatus === 'FAILED' || pStatus === 'REFUNDED') {
      where.payments = { some: { status: pStatus } };
    }
  }
  
  if (date_from || date_to) {
    where.created_at = {};
    if (date_from) {
      where.created_at.gte = new Date(date_from.trim());
    }
    if (date_to) {
      const dTo = new Date(date_to.trim());
      dTo.setDate(dTo.getDate() + 1);
      where.created_at.lt = dTo;
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true }
            }
          }
        },
        payments: true,
        user: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.order.count({ where })
  ]);

  return { orders, total };
};

const findById = async (id) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true }
          }
        }
      },
      payments: true,
      user: {
        select: { id: true, name: true, role: true } // Avoid password_hash
      }
    }
  });
};

const getProductsForOrder = async (tx, productIds) => {
  return await tx.product.findMany({
    where: {
      id: { in: productIds }
    }
  });
};

const generateOrderNumber = async (tx, datePrefix) => {
  // MySQL-safe serialized sequence using SELECT ... FOR UPDATE.
  // This acquires a row-level lock on the latest order row for that date,
  // preventing concurrent transactions from reading the same max value.
  const prefix = `ORD-${datePrefix}-`;

  const rows = await tx.$queryRaw`
    SELECT order_number
    FROM \`orders\`
    WHERE order_number LIKE ${prefix + '%'}
    ORDER BY id DESC
    LIMIT 1
    FOR UPDATE
  `;

  let nextSequence = 1;
  if (rows.length > 0 && rows[0].order_number) {
    const parts = rows[0].order_number.split('-');
    if (parts.length === 3) {
      nextSequence = parseInt(parts[2], 10) + 1;
    }
  }

  const paddedSequence = String(nextSequence).padStart(6, '0');
  return `${prefix}${paddedSequence}`;
};

module.exports = {
  prisma,
  executeTransaction,
  findAll,
  findById,
  getProductsForOrder,
  generateOrderNumber
};
