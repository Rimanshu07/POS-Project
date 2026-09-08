const express = require('express');
const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('./category.controller');
const {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  listCategorySchema
} = require('./category.validation');
const { validate } = require('../auth/auth.validation'); // Re-using validate middleware
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(listCategorySchema), authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), listCategories);
router.get('/:id', validate(getCategorySchema), authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), getCategory);
router.post('/', validate(createCategorySchema), authorizeRoles('ADMIN', 'MANAGER'), createCategory);
router.patch('/:id', validate(updateCategorySchema), authorizeRoles('ADMIN', 'MANAGER'), updateCategory);
router.delete('/:id', validate(getCategorySchema), authorizeRoles('ADMIN', 'MANAGER'), deleteCategory);

module.exports = router;
