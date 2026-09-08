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
    where.status = status;
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
    where.payments = {
      some: {
        status: payment_status.toUpperCase()
      }
    };
  }
  
  if (date_from || date_to) {
    where.created_at = {};
    if (date_from) where.created_at.gte = new Date(date_from);
    if (date_to) where.created_at.lte = new Date(date_to);
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
