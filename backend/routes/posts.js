const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit for video/reels
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { uploadToTelegram } = require('../utils/telegramUpload');

// GET /api/posts/storage-config — get storage configuration credentials
router.get('/storage-config', auth, (req, res) => {
  res.json({
    provider: process.env.STORAGE_PROVIDER || 'telegram',
    telegramToken: process.env.TELEGRAM_BOT_TOKEN || '8973841556:AAFgx0uuRvDnp13-NZ29XNwqMKrFQfNQI2A',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '-1003680485341'
  });
});

// POST /api/posts/upload — upload file (image or video)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a file.' });
    
    let uploadResult;
    if (process.env.STORAGE_PROVIDER === 'telegram') {
      uploadResult = await uploadToTelegram(
        req.file.buffer, 
        req.file.originalname, 
        req.file.mimetype
      );
    } else {
      uploadResult = await uploadToCloudinary(
        req.file.buffer, 
        req.file.mimetype.startsWith('video') ? 'friendix/videos' : 'friendix/posts'
      );
    }
    
    res.json({ url: uploadResult.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    if (!content && !image) return res.status(400).json({ error: 'Please write something or add an image.' });
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
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    const alreadyLiked = post.likes.includes(req.userId);
    const prevType = (post.userReactions && post.userReactions.get(req.userId.toString())) || 'like';
    const newType = (type && post.reactions[type] !== undefined) ? type : 'like';

    if (alreadyLiked && prevType === newType) {
      // Same reaction → toggle off (remove)
      post.likes.pull(req.userId);
      if (post.userReactions) post.userReactions.delete(req.userId.toString());
      if (post.reactions[prevType] > 0) post.reactions[prevType]--;
    } else if (alreadyLiked && prevType !== newType) {
      // Different reaction → switch type
      if (post.reactions[prevType] > 0) post.reactions[prevType]--;
      post.reactions[newType]++;
      if (post.userReactions) post.userReactions.set(req.userId.toString(), newType);
    } else {
      // Not yet reacted → add new reaction
      post.likes.push(req.userId);
      post.reactions[newType]++;
      if (post.userReactions) post.userReactions.set(req.userId.toString(), newType);

      // Create notification
      if (post.authorId.toString() !== req.userId) {
        await Notification.create({
          userId: post.authorId,
          fromId: req.userId,
          type: 'like',
          postId: post._id,
          message: 'reacted to your post.'
        });
      }
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
    if (!content) return res.status(400).json({ error: 'Please write a comment.' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    post.comments.push({ authorId: req.userId, content });
    await post.save();

    // Create notification
    if (post.authorId.toString() !== req.userId) {
      await Notification.create({
        userId: post.authorId,
        fromId: req.userId,
        type: 'comment',
        postId: post._id,
        message: 'commented on your post.'
      });
    }

    const updated = await Post.findById(req.params.id)
      .populate('authorId', 'fullName avatar')
      .populate('comments.authorId', 'fullName avatar');
    res.json({ post: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/posts/:id — edit post content
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    if (post.authorId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Permission denied.' });
    }
    const { content, privacy } = req.body;
    if (content !== undefined) post.content = content;
    if (privacy !== undefined) post.privacy = privacy;
    await post.save();
    const populated = await Post.findById(post._id)
      .populate('authorId', 'fullName avatar');
    res.json({ post: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id — delete post (own or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    const me = await User.findById(req.userId);
    if (post.authorId.toString() !== req.userId && !me.isAdmin) {
      return res.status(403).json({ error: 'Permission denied.' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
