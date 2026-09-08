const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

router.get('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), dashboardController.getDashboardData);

module.exports = router;
