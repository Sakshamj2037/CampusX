const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../utils/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.user.id;
    const requests = db.teamRequests || [];
    
    const incoming = requests.filter(r => r.toUserId === userId);
    const sent = requests.filter(r => r.fromUserId === userId);
    
    // Populate user details for incoming (fromUser) and sent (toUser)
    const populateUser = (r, type) => {
      const targetId = type === 'incoming' ? r.fromUserId : r.toUserId;
      const u = db.users.find(user => user.id === targetId) || {};
      return {
        ...r,
        targetUser: { id: u.id, name: u.name, role: u.role, techStack: u.techStack || [] }
      };
    };

    res.json({
      incoming: incoming.map(r => populateUser(r, 'incoming')),
      sent: sent.map(r => populateUser(r, 'sent'))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/requests
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const { toUserId } = req.body;
    const fromUserId = req.user.id;

    if (!db.teamRequests) db.teamRequests = [];

    // Check if request already exists
    const existing = db.teamRequests.find(r => 
      (r.fromUserId === fromUserId && r.toUserId === toUserId) ||
      (r.fromUserId === toUserId && r.toUserId === fromUserId)
    );

    if (existing) {
      return res.status(400).json({ message: 'Request already exists between these users' });
    }

    const newRequest = {
      id: uuidv4(),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.teamRequests.push(newRequest);
    await writeDB(db);

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/requests/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const { status } = req.body; // 'accepted' or 'rejected'
    const requestId = req.params.id;

    if (!db.teamRequests) db.teamRequests = [];

    const requestIndex = db.teamRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = db.teamRequests[requestIndex];

    // Only the receiver can accept/reject
    if (request.toUserId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    db.teamRequests[requestIndex].status = status;
    await writeDB(db);
    res.json(db.teamRequests[requestIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
