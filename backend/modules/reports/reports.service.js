const reportsRepository = require('./reports.repository');
const { getDateRange } = require('../../utils/date.util');

const getSalesReport = async (query) => {
  const { preset, from, to, groupBy } = query;
  const { startDate, endDate } = getDateRange(preset, from, to);
  return await reportsRepository.getSalesReport(startDate, endDate, groupBy);
};

const getProductSalesReport = async (query) => {
  const { preset, from, to } = query;
  const { startDate, endDate } = getDateRange(preset, from, to);
  return await reportsRepository.getProductSalesReport(startDate, endDate);
};

const getCategorySalesReport = async (query) => {
  const { preset, from, to } = query;
  const { startDate, endDate } = getDateRange(preset, from, to);
  return await reportsRepository.getCategorySalesReport(startDate, endDate);
};

const getPaymentReport = async (query) => {
  const { preset, from, to } = query;
  const { startDate, endDate } = getDateRange(preset, from, to);
  return await reportsRepository.getPaymentReport(startDate, endDate);
};

const getTaxReport = async (query) => {
  const { preset, from, to } = query;
  const { startDate, endDate } = getDateRange(preset, from, to);
  return await reportsRepository.getTaxReport(startDate, endDate);
};

const getDailySalesReport = async (query) => {
  const { year, month } = query;
  return await reportsRepository.getDailySalesReport(parseInt(year), parseInt(month));
};

const getMonthlySalesReport = async (query) => {
  const { year } = query;
  return await reportsRepository.getMonthlySalesReport(parseInt(year));
};

module.exports = {
  getSalesReport,
  getProductSalesReport,
  getCategorySalesReport,
  getPaymentReport,
  getTaxReport,
  getDailySalesReport,
  getMonthlySalesReport
};
