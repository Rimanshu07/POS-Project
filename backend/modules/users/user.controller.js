const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const { search, role, is_active } = req.query;

  const result = await userService.getUsers({ skip, take: limit, page, limit, search, role, is_active });

  res.status(200).json({
    success: true,
    data: result
  });
});

const getUser = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = await userService.getUserById(id);

  res.status(200).json({
    success: true,
    data: { user }
  });
});

const createUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const user = await userService.createUser(req.body, currentUserId);

  res.status(201).json({
    success: true,
    data: { user }
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const currentUserId = req.user.id;
  const user = await userService.updateUser(id, req.body, currentUserId);

  res.status(200).json({
    success: true,
    data: { user }
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const currentUserId = req.user.id;
  await userService.deleteUser(id, currentUserId);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
