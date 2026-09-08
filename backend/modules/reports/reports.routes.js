const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

// All reports are restricted to ADMIN and MANAGER
router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

router.get('/sales', reportsController.getSalesReport);
router.get('/products', reportsController.getProductSalesReport);
router.get('/categories', reportsController.getCategorySalesReport);
router.get('/payments', reportsController.getPaymentReport);
router.get('/tax', reportsController.getTaxReport);
router.get('/daily', reportsController.getDailySalesReport);
router.get('/monthly', reportsController.getMonthlySalesReport);

module.exports = router;
