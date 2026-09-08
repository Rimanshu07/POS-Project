const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const getTodayMetrics = async (startOfToday, endOfToday) => {
  // Aggregate sales and count
  const orderStats = await prisma.order.aggregate({
    _sum: { total_amount: true },
    _count: { id: true },
    where: {
      status: 'COMPLETED',
      created_at: {
        gte: startOfToday,
        lte: endOfToday
      }
    }
  });

  // Aggregate products sold today (quantity)
  const productStats = await prisma.orderItem.aggregate({
    _sum: { quantity: true },
    where: {
      order: {
        status: 'COMPLETED',
        created_at: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    }
  });

  return {
    todaySales: orderStats._sum.total_amount || new Prisma.Decimal(0),
    todayOrders: orderStats._count.id || 0,
    productsSoldToday: productStats._sum.quantity || 0
  };
};

const getTopProducts = async (startDate, endDate) => {
  const result = await prisma.$queryRaw`
    SELECT 
      p.id AS product_id, 
      p.name AS product_name, 
      CAST(COALESCE(SUM(oi.quantity), 0) AS SIGNED) AS quantity_sold
    FROM \`order_items\` oi
    JOIN \`orders\` o ON oi.order_id = o.id
    JOIN \`products\` p ON oi.product_id = p.id
    WHERE o.status = 'COMPLETED'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY p.id, p.name
    ORDER BY quantity_sold DESC
    LIMIT 5
  `;
  return result.map(r => ({ ...r, quantity_sold: Number(r.quantity_sold) }));
};

const getTopCategories = async (startDate, endDate) => {
  const result = await prisma.$queryRaw`
    SELECT 
      c.id AS category_id, 
      c.name AS category_name, 
      CAST(COALESCE(SUM(oi.quantity), 0) AS SIGNED) AS quantity_sold
    FROM \`order_items\` oi
    JOIN \`orders\` o ON oi.order_id = o.id
    JOIN \`products\` p ON oi.product_id = p.id
    JOIN \`categories\` c ON p.category_id = c.id
    WHERE o.status = 'COMPLETED'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY c.id, c.name
    ORDER BY quantity_sold DESC
    LIMIT 5
  `;
  return result.map(r => ({ ...r, quantity_sold: Number(r.quantity_sold) }));
};

const getPaymentBreakdown = async (startDate, endDate) => {
  const result = await prisma.payment.groupBy({
    by: ['method'],
    _sum: {
      amount: true
    },
    where: {
      status: 'PAID',
      order: {
        status: 'COMPLETED',
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    }
  });
  return result;
};

const getSalesTrend = async (startDate, endDate) => {
  // Use DATE(o.created_at) in both SELECT and GROUP BY to satisfy only_full_group_by.
  // Date formatting from YYYY-MM-DD is handled in JS layer.
  const result = await prisma.$queryRaw`
    SELECT 
      DATE(o.created_at) AS date,
      COALESCE(SUM(o.total_amount), 0) AS sales
    FROM \`orders\` o
    WHERE o.status = 'COMPLETED'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY DATE(o.created_at)
    ORDER BY DATE(o.created_at) ASC
  `;
  // Convert Date objects to ISO string format YYYY-MM-DD
  return result.map(row => ({
    ...row,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date
  }));
};

module.exports = {
  getTodayMetrics,
  getTopProducts,
  getTopCategories,
  getPaymentBreakdown,
  getSalesTrend
};
