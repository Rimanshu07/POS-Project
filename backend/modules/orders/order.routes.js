const express = require('express');
const {
  listOrders,
  getOrder,
  createOrder,
  getOrderInvoice
} = require('./order.controller');
const {
  createOrderSchema,
  listOrderSchema,
  getOrderSchema
} = require('./order.validation');
const { validate } = require('../auth/auth.validation'); 
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// List and view order history (accessible to all POS roles)
router.get('/', validate(listOrderSchema), authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), listOrders);
router.get('/:id', validate(getOrderSchema), authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), getOrder);

// Create a new POS Order (accessible to all POS roles)
router.post('/', validate(createOrderSchema), authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), createOrder);

// Get invoice data for a specific order
router.get('/:id/invoice', validate(getOrderSchema), authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), getOrderInvoice);

module.exports = router;
