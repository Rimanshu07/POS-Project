const categoryService = require('./category.service');
const asyncHandler = require('../../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const search = req.query.search;
  
  let is_active = undefined;
  if (req.query.is_active === 'true') is_active = true;
  if (req.query.is_active === 'false') is_active = false;

  const result = await categoryService.getCategories({
    skip,
    take: limit,
    page,
    limit,
    search,
    is_active
  }, req.user.role);

  res.status(200).json({
    success: true,
    data: result
  });
});

const getCategory = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const category = await categoryService.getCategoryById(id, req.user.role);

  res.status(200).json({
    success: true,
    data: { category }
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({
    success: true,
    data: { category }
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const category = await categoryService.updateCategory(id, req.body);
  res.status(200).json({
    success: true,
    data: { category }
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await categoryService.deleteCategory(id);
  res.status(200).json({
    success: true,
    data: {}
  });
});

const bulkCreateCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.bulkCreateCategories(req.body.categories);
  res.status(201).json({
    success: true,
    data: {
      categories: result.created,
      count: result.created.length,
      skipped: result.skipped
    }
  });
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkCreateCategories
};
