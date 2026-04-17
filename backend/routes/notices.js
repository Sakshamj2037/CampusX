const express = require('express');
const { readDB } = require('../utils/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.notices || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
