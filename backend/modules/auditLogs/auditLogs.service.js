const auditLogRepo = require('./auditLogs.repository');

const getAuditLogs = async ({ page, limit, action, entity, search }) => {
  const pageNum = parseInt(page || '1', 10);
  const limitNum = parseInt(limit || '20', 10);
  const skip = (pageNum - 1) * limitNum;

  const { logs, total } = await auditLogRepo.findAll({
    skip,
    take: limitNum,
    action,
    entity,
    search
  });

  return {
    logs,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

module.exports = {
  getAuditLogs
};
