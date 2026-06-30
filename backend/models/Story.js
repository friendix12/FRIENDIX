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
  textX: { type: Number, default: 50 },   // text overlay X position (%)
  textY: { type: Number, default: 80 },   // text overlay Y position (%)
  textSize: { type: Number, default: 20 }, // text font size (px)
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Active window = 48h (filtered in route), DB TTL = 30 days for archive
  createdAt: { type: Date, default: Date.now, expires: 2592000 } // 30 days DB retention
}, { timestamps: true });

module.exports = mongoose.model('Story', StorySchema);
