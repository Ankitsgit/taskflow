const express = require('express');
const { body } = require('express-validator');
const { getTasks, getTask, createTask, updateTask, deleteTask, getStats } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 100 }).withMessage('Title must be 2-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 chars'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format')
];

router.get('/stats', getStats);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', taskValidation, createTask);
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
