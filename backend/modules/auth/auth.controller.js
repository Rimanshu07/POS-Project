const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const { token, user } = await authService.login(identifier, password);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };

  res.cookie('token', token, cookieOptions);

  res.status(200).json({
    success: true,
    data: { user }
  });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

const getMe = asyncHandler(async (req, res) => {
  const { password_hash, ...safeUser } = req.user;
  res.status(200).json({
    success: true,
    data: { user: safeUser }
  });
});

module.exports = {
  login,
  logout,
  getMe
};
