const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSalesReport = async (startDate, endDate, groupBy = 'date') => {
  if (groupBy === 'month') {
    const result = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(o.created_at, '%Y-%m') AS date,
        COALESCE(SUM(o.total_amount), 0) AS sales,
        COALESCE(SUM(o.tax_amount), 0) AS tax,
        COUNT(o.id) AS orders_count
      FROM \`orders\` o
      WHERE LOWER(o.status) = 'completed'
        AND o.created_at >= ${startDate}
        AND o.created_at <= ${endDate}
      GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
      ORDER BY date ASC
    `;
    return result.map(row => ({
      ...row,
      orders_count: Number(row.orders_count)
    }));
  } else {
    const result = await prisma.$queryRaw`
      SELECT 
        DATE(o.created_at) AS date,
        COALESCE(SUM(o.total_amount), 0) AS sales,
        COALESCE(SUM(o.tax_amount), 0) AS tax,
        COUNT(o.id) AS orders_count
      FROM \`orders\` o
      WHERE LOWER(o.status) = 'completed'
        AND o.created_at >= ${startDate}
        AND o.created_at <= ${endDate}
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `;
    return result.map(row => ({
      ...row,
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
      orders_count: Number(row.orders_count)
    }));
  }
};

const getProductSalesReport = async (startDate, endDate) => {
  const result = await prisma.$queryRaw`
    SELECT 
      p.id AS product_id, 
      p.name AS product_name, 
      CAST(COALESCE(SUM(oi.quantity), 0) AS SIGNED) AS quantity_sold,
      COALESCE(SUM(oi.line_total), 0) AS total_revenue
    FROM \`order_items\` oi
    JOIN \`orders\` o ON oi.order_id = o.id
    JOIN \`products\` p ON oi.product_id = p.id
    WHERE LOWER(o.status) = 'completed'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY p.id, p.name
    ORDER BY quantity_sold DESC
  `;
  return result.map(r => ({ ...r, quantity_sold: Number(r.quantity_sold) }));
};

const getCategorySalesReport = async (startDate, endDate) => {
  const result = await prisma.$queryRaw`
    SELECT 
      c.id AS category_id, 
      c.name AS category_name, 
      CAST(COALESCE(SUM(oi.quantity), 0) AS SIGNED) AS quantity_sold,
      COALESCE(SUM(oi.line_total), 0) AS total_revenue
    FROM \`order_items\` oi
    JOIN \`orders\` o ON oi.order_id = o.id
    JOIN \`products\` p ON oi.product_id = p.id
    JOIN \`categories\` c ON p.category_id = c.id
    WHERE LOWER(o.status) = 'completed'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY c.id, c.name
    ORDER BY total_revenue DESC
  `;
  return result.map(r => ({ ...r, quantity_sold: Number(r.quantity_sold) }));
};

const getPaymentReport = async (startDate, endDate) => {
  const result = await prisma.payment.groupBy({
    by: ['method'],
    _sum: {
      amount: true
    },
    _count: {
      id: true
    },
    where: {
      status: 'PAID',
      order: {
        status: { equals: 'COMPLETED', mode: 'insensitive' },
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    }
  });
  return result;
};

const getTaxReport = async (startDate, endDate) => {
  const result = await prisma.$queryRaw`
    SELECT 
      DATE(o.created_at) AS date,
      COALESCE(SUM(o.subtotal), 0) AS total_taxable_amount,
      COALESCE(SUM(o.tax_amount), 0) AS total_tax
    FROM \`orders\` o
    WHERE LOWER(o.status) = 'completed'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY DATE(o.created_at)
    ORDER BY date ASC
  `;
  return result.map(row => ({
    ...row,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date
  }));
};

const getDailySalesReport = async (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const result = await prisma.$queryRaw`
    SELECT 
      DATE(o.created_at) AS date,
      COUNT(o.id) AS total_orders,
      COALESCE(SUM(o.total_amount), 0) AS total_grand_total,
      COALESCE(SUM(o.discount_amount), 0) AS total_discount,
      COALESCE(SUM(oi.quantity), 0) AS total_items_sold,
      COALESCE(SUM(o.tax_amount), 0) AS total_tax
    FROM \`orders\` o
    LEFT JOIN \`order_items\` oi ON oi.order_id = o.id
    WHERE LOWER(o.status) = 'completed'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY DATE(o.created_at)
    ORDER BY date ASC
  `;

  const salesMap = new Map();
  result.forEach(row => {
    const dateStr = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
    salesMap.set(dateStr, {
      ...row,
      date: dateStr,
      total_orders: Number(row.total_orders),
      total_grand_total: Number(row.total_grand_total),
      total_discount: Number(row.total_discount),
      total_items_sold: Number(row.total_items_sold),
      total_tax: Number(row.total_tax)
    });
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarData = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const saleData = salesMap.get(dateStr) || null;
    calendarData.push({
      date: dateStr,
      day,
      sale_data: saleData
    });
  }

  return calendarData;
};

const getDailyProductDetails = async (date) => {
  const startDate = new Date(`${date}T00:00:00`);
  const endDate = new Date(`${date}T23:59:59.999`);

  const result = await prisma.$queryRaw`
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      c.name AS category_name,
      COUNT(DISTINCT o.id) AS order_count,
      COALESCE(AVG(oi.unit_price), 0) AS avg_price,
      COALESCE(SUM(oi.quantity), 0) AS total_quantity,
      COALESCE(AVG(oi.gst_percentage), 0) AS tax_rate,
      COALESCE(SUM(oi.gst_amount), 0) AS tax_amount,
      COALESCE(SUM(oi.line_total + oi.gst_amount), 0) AS total_amount
    FROM \`order_items\` oi
    JOIN \`orders\` o ON oi.order_id = o.id
    JOIN \`products\` p ON oi.product_id = p.id
    LEFT JOIN \`categories\` c ON p.category_id = c.id
    WHERE LOWER(o.status) = 'completed'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY p.id, p.name, c.name
    ORDER BY total_amount DESC
  `;

  return result.map(row => ({
    ...row,
    product_id: Number(row.product_id),
    order_count: Number(row.order_count),
    avg_price: Number(row.avg_price),
    total_quantity: Number(row.total_quantity),
    tax_rate: Number(row.tax_rate),
    tax_amount: Number(row.tax_amount),
    total_amount: Number(row.total_amount)
  }));
};

const getMonthlySalesReport = async (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const result = await prisma.$queryRaw`
    SELECT 
      MONTH(o.created_at) AS sale_month,
      COUNT(DISTINCT o.id) AS total_orders,
      COALESCE(SUM(oi.quantity), 0) AS total_items_sold,
      COALESCE(SUM(oi.line_total), 0) AS total_grand_total,
      COALESCE(SUM(o.tax_amount), 0) AS total_tax,
      COALESCE(SUM(o.discount_amount), 0) AS total_discount
    FROM \`orders\` o
    LEFT JOIN \`order_items\` oi ON oi.order_id = o.id
    WHERE LOWER(o.status) = 'completed'
      AND o.created_at >= ${startDate}
      AND o.created_at <= ${endDate}
    GROUP BY MONTH(o.created_at)
    ORDER BY sale_month ASC
  `;

  // MySQL MONTH() returns BigInt — must convert to Number before using as Map key
  const salesMap = new Map();
  result.forEach(row => {
    const monthKey = Number(row.sale_month);
    salesMap.set(monthKey, {
      sale_month: monthKey,
      total_orders: Number(row.total_orders),
      total_items_sold: Number(row.total_items_sold),
      total_grand_total: Number(row.total_grand_total),
      total_tax: Number(row.total_tax),
      total_discount: Number(row.total_discount)
    });
  });

  const monthlyData = [];
  for (let month = 1; month <= 12; month++) {
    monthlyData.push(
      salesMap.get(month) || {
        sale_month: month,
        total_orders: 0,
        total_items_sold: 0,
        total_grand_total: 0,
        total_tax: 0,
        total_discount: 0
      }
    );
  }

  return monthlyData;
};

const getMonthlyProductDetails = async (year, month) => {
  const result = await prisma.$queryRaw`
    SELECT 
      c.name AS category_name,
      p.name AS product_name,
      COUNT(DISTINCT o.id) AS order_count,
      COALESCE(SUM(oi.quantity), 0) AS total_quantity,
      COALESCE(AVG(oi.unit_price), 0) AS avg_price,
      COALESCE(SUM(oi.line_total), 0) AS total_amount
    FROM \`orders\` o
    JOIN \`order_items\` oi ON oi.order_id = o.id
    JOIN \`products\` p ON oi.product_id = p.id
    JOIN \`categories\` c ON p.category_id = c.id
    WHERE LOWER(o.status) = 'completed'
      AND YEAR(o.created_at) = ${year}
      AND MONTH(o.created_at) = ${month}
    GROUP BY c.name, p.name
    ORDER BY total_amount DESC
  `;

  return result.map(r => ({
    ...r,
    order_count: Number(r.order_count),
    total_quantity: Number(r.total_quantity),
    avg_price: Number(r.avg_price),
    total_amount: Number(r.total_amount)
  }));
};

module.exports = {
  getSalesReport,
  getProductSalesReport,
  getCategorySalesReport,
  getPaymentReport,
  getTaxReport,
  getDailySalesReport,
  getDailyProductDetails,
  getMonthlySalesReport,
  getMonthlyProductDetails
};
