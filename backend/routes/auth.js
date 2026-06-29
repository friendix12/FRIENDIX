const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to normalize phone number to digits only, matched by last 10 digits
const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, dob, gender } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'সব তথ্য দেওয়া বাধ্যতামূলক।' });
    }

    const isEmail = email.includes('@');
    const query = isEmail 
      ? { email: email.toLowerCase().trim() } 
      : { phone: normalizePhone(email) };

    const existingUser = await User.findOne(query);
    if (existingUser) {
      return res.status(400).json({ error: isEmail ? 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে।' : 'এই ফোন নাম্বার দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে।' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userPayload = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      password: hashedPassword,
      dob: dob || '',
      gender: gender || '',
    };

    if (isEmail) {
      userPayload.email = email.toLowerCase().trim();
    } else {
      userPayload.phone = normalizePhone(email);
    }

    const user = await User.create(userPayload);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'ইমেইল বা মোবাইল নাম্বার এবং পাসওয়ার্ড দিন।' });
    
    const identifier = email.trim();
    const isEmail = identifier.includes('@');
    const query = isEmail 
      ? { email: identifier.toLowerCase() } 
      : { phone: normalizePhone(identifier) };

    const user = await User.findOne(query).select('+password')
      .populate('friendRequests', 'fullName firstName lastName avatar')
      .populate('friends', 'fullName firstName lastName avatar');

    if (!user) return res.status(400).json({ error: 'ইমেইল/মোবাইল বা পাসওয়ার্ড ভুল।' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'ইমেইল/মোবাইল বা পাসওয়ার্ড ভুল।' });
    if (user.banned) return res.status(403).json({ error: 'আপনার অ্যাকাউন্ট নিষিদ্ধ করা হয়েছে।' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
    const { password: _, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — get current logged-in user
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests', 'fullName firstName lastName avatar')
      .populate('friends', 'fullName firstName lastName avatar');
    if (!user) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, oldPassword, firstName, lastName, type } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'ইমেইল/মোবাইল এবং নতুন পাসওয়ার্ড দিন।' });
    }

    const identifier = email.trim();
    const isEmail = identifier.includes('@');
    const query = isEmail 
      ? { email: identifier.toLowerCase() } 
      : { phone: normalizePhone(identifier) };

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'এই ইমেইল বা মোবাইল নাম্বার দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' });
    }

    if (type === 'change') {
      // Option A: Reset via old password matching
      if (!oldPassword) {
        return res.status(400).json({ error: 'আগের পাসওয়ার্ডটি দিন।' });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'বর্তমান পাসওয়ার্ডটি ভুল।' });
      }
    } else if (type === 'recovery') {
      // Option B: Reset via Name match (recovery)
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'প্রথম নাম এবং শেষ নাম দিন।' });
      }
      const matchFirst = user.firstName.trim().toLowerCase() === firstName.trim().toLowerCase();
      const matchLast = user.lastName.trim().toLowerCase() === lastName.trim().toLowerCase();
      if (!matchFirst || !matchLast) {
        return res.status(400).json({ error: 'প্রদত্ত নামটির সাথে অ্যাকাউন্টের নামের মিল নেই।' });
      }
    } else {
      return res.status(400).json({ error: 'অনুরোধের ধরণ নির্বাচন করুন।' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
