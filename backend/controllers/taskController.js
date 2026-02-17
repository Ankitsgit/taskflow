const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };

    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    }
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

// GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task.' });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, status, priority, tags, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      tags: tags || [],
      dueDate: dueDate || null,
      user: req.user._id
    });

    res.status(201).json({ message: 'Task created.', task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, status, priority, tags, dueDate } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, status, priority, tags, dueDate },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found.' });

    res.json({ message: 'Task updated.', task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};

// GET /api/tasks/stats
const getStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
    stats.forEach(s => {
      result[s._id] = s.count;
      result.total += s.count;
    });

    res.json({ stats: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getStats };
