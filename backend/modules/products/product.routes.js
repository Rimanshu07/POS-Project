const express = require('express');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('./product.controller');
const {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  listProductSchema
} = require('./product.validation');
const { validate } = require('../auth/auth.validation'); // Re-using validate middleware
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(listProductSchema), authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), listProducts);
router.get('/:id', validate(getProductSchema), authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'), getProduct);
router.post('/', validate(createProductSchema), authorizeRoles('ADMIN', 'MANAGER'), createProduct);
router.patch('/:id', validate(updateProductSchema), authorizeRoles('ADMIN', 'MANAGER'), updateProduct);
router.delete('/:id', validate(getProductSchema), authorizeRoles('ADMIN', 'MANAGER'), deleteProduct);

module.exports = router;
