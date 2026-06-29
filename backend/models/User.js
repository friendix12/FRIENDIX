const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  fullName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  location: { type: String, default: '' },
  work: { type: String, default: '' },
  education: { type: String, default: '' },
  relationship: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, enum: ['পুরুষ', 'মহিলা', 'কাস্টম', 'Male', 'Female', 'Custom', ''], default: '' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
