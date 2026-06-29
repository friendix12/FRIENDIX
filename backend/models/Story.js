const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' }, // NEW: video support
  image: { type: String, required: true }, // URL for image or video
  text: { type: String, default: '' },
  filter: { type: String, default: 'none' },
  musicUrl: { type: String, default: '' },
  musicLabel: { type: String, default: '' },
  musicEmoji: { type: String, default: '' },
  bgColor: { type: String, default: '' },
  visibility: { type: String, enum: ['friends', 'public', 'only_me'], default: 'friends' },
  stickers: [{ emoji: String, x: Number, y: Number, size: { type: Number, default: 40 } }], // NEW: stickers
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // 30-day TTL for archive support (active window = 24h, archive = up to 30 days)
  createdAt: { type: Date, default: Date.now, expires: 2592000 } // 30 days
}, { timestamps: true });

module.exports = mongoose.model('Story', StorySchema);
