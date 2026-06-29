const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const CloudinaryConfig = require('../models/CloudinaryConfig');
const User = require('../models/User');
const Post = require('../models/Post');

// ===== CLOUDINARY MANAGEMENT =====

// GET all Cloudinary configs
router.get('/cloudinary', auth, adminOnly, async (req, res) => {
  try {
    const configs = await CloudinaryConfig.find().select('-apiSecret');
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new Cloudinary config
router.post('/cloudinary', auth, adminOnly, async (req, res) => {
  try {
    const { name, cloudName, apiKey, apiSecret } = req.body;
    const config = await CloudinaryConfig.create({ name, cloudName, apiKey, apiSecret, isActive: false });
    res.status(201).json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH set active Cloudinary config (switch between accounts)
router.patch('/cloudinary/:id/activate', auth, adminOnly, async (req, res) => {
  try {
    await CloudinaryConfig.updateMany({}, { isActive: false });
    const config = await CloudinaryConfig.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!config) return res.status(404).json({ error: 'Config not found.' });
    res.json({ message: 'Cloudinary activated.', config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Cloudinary config
router.delete('/cloudinary/:id', auth, adminOnly, async (req, res) => {
  try {
    const config = await CloudinaryConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ error: 'Config not found.' });
    if (config.isActive) return res.status(400).json({ error: 'Cannot delete active config.' });
    await config.deleteOne();
    res.json({ message: 'Cloudinary account removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== USER MANAGEMENT =====

router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/ban', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { $bit: { banned: { xor: 1 } } }, { new: true });
    res.json({ message: user.banned ? 'User banned.' : 'User enabled.', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== POST MANAGEMENT =====

router.get('/posts', auth, adminOnly, async (req, res) => {
  try {
    const posts = await Post.find().populate('authorId', 'fullName avatar').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/posts/:id', auth, adminOnly, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
