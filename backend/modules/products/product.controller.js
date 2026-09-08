const productService = require('./product.service');
const asyncHandler = require('../../utils/asyncHandler');

const listProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const search = req.query.search;
  const category_id = req.query.category_id ? parseInt(req.query.category_id, 10) : undefined;
  
  let is_active = undefined;
  if (req.query.is_active === 'true') is_active = true;
  if (req.query.is_active === 'false') is_active = false;

  const result = await productService.getProducts({
    skip,
    take: limit,
    page,
    limit,
    search,
    category_id,
    is_active
  }, req.user.role);

  res.status(200).json({
    success: true,
    data: result
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = await productService.getProductById(id, req.user.role);

  res.status(200).json({
    success: true,
    data: { product }
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({
    success: true,
    data: { product }
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = await productService.updateProduct(id, req.body);
  res.status(200).json({
    success: true,
    data: { product }
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await productService.deleteProduct(id);
  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
