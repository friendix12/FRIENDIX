const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  image: { type: String, default: null },
  imagePublicId: { type: String, default: null },
  bgColor: { type: String, default: null },
  feeling: { type: String, default: null },
  privacy: { type: String, enum: ['public', 'friends', 'only_me'], default: 'public' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    haha: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    care: { type: Number, default: 0 },
  },
  comments: [{
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  }],
  shares: { type: Number, default: 0 },
  reported: { type: Boolean, default: false },
  reportReason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
