const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, default: 'All' },
  condition: { type: String, enum: ['New', 'Used'], default: 'New' },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
