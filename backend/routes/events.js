const express = require('express');
const { readDB, writeDB } = require('../utils/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = db.events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize arrays if they don't exist
    if (!user.joinedEvents) user.joinedEvents = [];
    if (!event.participants) event.participants = [];

    // Check if already joined
    if (user.joinedEvents.includes(eventId)) {
      return res.status(400).json({ message: 'Already joined this event' });
    }

    // Update user points and events
    user.joinedEvents.push(eventId);
    user.points += 50; // +50 points for joining
    event.participants.push(userId);

    // Gamification Badges
    const numEvents = user.joinedEvents.length;
    if (numEvents >= 2 && !user.badges.includes('Explorer')) {
      user.badges.push('Explorer');
    }
    if (numEvents >= 5 && !user.badges.includes('Event Master')) {
      user.badges.push('Event Master');
    }

    await writeDB(db);

    res.json({ message: 'Successfully joined event', pointsEarned: 50, totalPoints: user.points, badges: user.badges });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
