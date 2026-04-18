const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../utils/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_secret_campusx';

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await readDB();

    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
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
      bio: 'Enthusiastic student looking to build awesome projects!',
      experienceLevel: 'Beginner',
      projects: [],
      socialLinks: { github: '', linkedin: '' },
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0d9488`
    };

    db.users.push(newUser);
    await writeDB(db);

    const payload = { user: { id: newUser.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });

    res.status(201).json({ 
      token, 
      user: { 
        id: newUser.id, name, email, points: 0, badges: [], techStack: [], role: '', availability: 'looking',
        bio: newUser.bio, experienceLevel: newUser.experienceLevel, profileImage: newUser.profileImage
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await readDB();

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });

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
    const db = await readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
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
    const db = await readDB();
    const sortedUsers = db.users.sort((a, b) => b.points - a.points);
    const top10 = sortedUsers.slice(0, 10).map(u => ({ id: u.id, name: u.name, points: u.points, badges: u.badges }));
    
    const userIndex = sortedUsers.findIndex(u => u.id === req.user.id);
    let userRank = null;
    
    if (userIndex >= 10) {
      const u = sortedUsers[userIndex];
      userRank = { id: u.id, name: u.name, points: u.points, badges: u.badges, rank: userIndex + 1 };
    }

    // Simulate a large campus for the demo if there are only a few users
    const realCount = db.users.length;
    const totalUsers = realCount < 2000 ? 2450 + realCount : realCount;
    const liveUsers = 184 + Math.floor(Math.random() * 20); // ~180-200 live users

    // If the user is not in top 10 and we are simulating a large campus, simulate a realistic rank
    if (userRank && realCount < 2000) {
        const maxPoints = top10[0] ? top10[0].points : 1000;
        // Ensure points don't exceed maxPoints in the ratio
        const normalizedPoints = Math.min(userRank.points, maxPoints);
        const scoreRatio = normalizedPoints / (maxPoints || 1); 
        
        // Use a power curve (k=0.12) to simulate a realistic distribution
        // In real apps, a huge majority of users have 0-50 points. 
        // Getting just 100 points pushes you past 70% of the user base!
        const percentile = Math.pow(scoreRatio, 0.12);
        
        userRank.rank = Math.floor((1 - percentile) * (totalUsers - 10)) + 10;
        
        if (userRank.rank < 11) userRank.rank = 11;
    }

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
