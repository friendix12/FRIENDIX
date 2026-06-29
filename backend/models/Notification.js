const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['like', 'comment', 'friend_request', 'friend_accepted', 'mention'], required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  message: { type: String, default: '' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
