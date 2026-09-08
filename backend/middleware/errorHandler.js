const AppError = require('../utils/AppError');
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.code = err.code || 'INTERNAL_SERVER_ERROR';
  error.statusCode = err.statusCode || 500;
  if (err.name === 'ZodError') {
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.message = 'Validation failed';
  }
  if (error.statusCode === 500) {
    req.log.error(err);
    if (process.env.NODE_ENV === 'production') error.message = 'Internal server error';
  }
  res.status(error.statusCode).json({
    success: false,
    error: { code: error.code, message: error.message }
  });
};
module.exports = errorHandler;
