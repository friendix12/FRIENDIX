const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/presence/heartbeat — update lastSeen
router.post('/heartbeat', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { lastSeen: new Date() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/presence/online — get online status for multiple users
router.get('/online', auth, async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (ids.length === 0) return res.json({ online: {} });

    const threshold = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes (heartbeat every 30s, gives buffer)
    const users = await User.find({ _id: { $in: ids } }, { _id: 1, lastSeen: 1 });

    const online = {};
    for (const u of users) {
      online[u._id.toString()] = u.lastSeen && u.lastSeen > threshold;
    }
    res.json({ online });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
