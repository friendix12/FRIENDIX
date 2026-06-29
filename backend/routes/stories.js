const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');

// GET /api/stories — get all active stories in the last 24h
router.get('/', auth, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stories = await Story.find({ createdAt: { $gte: twentyFourHoursAgo } })
      .populate('authorId', 'fullName avatar')
      .sort({ createdAt: -1 });
    res.json({ stories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stories — create a new story
router.post('/', auth, async (req, res) => {
  try {
    const { image, text, filter, musicUrl, musicLabel, bgColor } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'স্টোরির জন্য ইমেজ দেওয়া আবশ্যক।' });
    }

    const userObj = await User.findById(req.userId);
    if (!userObj) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });

    const story = await Story.create({
      authorId: req.userId,
      authorName: userObj.fullName,
      authorAvatar: userObj.avatar || '',
      image,
      text: text || '',
      filter: filter || 'none',
      musicUrl: musicUrl || '',
      musicLabel: musicLabel || '',
      bgColor: bgColor || '',
      viewers: []
    });

    res.status(201).json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stories/:id/view — mark story as viewed
router.post('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { viewers: req.userId } },
      { new: true }
    );
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
