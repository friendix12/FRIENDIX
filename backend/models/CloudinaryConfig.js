const mongoose = require('mongoose');

const CloudinaryConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cloudName: { type: String, required: true },
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  usage: { type: String, default: '0 GB / 25 GB' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CloudinaryConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CloudinaryConfig', CloudinaryConfigSchema);
