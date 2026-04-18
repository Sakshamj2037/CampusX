const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../utils/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const menuItems = [
  { id: 'm1', name: 'Veg Burger', price: 45 },
  { id: 'm2', name: 'Cold Coffee', price: 60 },
  { id: 'm3', name: 'Masala Dosa', price: 50 },
  { id: 'm4', name: 'Paneer Wrap', price: 80 },
  { id: 'm5', name: 'Chole Bhature', price: 60 },
  { id: 'm6', name: 'Samosa Chaat', price: 30 },
  { id: 'm7', name: 'Masala Maggi', price: 40 },
  { id: 'm8', name: 'Veg Momos', price: 50 },
  { id: 'm9', name: 'Bread Pakora', price: 25 },
  { id: 'm10', name: 'Rajma Chawal', price: 70 },
  { id: 'm11', name: 'Aloo Paratha', price: 35 }
];

router.get('/menu', (req, res) => {
  res.json(menuItems);
});

router.post('/order', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const db = await readDB();
    const userId = req.user.id;

    const item = menuItems.find(m => m.id === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Generate simple token number
    const tokenNumber = db.tokens.length + 101; 

    const newToken = {
      id: uuidv4(),
      tokenNumber,
      userId,
      itemId,
      itemName: item.name,
      status: 'Preparing',
      date: new Date().toISOString()
    };

    db.tokens.push(newToken);
    await writeDB(db);

    res.json({ message: 'Order placed', token: newToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-tokens', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.user.id;
    const userTokens = db.tokens.filter(t => t.userId === userId);
    res.json(userTokens);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
