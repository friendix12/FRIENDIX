const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const PostAnalytics = require('../models/PostAnalytics');

// ===== SEARCH & SUGGESTIONS =====

// GET /api/users/search?q=name — search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });
    const users = await User.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
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

// ===== PROFESSIONAL MODE =====

// POST /api/users/professional/toggle — turn pro mode on/off
router.post('/professional/toggle', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.isProfessional = !user.isProfessional;
    if (user.isProfessional) {
      user.profileCategory = user.profileCategory === 'Personal' ? 'Digital Creator' : user.profileCategory;
    }
    await user.save();
    res.json({
      isProfessional: user.isProfessional,
      profileCategory: user.profileCategory,
      message: user.isProfessional ? 'Professional mode enabled.' : 'Professional mode disabled.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/professional/category — change profile category
router.put('/professional/category', auth, async (req, res) => {
  try {
    const { category } = req.body;
    const validCategories = ['Personal', 'Digital Creator', 'Gaming Creator', 'Music Artist', 'Public Figure', 'Educator', 'Business', 'Health & Fitness'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category.' });
    }
    await User.findByIdAndUpdate(req.userId, { profileCategory: category });
    res.json({ category, message: 'Category updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/professional/dashboard — get professional dashboard data
router.get('/professional/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.isProfessional) {
      return res.status(400).json({ error: 'Professional mode is not active.' });
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get my posts from last 90 days
    const posts = await Post.find({
      authorId: req.userId,
      createdAt: { $gte: ninetyDaysAgo }
    }).sort({ createdAt: -1 });

    // Calculate total metrics
    let totalReach = 0;
    let totalEngagement = 0;
    let totalVideoViews = 0;
    const postInsights = [];

    for (const post of posts) {
      const reach = post.analytics?.reach || 0;
      const engagement = post.analytics?.engagement || 0;
      const reactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);
      const comments = post.comments?.length || 0;
      const shares = post.shares || 0;
      const totalPostEngagement = reactions + comments + shares;

      totalReach += reach;
      totalEngagement += totalPostEngagement;
      totalVideoViews += post.analytics?.videoViews || 0;

      postInsights.push({
        postId: post._id,
        content: (post.content || '').substring(0, 100),
        image: post.image,
        reach,
        impressions: post.analytics?.impressions || 0,
        engagement: totalPostEngagement,
        reactions,
        comments,
        shares,
        createdAt: post.createdAt,
      });
    }

    // Sort by engagement for top posts
    postInsights.sort((a, b) => b.engagement - a.engagement);

    // Get follower/following counts
    const followerCount = user.followersList?.length || user.followers || 0;
    const followingCount = user.followingList?.length || user.following || 0;

    // Net followers (new in last 30 days)
    const recentFollowers = await User.findById(req.userId).select('followersList');
    const newFollowersCount = recentFollowers?.followersList?.filter(
      fid => fid && recentFollowers.followersList.indexOf(fid) >= 0
    ).length || 0;

    // Audience breakdown (from post reactions and comments)
    const myPosts = await Post.find({ authorId: req.userId }).select('likes comments.authorId');
    const uniqueEngagers = new Set();
    for (const p of myPosts) {
      (p.likes || []).forEach(id => uniqueEngagers.add(id.toString()));
      (p.comments || []).forEach(c => { if (c.authorId) uniqueEngagers.add(c.authorId.toString()); });
    }

    res.json({
      overview: {
        totalReach,
        totalEngagement,
        totalVideoViews,
        followerCount,
        followingCount,
        friendCount: user.friends?.length || 0,
        postCount: posts.length,
      },
      topPosts: postInsights.slice(0, 10),
      recentPosts: postInsights.slice(0, 5),
      uniqueEngagers: uniqueEngagers.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/analytics/my-posts — detailed analytics for all my posts
router.get('/analytics/my-posts', auth, async (req, res) => {
  try {
    const { period } = req.query; // '7d', '30d', '90d'
    let daysBack = 90;
    if (period === '7d') daysBack = 7;
    else if (period === '30d') daysBack = 30;

    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const posts = await Post.find({
      authorId: req.userId,
      createdAt: { $gte: since }
    }).sort({ createdAt: -1 }).lean();

    const analytics = posts.map(post => ({
      postId: post._id,
      content: (post.content || '').substring(0, 120),
      image: post.image,
      reach: post.analytics?.reach || 0,
      impressions: post.analytics?.impressions || 0,
      engagement: post.analytics?.engagement || 0,
      reactions: Object.values(post.reactions || {}).reduce((a, b) => a + b, 0),
      comments: post.comments?.length || 0,
      shares: post.shares || 0,
      createdAt: post.createdAt,
    }));

    res.json({ posts: analytics, period: `${daysBack}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/analytics/track-view — track post view
router.post('/analytics/track-view', auth, async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ error: 'Post ID required.' });

    // Upsert: only count once per user per post
    const existing = await PostAnalytics.findOne({ postId, userId: req.userId, type: 'view' });
    if (!existing) {
      await PostAnalytics.create({ postId, userId: req.userId, type: 'view' });
      await Post.findByIdAndUpdate(postId, { $inc: { 'analytics.reach': 1, 'analytics.impressions': 1 } });

      // Update author's total reach
      const post = await Post.findById(postId).select('authorId');
      if (post && post.authorId.toString() !== req.userId) {
        await User.findByIdAndUpdate(post.authorId, { $inc: { 'stats.totalReach': 1 } });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== FOLLOW SYSTEM =====

// POST /api/users/:id/follow — follow a user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found.' });

    const me = await User.findById(req.userId);

    // Check if already following
    if (me.followingList && me.followingList.includes(req.params.id)) {
      return res.status(400).json({ error: 'Already following.' });
    }

    // Add to my following
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { followingList: req.params.id },
      $inc: { following: 1 }
    });

    // Add me to their followers
    await User.findByIdAndUpdate(req.params.id, {
      $addToSet: { followersList: req.userId },
      $inc: { followers: 1 }
    });

    // Create notification
    await Notification.create({
      userId: req.params.id,
      fromId: req.userId,
      type: 'follow',
      message: 'started following you.'
    });

    const updatedMe = await User.findById(req.userId).select('followingList following');
    res.json({
      success: true,
      following: updatedMe.followingList?.length || updatedMe.following || 0,
      message: 'Followed successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id/unfollow — unfollow a user
router.delete('/:id/unfollow', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { followingList: req.params.id },
      $inc: { following: -1 }
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followersList: req.userId },
      $inc: { followers: -1 }
    });
    const updatedMe = await User.findById(req.userId).select('followingList following');
    res.json({
      success: true,
      following: updatedMe.followingList?.length || updatedMe.following || 0,
      message: 'Unfollowed successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id/followers — get follower list
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('followersList')
      .populate('followersList', 'fullName firstName lastName avatar isProfessional profileCategory');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ followers: user.followersList || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id/following — get following list
router.get('/:id/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('followingList')
      .populate('followingList', 'fullName firstName lastName avatar isProfessional profileCategory');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ following: user.followingList || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PROFILE =====

// GET /api/users/:id — get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'fullName firstName lastName avatar');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Check relationship between current user and profile user
    const me = await User.findById(req.userId).select('friends followingList');
    const isFriend = me.friends && me.friends.some(f => f.toString() === req.params.id);
    const isFollowing = me.followingList && me.followingList.includes(req.params.id);

    const followerCount = user.followersList?.length || user.followers || 0;
    const followingCount = user.followingList?.length || user.following || 0;

    res.json({
      user: {
        ...user.toObject(),
        followerCount,
        followingCount,
        isFriend,
        isFollowing,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile — update my profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, bio, location, work, education, relationship, avatar, coverPhoto, profileCategory } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (work !== undefined) updates.work = work;
    if (education !== undefined) updates.education = education;
    if (relationship !== undefined) updates.relationship = relationship;
    if (avatar) updates.avatar = avatar;
    if (coverPhoto) updates.coverPhoto = coverPhoto;
    if (profileCategory) updates.profileCategory = profileCategory;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/friend-request — send friend request
router.post('/:id/friend-request', auth, async (req, res) => {
  try {
    if (req.params.id === req.userId) return res.status(400).json({ error: 'You cannot send friend request to yourself.' });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (target.friendRequests.includes(req.userId)) return res.status(400).json({ error: 'Request already sent.' });
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { friendRequests: req.userId } });
    await User.findByIdAndUpdate(req.userId, { $addToSet: { sentRequests: req.params.id } });

    await Notification.create({
      userId: req.params.id,
      fromId: req.userId,
      type: 'friend_request',
      message: 'sent you a friend request.'
    });

    res.json({ message: 'Friend request sent.' });
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

    // Auto-follow when becoming friends
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { followingList: req.params.id },
      $inc: { following: 1 }
    });
    await User.findByIdAndUpdate(req.params.id, {
      $addToSet: { followersList: req.userId },
      $inc: { followers: 1 }
    });

    await Notification.create({
      userId: req.params.id,
      fromId: req.userId,
      type: 'friend_accepted',
      message: 'accepted your friend request.'
    });

    res.json({ message: 'Friend request accepted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id/decline-request — decline/cancel friend request
router.delete('/:id/decline-request', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $pull: {
        friendRequests: req.params.id,
        sentRequests: req.params.id
      }
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: {
        friendRequests: req.userId,
        sentRequests: req.userId
      }
    });
    res.json({ message: 'Request cancelled.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id/unfriend — unfriend
router.delete('/:id/unfriend', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $pull: { friends: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { friends: req.userId } });
    // Also unfollow when unfriending
    await User.findByIdAndUpdate(req.userId, { $pull: { followingList: req.params.id }, $inc: { following: -1 } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { followersList: req.userId }, $inc: { followers: -1 } });
    res.json({ message: 'Unfriended successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
