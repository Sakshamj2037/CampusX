const express = require('express');
const User = require('../models/User');
const Visit = require('../models/Visit');
const FeatureUsage = require('../models/FeatureUsage');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const ADMIN_EMAIL = 'sakshamjainbbps@gmail.com';

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user || user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

router.post('/track', async (req, res) => {
  try {
    const { page, sessionId, device } = req.body;
    if (!page || !sessionId) return res.status(400).json({ message: 'Missing page or sessionId' });

    const visit = new Visit({
      sessionId,
      device: device || 'Desktop',
      timestamp: new Date()
    });
    await visit.save();

    // Feature tracking
    let featureName = null;
    if (page.startsWith('/events')) featureName = 'Events';
    else if (page.startsWith('/lostfound')) featureName = 'Lost & Found';
    else if (page.startsWith('/pingme')) featureName = 'PingMe';
    else if (page.startsWith('/library')) featureName = 'Library';

    if (featureName) {
      const usage = new FeatureUsage({
        featureName,
        timestamp: new Date()
      });
      await usage.save();
    }

    res.status(200).json({ message: 'Tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastActive: { $gte: oneDayAgo } });

    const totalVisits = await Visit.countDocuments();

    const eventsCount = await FeatureUsage.countDocuments({ featureName: 'Events' });
    const lostFoundCount = await FeatureUsage.countDocuments({ featureName: 'Lost & Found' });
    const pingMeCount = await FeatureUsage.countDocuments({ featureName: 'PingMe' });
    const libraryCount = await FeatureUsage.countDocuments({ featureName: 'Library' });

    const featureUsage = [
      { name: 'Events', visits: eventsCount },
      { name: 'Library', visits: libraryCount },
      { name: 'Lost & Found', visits: lostFoundCount },
      { name: 'PingMe', visits: pingMeCount }
    ];

    const desktopVisits = await Visit.countDocuments({ device: 'Desktop' });
    const mobileVisits = await Visit.countDocuments({ device: 'Mobile' });

    const activityData = [
      { name: 'Desktop', value: desktopVisits || 1 }, // prevent empty chart crash
      { name: 'Mobile', value: mobileVisits }
    ];

    res.json({
      totalUsers,
      activeUsers,
      totalVisits,
      featureUsage,
      activityData
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password').lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
