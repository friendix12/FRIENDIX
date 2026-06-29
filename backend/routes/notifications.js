const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// TODO: Implement full notification routes (Phase 9)
router.get('/', auth, async (req, res) => res.json({ notifications: [] }));
router.put('/read-all', auth, async (req, res) => res.json({ message: 'সব পড়া হয়েছে।' }));
module.exports = router;
