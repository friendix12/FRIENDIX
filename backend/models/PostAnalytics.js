const mongoose = require('mongoose');

const PostAnalyticsSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['view', 'reaction', 'comment', 'share', 'click'], required: true },
}, { timestamps: true });

// One user can only have one analytics entry per type per post (prevent duplicates for views)
PostAnalyticsSchema.index({ postId: 1, userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('PostAnalytics', PostAnalyticsSchema);
