const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications — get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .populate('fromId', 'fullName firstName lastName avatar')
      .populate('postId', 'content')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all — mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId }, { read: true });
    res.json({ message: 'সব পড়া হয়েছে।' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
