const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findAll = async ({ skip, take, action, entity, search }) => {
  const where = {};

  if (action) {
    where.action = action;
  }

  if (entity) {
    where.entity = entity;
  }

  if (search) {
    where.OR = [
      { action: { contains: search } },
      { entity: { contains: search } },
      { metadata: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { username: { contains: search } } }
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total };
};

module.exports = {
  findAll
};
