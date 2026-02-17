const { validationResult } = require('express-validator');
const User = require('../models/User');

// GET /api/users/profile
const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, bio, avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// PUT /api/users/password
const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
