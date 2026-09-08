const express = require('express');
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('./user.controller');
const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUserSchema
} = require('./user.validation');
const { validate } = require('../auth/auth.validation'); 
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// MANAGER can only list and view users
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), validate(listUserSchema), listUsers);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), validate(getUserSchema), getUser);

// Only ADMIN can modify users
router.post('/', authorizeRoles('ADMIN'), validate(createUserSchema), createUser);
router.patch('/:id', authorizeRoles('ADMIN'), validate(updateUserSchema), updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), validate(getUserSchema), deleteUser);

module.exports = router;
