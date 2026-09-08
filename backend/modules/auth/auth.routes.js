const express = require('express');
const { login, logout, getMe } = require('./auth.controller');
const { validate, loginSchema } = require('./auth.validation');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
