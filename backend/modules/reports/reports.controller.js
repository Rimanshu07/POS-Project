const reportsService = require('./reports.service');
const asyncHandler = require('../../utils/asyncHandler');

const getSalesReport = asyncHandler(async (req, res) => {
  const data = await reportsService.getSalesReport(req.query);
  res.status(200).json({ success: true, data });
});

const getProductSalesReport = asyncHandler(async (req, res) => {
  const data = await reportsService.getProductSalesReport(req.query);
  res.status(200).json({ success: true, data });
});

const getCategorySalesReport = asyncHandler(async (req, res) => {
  const data = await reportsService.getCategorySalesReport(req.query);
  res.status(200).json({ success: true, data });
});

const getPaymentReport = asyncHandler(async (req, res) => {
  const data = await reportsService.getPaymentReport(req.query);
  res.status(200).json({ success: true, data });
});

const getTaxReport = asyncHandler(async (req, res) => {
  const data = await reportsService.getTaxReport(req.query);
  res.status(200).json({ success: true, data });
});

const getDailySalesReport = asyncHandler(async (req, res) => {
  const data = await reportsService.getDailySalesReport(req.query);
  res.status(200).json({ success: true, data });
});

const getMonthlySalesReport = asyncHandler(async (req, res) => {
  const data = await reportsService.getMonthlySalesReport(req.query);
  res.status(200).json({ success: true, data });
});

module.exports = {
  getSalesReport,
  getProductSalesReport,
  getCategorySalesReport,
  getPaymentReport,
  getTaxReport,
  getDailySalesReport,
  getMonthlySalesReport
};
