const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findAll = async ({ skip, take, search, is_active }) => {
  const where = { deleted_at: null };
  if (is_active !== undefined) {
    where.is_active = is_active;
  }
  if (search) {
    where.name = { contains: search };
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' }
    }),
    prisma.category.count({ where })
  ]);

  return { categories, total };
};

const findById = async (id) => {
  return await prisma.category.findFirst({
    where: { id, deleted_at: null }
  });
};

const findBySlug = async (slug) => {
  // Case-insensitive slug check handled in service/Prisma logic depending on collation
  // But we use findFirst with mode insensitive for robustness if supported, or strict
  return await prisma.category.findFirst({
    where: { slug: { equals: slug }, deleted_at: null }
  });
};

const create = async (data) => {
  return await prisma.category.create({ data });
};

const createMany = async (categories) => {
  return prisma.$transaction(async (tx) => {
    const created = [];
    for (const category of categories) {
      created.push(await tx.category.create({ data: category }));
    }
    return created;
  });
};

const update = async (id, data) => {
  return await prisma.category.update({
    where: { id },
    data
  });
};

const softDelete = async (id) => {
  return await prisma.category.update({
    where: { id },
    data: { deleted_at: new Date() }
  });
};

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  createMany,
  update,
  softDelete
};
