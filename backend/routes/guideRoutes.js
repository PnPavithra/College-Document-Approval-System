const express = require('express');
const User = require('../models/User');
const router = express.Router();

// GET /guides - List all guides
router.get('/guides', async (req, res) => {
  try {
    const guides = await User.find({ role: 'Guide' }, '_id name email');
    res.json(guides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
