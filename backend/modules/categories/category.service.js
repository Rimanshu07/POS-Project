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
    const existing = await categoryRepo.findBySlug(data.slug);
    if (existing) {
      throw new AppError('Category slug must be unique', 'VALIDATION_ERROR', 400);
    }
    return await categoryRepo.create(data);
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

  if (data.slug && data.slug !== existing.slug) {
    const slugCheck = await categoryRepo.findBySlug(data.slug);
    if (slugCheck && slugCheck.id !== id) {
      throw new AppError('Category slug must be unique', 'VALIDATION_ERROR', 400);
    }
  }

  try {
    return await categoryRepo.update(id, data);
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

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
