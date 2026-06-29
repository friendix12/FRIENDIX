const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ========== ACTIVE STORIES (last 24h) ==========
// GET /api/stories — visible to current user
router.get('/', auth, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const me = await User.findById(req.userId).select('friends');
    const myFriendIds = (me?.friends || []).map(id => id.toString());

    const allStories = await Story.find({ createdAt: { $gte: twentyFourHoursAgo } })
      .populate('authorId', 'fullName firstName lastName avatar')
      .sort({ createdAt: -1 });

    const visibleStories = allStories.filter(story => {
      const storyAuthorId = (story.authorId?._id || story.authorId)?.toString();
      const isMyStory = storyAuthorId === req.userId.toString();
      const isFriend = myFriendIds.includes(storyAuthorId);
      const isPublic = story.visibility === 'public';
      return isMyStory || (isFriend && story.visibility !== 'only_me') || isPublic;
    });

    res.json({ stories: visibleStories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ARCHIVE (my stories older than 24h) ==========
// GET /api/stories/archive
router.get('/archive', auth, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const archivedStories = await Story.find({
      authorId: req.userId,
      createdAt: { $lt: twentyFourHoursAgo }
    })
      .populate('authorId', 'fullName firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.json({ stories: archivedStories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CREATE STORY ==========
// POST /api/stories
router.post('/', auth, async (req, res) => {
  try {
    const { image, mediaType, text, filter, musicUrl, musicLabel, musicEmoji, bgColor, visibility, stickers } = req.body;
    if (!image) return res.status(400).json({ error: 'Story media is required.' });

    const userObj = await User.findById(req.userId);
    if (!userObj) return res.status(404).json({ error: 'User not found.' });

    const story = await Story.create({
      authorId: req.userId,
      authorName: userObj.fullName,
      authorAvatar: userObj.avatar || '',
      mediaType: mediaType || 'image',
      image,
      text: text || '',
      filter: filter || 'none',
      musicUrl: musicUrl || '',
      musicLabel: musicLabel || '',
      musicEmoji: musicEmoji || '',
      bgColor: bgColor || '',
      visibility: visibility || 'friends',
      stickers: stickers || [],
      viewers: []
    });

    await story.populate('authorId', 'fullName firstName lastName avatar');
    res.status(201).json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== VIEW STORY ==========
// POST /api/stories/:id/view
router.post('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { viewers: req.userId } },
      { new: true }
    ).populate('viewers', 'fullName avatar');
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DELETE STORY ==========
// DELETE /api/stories/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found.' });
    if (story.authorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    await story.deleteOne();
    res.json({ message: 'Story deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
