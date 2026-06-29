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

// GET /api/messages/unread/count — total unread messages
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.userId, read: false });
    res.json({ count });
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

    const conversationMap = new Map();
    for (const m of messages) {
      const otherUser = m.senderId._id.toString() === req.userId ? m.receiverId : m.senderId;
      const otherId = otherUser._id.toString();
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          user: otherUser,
          lastMessage: m.content || (m.image ? '📷 Photo' : ''),
          lastMessageTime: m.createdAt,
          unreadCount: 0,
        });
      }
      if (m.receiverId._id.toString() === req.userId && !m.read) {
        const entry = conversationMap.get(otherId);
        entry.unreadCount++;
      }
    }

    const conversations = Array.from(conversationMap.values());
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages — send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, image } = req.body;
    if (!receiverId || (!content && !image)) return res.status(400).json({ error: 'Please provide receiver and message.' });
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

// DELETE /api/messages/:msgId — delete a message
router.delete('/:msgId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.msgId);
    if (!message) return res.status(404).json({ error: 'Message not found.' });
    if (message.senderId.toString() !== req.userId && message.receiverId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Permission denied.' });
    }
    await Message.findByIdAndDelete(req.params.msgId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
