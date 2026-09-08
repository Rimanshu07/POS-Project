const jwt = require('jsonwebtoken');
const userRepository = require('../modules/users/user.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token || token === 'none') {
    return next(new AppError('Not authorized to access this route', 'UNAUTHORIZED', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findUserById(decoded.sub);

    if (!user) {
      return next(new AppError('User not found', 'UNAUTHORIZED', 401));
    }
    
    if (!user.is_active) {
      return next(new AppError('User account is inactive', 'UNAUTHORIZED', 401));
    }
    
    if (user.deleted_at !== null) {
      return next(new AppError('User account is deleted', 'UNAUTHORIZED', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 'UNAUTHORIZED', 401));
  }
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to perform this action', 'FORBIDDEN', 403));
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles
};
