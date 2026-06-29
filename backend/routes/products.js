const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// GET /api/products — get all marketplace listings
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('sellerId', 'fullName avatar')
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — create a new listing
router.post('/', auth, async (req, res) => {
  try {
    const { title, price, location, category, condition, description, image } = req.body;
    if (!title || !price || !location || !image) {
      return res.status(400).json({ error: 'Please fill all fields.' });
    }

    const product = await Product.create({
      title,
      price,
      location,
      category,
      condition,
      description,
      image,
      sellerId: req.userId,
    });

    const populated = await Product.findById(product._id).populate('sellerId', 'fullName avatar');
    res.status(201).json({ product: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
