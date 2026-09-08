const productRepo = require('./product.repository');
const categoryRepo = require('../categories/category.repository');
const AppError = require('../../utils/AppError');

const getProducts = async (options, userRole) => {
  if (userRole === 'CASHIER') {
    options.is_active = true;
  }

  const { products, total } = await productRepo.findAll(options);
  
  return {
    products,
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    }
  };
};

const getProductById = async (id, userRole) => {
  const product = await productRepo.findById(id);

  if (!product) {
    throw new AppError('Product not found', 'PRODUCT_NOT_FOUND', 404);
  }

  if (userRole === 'CASHIER' && !product.is_active) {
    throw new AppError('Product not found', 'PRODUCT_NOT_FOUND', 404);
  }

  return product;
};

const validateCategory = async (categoryId) => {
  const category = await categoryRepo.findById(categoryId);
  if (!category) {
    throw new AppError('Category not found or deleted', 'CATEGORY_NOT_FOUND', 404);
  }
};

const createProduct = async (data) => {
  await validateCategory(data.category_id);

  const allowedFields = ['category_id', 'name', 'description', 'price', 'image_url', 'is_active'];
  const cleanData = {};
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      cleanData[field] = data[field];
    }
  });

  try {
    return await productRepo.create(cleanData);
  } catch (error) {
    throw error;
  }
};

const updateProduct = async (id, data) => {
  const existingProduct = await productRepo.findById(id);
  if (!existingProduct) {
    throw new AppError('Product not found', 'PRODUCT_NOT_FOUND', 404);
  }

  if (data.category_id && data.category_id !== existingProduct.category_id) {
    await validateCategory(data.category_id);
  }

  const allowedFields = ['category_id', 'name', 'description', 'price', 'image_url', 'is_active'];
  const cleanData = {};
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      cleanData[field] = data[field];
    }
  });

  try {
    return await productRepo.update(id, cleanData);
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (id) => {
  const existing = await productRepo.findById(id);
  if (!existing) {
    throw new AppError('Product not found', 'PRODUCT_NOT_FOUND', 404);
  }

  await productRepo.softDelete(id);
  return { success: true };
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
