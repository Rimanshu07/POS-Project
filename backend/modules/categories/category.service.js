const categoryRepo = require('./category.repository');
const AppError = require('../../utils/AppError');

const getCategories = async (options, userRole) => {
  // CASHIER can only view active categories
  if (userRole === 'CASHIER') {
    options.is_active = true;
  }

  const { categories, total } = await categoryRepo.findAll(options);
  
  return {
    categories,
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    }
  };
};

const getCategoryById = async (id, userRole) => {
  const category = await categoryRepo.findById(id);

  if (!category) {
    throw new AppError('Category not found', 'CATEGORY_NOT_FOUND', 404);
  }

  if (userRole === 'CASHIER' && !category.is_active) {
    throw new AppError('Category not found', 'CATEGORY_NOT_FOUND', 404);
  }

  return category;
};

const createCategory = async (data) => {
  try {
    const slug = data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await categoryRepo.findBySlug(slug);
    if (existing) {
      throw new AppError('Category slug must be unique', 'VALIDATION_ERROR', 400);
    }
    return await categoryRepo.create({ ...data, slug });
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      throw new AppError('Category slug must be unique', 'VALIDATION_ERROR', 400);
    }
    throw error;
  }
};

const updateCategory = async (id, data) => {
  const existing = await categoryRepo.findById(id);
  if (!existing) {
    throw new AppError('Category not found', 'CATEGORY_NOT_FOUND', 404);
  }

  try {
    const updateData = { ...data };
    if (data.name) {
      updateData.slug = data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    return await categoryRepo.update(id, updateData);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      throw new AppError('Category slug must be unique', 'VALIDATION_ERROR', 400);
    }
    throw error;
  }
};

const deleteCategory = async (id) => {
  const existing = await categoryRepo.findById(id);
  if (!existing) {
    throw new AppError('Category not found', 'CATEGORY_NOT_FOUND', 404);
  }

  await categoryRepo.softDelete(id);
  return { success: true };
};

const bulkCreateCategories = async (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new AppError('At least one category is required', 'VALIDATION_ERROR', 400);
  }

  const seen = new Set();
  const categories = rows.map((row, index) => {
    const name = String(row?.name || '').trim();
    if (!name) {
      throw new AppError(`Category name is required on row ${index + 2}`, 'VALIDATION_ERROR', 400);
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (seen.has(slug)) {
      throw new AppError(`Duplicate category "${name}" in upload`, 'VALIDATION_ERROR', 400);
    }
    seen.add(slug);
    return { name, slug, is_active: row.is_active !== false };
  });

  const existing = await Promise.all(categories.map(category => categoryRepo.findBySlug(category.slug)));
  const skipped = [];
  const newCategories = categories.filter((category, index) => {
    if (existing[index]) {
      skipped.push(`${category.name} (already exists)`);
      return false;
    }
    return true;
  });

  try {
    const created = newCategories.length ? await categoryRepo.createMany(newCategories) : [];
    return { created, skipped };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError('One or more category names already exist', 'VALIDATION_ERROR', 400);
    }
    throw error;
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
  ,bulkCreateCategories
};
