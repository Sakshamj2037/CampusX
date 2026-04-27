const express = require('express');
const { readDB } = require('../utils/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Get all users for PingMe (exclude passwords)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const users = db.users.map(u => ({
      id: u.id,
      name: u.name,
      techStack: u.techStack || [],
      role: u.role || 'Member',
      availability: u.availability || 'looking',
      points: u.points,
      badges: u.badges
    })).filter(u => u.id !== req.user.id); // Exclude current user

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
