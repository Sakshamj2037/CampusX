const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_secret_campusx';

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      points: 0,
      badges: [],
      joinedEvents: [],
      techStack: [],
      role: '',
      availability: 'looking',
      createdAt: new Date(),
      lastActive: new Date()
    });

    await newUser.save();

    const payload = { user: { id: newUser.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });

    res.status(201).json({ token, user: { id: newUser.id, name, email, points: 0, badges: [], techStack: [], role: '', availability: 'looking' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });

    user.lastActive = new Date();
    await user.save();

    res.json({ token, user: { 
      id: user.id, name: user.name, email: user.email, points: user.points, badges: user.badges,
      techStack: user.techStack || [],
      role: user.role || '',
      availability: user.availability || 'looking'
    } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.lastActive = new Date();
    await user.save();
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points,
      badges: user.badges,
      joinedEvents: user.joinedEvents || [],
      techStack: user.techStack || [],
      role: user.role || '',
      availability: user.availability || 'looking'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const sortedUsers = await User.find().sort({ points: -1 }).lean();
    const top10 = sortedUsers.slice(0, 10).map(u => ({ id: u.id, name: u.name, points: u.points, badges: u.badges }));
    
    const userIndex = sortedUsers.findIndex(u => u.id === req.user.id);
    let userRank = null;
    
    if (userIndex >= 10) {
      const u = sortedUsers[userIndex];
      userRank = { id: u.id, name: u.name, points: u.points, badges: u.badges, rank: userIndex + 1 };
    }

    const totalUsers = sortedUsers.length;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const liveUsers = sortedUsers.filter(u => u.lastActive && new Date(u.lastActive) > oneDayAgo).length;

    res.json({
      leaderboard: top10,
      totalUsers,
      liveUsers,
      userRank
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
