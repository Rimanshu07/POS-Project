const express = require('express');
const { listAuditLogs } = require('./auditLogs.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

// Only authenticated ADMINs can view audit logs
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', listAuditLogs);

module.exports = router;
