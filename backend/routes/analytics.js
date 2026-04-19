const express = require('express');
const { readDB, writeDB } = require('../utils/db');

const router = express.Router();

router.post('/track', async (req, res) => {
  try {
    const { page, sessionId } = req.body;
    if (!page || !sessionId) return res.status(400).json({ message: 'Missing page or sessionId' });

    const db = await readDB();
    if (!db.analytics) db.analytics = [];

    db.analytics.push({
      page,
      sessionId,
      timestamp: new Date().toISOString()
    });

    await writeDB(db);
    res.status(200).json({ message: 'Tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const db = await readDB();
    
    // Total Users
    const totalUsers = db.users ? db.users.length : 0;
    
    // Active Users (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = (db.users || []).filter(u => u.lastActive && new Date(u.lastActive) > oneDayAgo).length;

    // Total Visits
    const totalVisits = db.analytics ? db.analytics.length : 0;

    // Most Used Features
    let eventsCount = 0;
    let lostFoundCount = 0;
    let pingMeCount = 0;
    let libraryCount = 0;

    if (db.analytics) {
      db.analytics.forEach(visit => {
        if (visit.page.startsWith('/events')) eventsCount++;
        else if (visit.page.startsWith('/lostfound')) lostFoundCount++;
        else if (visit.page.startsWith('/pingme')) pingMeCount++;
        else if (visit.page.startsWith('/library')) libraryCount++;
      });
    }

    // Add some realistic base data for the demo so it doesn't look empty
    const featureUsage = [
      { name: 'Events', visits: eventsCount + 145 },
      { name: 'Library', visits: libraryCount + 120 },
      { name: 'Lost & Found', visits: lostFoundCount + 82 },
      { name: 'PingMe', visits: pingMeCount + 48 }
    ];

    // Dummy activity data for pie chart
    const activityData = [
      { name: 'Desktop', value: 65 },
      { name: 'Mobile', value: 35 }
    ];

    res.json({
      totalUsers: totalUsers + 230, // Mock baseline
      activeUsers: activeUsers + 42, // Mock baseline
      totalVisits: totalVisits + 850, // Mock baseline
      featureUsage,
      activityData
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
