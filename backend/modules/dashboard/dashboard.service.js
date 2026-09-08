const dashboardRepository = require('./dashboard.repository');
const { getDateRange } = require('../../utils/date.util');
const { Prisma } = require('@prisma/client');

const getDashboardData = async (query) => {
  const { preset, from, to } = query;
  
  const { startDate, endDate } = getDateRange(preset, from, to);

  // Today metrics are ALWAYS for today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Fetch all widgets in parallel
  const [
    todayMetrics,
    topProductsData,
    topCategoriesData,
    paymentBreakdownData,
    salesTrendData
  ] = await Promise.all([
    dashboardRepository.getTodayMetrics(startOfToday, endOfToday),
    dashboardRepository.getTopProducts(startDate, endDate),
    dashboardRepository.getTopCategories(startDate, endDate),
    dashboardRepository.getPaymentBreakdown(startDate, endDate),
    dashboardRepository.getSalesTrend(startDate, endDate)
  ]);

  // Safely calculate AOV
  const todayOrders = todayMetrics.todayOrders;
  const todaySales = new Prisma.Decimal(todayMetrics.todaySales);
  
  let aov = new Prisma.Decimal(0);
  if (todayOrders > 0) {
    aov = todaySales.dividedBy(todayOrders);
  }

  // Format Payment Breakdown
  // Input from DB: [ { payment_method: 'CASH', _sum: { amount: 100 } } ]
  // Output: { CASH: '100.00', CARD: '0.00', UPI: '0.00' }
  const payments = {
    CASH: new Prisma.Decimal(0),
    CARD: new Prisma.Decimal(0),
    UPI: new Prisma.Decimal(0)
  };
  
  for (const item of paymentBreakdownData) {
    if (item.method && item._sum.amount) {
      payments[item.method] = new Prisma.Decimal(item._sum.amount);
    }
  }

  // Format Sales Trend 
  const salesTrend = salesTrendData.map(row => ({
    date: row.date,
    sales: new Prisma.Decimal(row.sales).toFixed(2)
  }));

  // Format Top Products
  const topProducts = topProductsData.map(row => ({
    product_id: row.product_id,
    product_name: row.product_name,
    quantity_sold: row.quantity_sold
  }));

  // Format Top Categories
  const topCategories = topCategoriesData.map(row => ({
    category_id: row.category_id,
    category_name: row.category_name,
    quantity_sold: row.quantity_sold
  }));

  return {
    todaySales: todaySales.toFixed(2),
    todayOrders: todayOrders,
    aov: aov.toFixed(2),
    productsSoldToday: todayMetrics.productsSoldToday,
    salesTrend,
    topProducts,
    topCategories,
    paymentBreakdown: {
      CASH: payments.CASH.toFixed(2),
      CARD: payments.CARD.toFixed(2),
      UPI: payments.UPI.toFixed(2)
    }
  };
};

module.exports = {
  getDashboardData
};
