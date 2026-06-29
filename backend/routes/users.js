const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/search?q=name — search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });
    const users = await User.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.userId },
    }).select('-password').limit(20);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/suggestions — friend suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const suggestions = await User.find({
      _id: { $ne: req.userId, $nin: me.friends, $nin: me.sentRequests },
    }).select('fullName avatar bio').limit(10);
    res.json({ users: suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'fullName avatar');
    if (!user) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile — update my profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, bio, location, work, education, relationship, avatar, coverPhoto } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (work !== undefined) updates.work = work;
    if (education !== undefined) updates.education = education;
    if (relationship !== undefined) updates.relationship = relationship;
    if (avatar) updates.avatar = avatar;
    if (coverPhoto) updates.coverPhoto = coverPhoto;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/friend-request — send friend request
router.post('/:id/friend-request', auth, async (req, res) => {
  try {
    if (req.params.id === req.userId) return res.status(400).json({ error: 'নিজেকে ফ্রেন্ড রিকোয়েস্ট পাঠানো যাবে না।' });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    if (target.friendRequests.includes(req.userId)) return res.status(400).json({ error: 'রিকোয়েস্ট ইতিমধ্যে পাঠানো হয়েছে।' });
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { friendRequests: req.userId } });
    await User.findByIdAndUpdate(req.userId, { $addToSet: { sentRequests: req.params.id } });
    res.json({ message: 'ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে।' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/accept-request — accept friend request
router.post('/:id/accept-request', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { friendRequests: req.params.id },
      $addToSet: { friends: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { sentRequests: req.userId },
      $addToSet: { friends: req.userId },
    });
    res.json({ message: 'ফ্রেন্ড রিকোয়েস্ট গ্রহণ করা হয়েছে।' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id/unfriend — unfriend
router.delete('/:id/unfriend', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $pull: { friends: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { friends: req.userId } });
    res.json({ message: 'আনফ্রেন্ড করা হয়েছে।' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
