const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');

// GET /api/groups — get all groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('creatorId', 'fullName avatar')
      .sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/groups — create new group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, cover, logo, privacy } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required.' });

    const newGroup = await Group.create({
      name,
      description: description || '',
      cover: cover || '',
      logo: logo || '',
      privacy: privacy || 'Public',
      creatorId: req.userId,
      members: [req.userId] // creator is automatically a member
    });

    res.status(201).json({ group: newGroup });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/groups/:id/join — join group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.userId } },
      { new: true }
    );
    if (!group) return res.status(404).json({ error: 'Group not found.' });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/groups/:id/leave — leave group
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.userId } },
      { new: true }
    );
    if (!group) return res.status(404).json({ error: 'Group not found.' });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
