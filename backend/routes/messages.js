const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// GET /api/messages/:userId — get conversation with a user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.userId, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.userId },
      ],
    }).sort({ createdAt: 1 }).populate('senderId', 'fullName avatar');
    // Mark as read
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.userId, read: false },
      { read: true }
    );
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages — get all recent conversations
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.userId }, { receiverId: req.userId }],
    }).sort({ createdAt: -1 }).populate('senderId receiverId', 'fullName avatar');
    // Get unique conversations
    const seen = new Set();
    const conversations = messages.filter(m => {
      const key = [m.senderId._id, m.receiverId._id].sort().join('-');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages — send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, image } = req.body;
    if (!receiverId || (!content && !image)) return res.status(400).json({ error: 'রিসিভার ও মেসেজ দিন।' });
    const message = await Message.create({
      senderId: req.userId,
      receiverId,
      content: content || '',
      image: image || null,
    });
    const populated = await Message.findById(message._id).populate('senderId', 'fullName avatar');
    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
