const orderService = require('./order.service');
const asyncHandler = require('../../utils/asyncHandler');

const listOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const { search, status, date_from, date_to, reference_no, invoice_no, payment_status } = req.query;

  const result = await orderService.getOrders({
    skip,
    take: limit,
    page,
    limit,
    search,
    status,
    date_from,
    date_to,
    reference_no,
    invoice_no,
    payment_status
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = await orderService.getOrderById(id);

  res.status(200).json({
    success: true,
    data: { order }
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id; // from auth middleware
  const result = await orderService.createOrder(req.body, userId);
  
  res.status(201).json({
    success: true,
    data: result
  });
});

const getOrderInvoice = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const invoice = await orderService.getOrderInvoice(id);

  res.status(200).json({
    success: true,
    data: { invoice }
  });
});

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  getOrderInvoice
};
