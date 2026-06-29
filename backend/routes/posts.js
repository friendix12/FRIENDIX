const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/posts/feed — get news feed posts
router.get('/feed', auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const friendIds = me.friends || [];
    const posts = await Post.find({
      $or: [
        { authorId: req.userId },
        { authorId: { $in: friendIds }, privacy: { $in: ['public', 'friends'] } },
        { privacy: 'public' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('authorId', 'fullName avatar')
      .populate('comments.authorId', 'fullName avatar');
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/user/:userId — get posts by a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('authorId', 'fullName avatar')
      .populate('comments.authorId', 'fullName avatar');
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts — create new post
router.post('/', auth, async (req, res) => {
  try {
    const { content, image, bgColor, feeling, privacy } = req.body;
    if (!content && !image) return res.status(400).json({ error: 'পোস্টে কিছু একটা লিখুন বা ছবি দিন।' });
    const post = await Post.create({
      authorId: req.userId,
      content: content || '',
      image: image || null,
      bgColor: bgColor || null,
      feeling: feeling || null,
      privacy: privacy || 'public',
    });
    const populated = await Post.findById(post._id)
      .populate('authorId', 'fullName avatar');
    res.status(201).json({ post: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/posts/:id/react — react to post (like, love, haha, wow, sad, angry, care)
router.put('/:id/react', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'like','love','haha','wow','sad','angry','care'
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'পোস্ট পাওয়া যায়নি।' });
    const alreadyLiked = post.likes.includes(req.userId);
    if (alreadyLiked) {
      post.likes.pull(req.userId);
      if (type && post.reactions[type] > 0) post.reactions[type]--;
    } else {
      post.likes.push(req.userId);
      if (type && post.reactions[type] !== undefined) post.reactions[type]++;
      else post.reactions.like++;
    }
    await post.save();
    res.json({ post, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:id/comment — add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'মন্তব্য লিখুন।' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'পোস্ট পাওয়া যায়নি।' });
    post.comments.push({ authorId: req.userId, content });
    await post.save();
    const updated = await Post.findById(req.params.id)
      .populate('authorId', 'fullName avatar')
      .populate('comments.authorId', 'fullName avatar');
    res.json({ post: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id — delete post (own or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'পোস্ট পাওয়া যায়নি।' });
    const me = await User.findById(req.userId);
    if (post.authorId.toString() !== req.userId && !me.isAdmin) {
      return res.status(403).json({ error: 'অনুমতি নেই।' });
    }
    await post.deleteOne();
    res.json({ message: 'পোস্ট ডিলিট করা হয়েছে।' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
