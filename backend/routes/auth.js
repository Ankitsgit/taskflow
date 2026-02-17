const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/me', authenticate, getMe);

module.exports = router;
