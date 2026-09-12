const auditLogService = require('./auditLogs.service');
const asyncHandler = require('../../utils/asyncHandler');

const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, action, entity, search } = req.query;

  const result = await auditLogService.getAuditLogs({
    page,
    limit,
    action,
    entity,
    search
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  listAuditLogs
};
