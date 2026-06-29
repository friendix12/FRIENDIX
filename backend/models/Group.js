const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  cover: { type: String, default: '' },
  logo: { type: String, default: '' },
  privacy: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
