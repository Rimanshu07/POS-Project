const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../users/user.repository');
const AppError = require('../../utils/AppError');

const login = async (identifier, password) => {
  const user = await userRepository.findUserByEmailOrUsername(identifier);

  // Generic failure for security
  if (!user || !user.is_active || user.deleted_at !== null) {
    throw new AppError('Invalid credentials', 'UNAUTHORIZED', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 'UNAUTHORIZED', 401);
  }

  // Minimal claims
  const payload = {
    sub: user.id,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  const { password_hash, ...safeUser } = user;

  return { token, user: safeUser };
};

module.exports = {
  login
};
