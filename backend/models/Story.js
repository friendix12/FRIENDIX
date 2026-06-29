const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  image: { type: String, required: true },
  text: { type: String, default: '' },
  filter: { type: String, default: 'none' },
  musicUrl: { type: String, default: '' },
  musicLabel: { type: String, default: '' },
  bgColor: { type: String, default: '' },
  visibility: { type: String, enum: ['friends', 'public', 'only_me'], default: 'friends' },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-deletes from MongoDB after 24 hours
}, { timestamps: true });

module.exports = mongoose.model('Story', StorySchema);

