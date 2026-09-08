const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const selectWithoutPassword = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  deleted_at: true
};

const findAll = async ({ skip, take, search, role, is_active }) => {
  const where = {
    deleted_at: null // Always exclude soft-deleted users from lists
  };

  if (role) {
    where.role = role;
  }
  
  if (is_active !== undefined) {
    where.is_active = is_active;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { username: { contains: search } },
      { email: { contains: search } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: selectWithoutPassword,
      orderBy: { id: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total };
};

const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: selectWithoutPassword
  });
};

const findByUsernameOrEmail = async (username, email, excludeUserId = null) => {
  const where = {
    deleted_at: null,
    OR: [
      { username: { equals: username } },
      { email: { equals: email } }
    ]
  };
  
  if (excludeUserId) {
    where.id = { not: excludeUserId };
  }

  return await prisma.user.findFirst({
    where
  });
};

const countActiveAdmins = async (excludeUserId = null) => {
  const where = {
    role: 'ADMIN',
    is_active: true,
    deleted_at: null
  };
  
  if (excludeUserId) {
    where.id = { not: excludeUserId };
  }
  
  return await prisma.user.count({ where });
};

const executeTransaction = async (callback) => {
  return await prisma.$transaction(callback);
};

module.exports = {
  prisma,
  findAll,
  findById,
  findUserById: findById, // Alias for auth.middleware.js
  findByUsernameOrEmail,
  findUserByEmailOrUsername: async (identifier) => findByUsernameOrEmail(identifier, identifier), // Alias for auth.service.js
  countActiveAdmins,
  executeTransaction,
  selectWithoutPassword
};
