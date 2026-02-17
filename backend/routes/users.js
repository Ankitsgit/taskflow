const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);

router.put('/profile', [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio max 200 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
], updateProfile);

router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain a number')
], changePassword);

module.exports = router;
