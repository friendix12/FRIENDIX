const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/stories — get stories visible to current user
// Shows: own stories + friends' stories + public stories (last 24h)
router.get('/', auth, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get current user's friends list
    const me = await User.findById(req.userId).select('friends');
    const myFriendIds = (me?.friends || []).map(id => id.toString());

    // Fetch all stories from last 24h
    const allStories = await Story.find({ createdAt: { $gte: twentyFourHoursAgo } })
      .populate('authorId', 'fullName firstName lastName avatar')
      .sort({ createdAt: -1 });

    // Filter: show my own stories + friends' stories + public stories
    const visibleStories = allStories.filter(story => {
      const storyAuthorId = (story.authorId?._id || story.authorId)?.toString();
      const isMyStory = storyAuthorId === req.userId.toString();
      const isFriend = myFriendIds.includes(storyAuthorId);
      const isPublic = story.visibility === 'public';
      return isMyStory || isFriend || isPublic;
    });

    res.json({ stories: visibleStories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stories — create a new story
router.post('/', auth, async (req, res) => {
  try {
    const { image, text, filter, musicUrl, musicLabel, bgColor, visibility } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Story image is required.' });
    }

    const userObj = await User.findById(req.userId);
    if (!userObj) return res.status(404).json({ error: 'User not found.' });

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
      visibility: visibility || 'friends', // default: friends only
      viewers: []
    });

    // Populate authorId before sending back
    await story.populate('authorId', 'fullName firstName lastName avatar');

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
    ).populate('viewers', 'fullName avatar');
    res.json({ story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stories/:id — delete own story
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
