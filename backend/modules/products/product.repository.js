const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findAll = async ({ skip, take, search, category_id, is_active }) => {
  const where = { deleted_at: null };
  if (is_active !== undefined) {
    where.is_active = is_active;
  }
  if (category_id !== undefined) {
    where.category_id = category_id;
  }
  
  if (search) {
    where.name = { contains: search };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.product.count({ where })
  ]);

  return { products, total };
};

const findById = async (id) => {
  return await prisma.product.findFirst({
    where: { id, deleted_at: null },
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      }
    }
  });
};

const create = async (data) => {
  return await prisma.product.create({ 
    data,
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      }
    }
  });
};

const update = async (id, data) => {
  return await prisma.product.update({
    where: { id },
    data,
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      }
    }
  });
};

const softDelete = async (id) => {
  return await prisma.product.update({
    where: { id },
    data: { deleted_at: new Date() }
  });
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete
};
