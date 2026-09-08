const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const pino = require('pino-http')();
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const reportsRoutes = require('./modules/reports/reports.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(pino);

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts, please try again after a minute' } }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests from this IP, please try again after 15 minutes' } }
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/', apiLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
const categoryRoutes = require('./modules/categories/category.routes');
const productRoutes = require('./modules/products/product.routes');
const orderRoutes = require('./modules/orders/order.routes');
// const userRoutes = require('./modules/users/user.routes');

app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportsRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Can't find ${req.originalUrl} on this server!` }
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
