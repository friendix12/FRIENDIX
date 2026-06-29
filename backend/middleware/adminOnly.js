const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য।' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
