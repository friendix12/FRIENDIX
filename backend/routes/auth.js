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
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const isEmail = email.includes('@');
    const query = isEmail 
      ? { email: email.toLowerCase().trim() } 
      : { phone: normalizePhone(email) };

    const existingUser = await User.findOne(query);
    if (existingUser) {
      return res.status(400).json({ error: isEmail ? 'An account with this email already exists.' : 'An account with this phone number already exists.' });
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
    if (!email || !password) return res.status(400).json({ error: 'Please provide email or phone and password.' });
    
    const identifier = email.trim();
    const isEmail = identifier.includes('@');
    const query = isEmail 
      ? { email: identifier.toLowerCase() } 
      : { phone: normalizePhone(identifier) };

    const user = await User.findOne(query).select('+password')
      .populate('friendRequests', 'fullName firstName lastName avatar')
      .populate('friends', 'fullName firstName lastName avatar');

    if (!user) return res.status(400).json({ error: 'Invalid email/phone or password.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email/phone or password.' });
    if (user.banned) return res.status(403).json({ error: 'Your account has been banned.' });
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
    if (!user) return res.status(404).json({ error: 'User not found.' });
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
      return res.status(400).json({ error: 'Please provide email/phone and new password.' });
    }

    const identifier = email.trim();
    const isEmail = identifier.includes('@');
    const query = isEmail 
      ? { email: identifier.toLowerCase() } 
      : { phone: normalizePhone(identifier) };

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email or phone.' });
    }

    if (type === 'change') {
      // Option A: Reset via old password matching
      if (!oldPassword) {
        return res.status(400).json({ error: 'Please provide the current password.' });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
    } else if (type === 'recovery') {
      // Option B: Reset via Name match (recovery)
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'Please provide first and last name.' });
      }
      const matchFirst = user.firstName.trim().toLowerCase() === firstName.trim().toLowerCase();
      const matchLast = user.lastName.trim().toLowerCase() === lastName.trim().toLowerCase();
      if (!matchFirst || !matchLast) {
        return res.status(400).json({ error: 'Name does not match account name.' });
      }
    } else {
      return res.status(400).json({ error: 'Please select a request type.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
