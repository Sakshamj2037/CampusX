const express = require('express');
const { readDB, writeDB } = require('../utils/db');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// GET /api/lostfound
router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.lostfound || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/lostfound
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const { title, description, location, image, status } = req.body;
    
    if (!title || !description || !location || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (status !== 'lost' && status !== 'found') {
      return res.status(400).json({ message: 'Status must be lost or found' });
    }

    const newItem = {
      id: crypto.randomUUID(),
      title,
      description,
      location,
      image: image || '',
      status, // 'lost' or 'found'
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    if (!db.lostfound) db.lostfound = [];
    db.lostfound.unshift(newItem); // Add to the beginning
    
    await writeDB(db);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating lost/found item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/lostfound/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const { status } = req.body;
    
    if (!db.lostfound) db.lostfound = [];
    
    const itemIndex = db.lostfound.findIndex(i => i.id === req.params.id);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    db.lostfound[itemIndex].status = status;
    await writeDB(db);
    
    res.json(db.lostfound[itemIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
