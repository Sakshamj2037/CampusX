const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/users - Get all users for PingMe (exclude passwords)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const usersData = await User.find({ id: { $ne: req.user.id } }).lean();
    const users = usersData.map(u => ({
      id: u.id,
      name: u.name,
      techStack: u.techStack || [],
      role: u.role || 'Member',
      availability: u.availability || 'looking',
      points: u.points,
      badges: u.badges
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
