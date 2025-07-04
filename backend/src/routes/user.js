const express = require('express');
const router = express.Router();
const userModel = require('../models/user');

// Create or update user (called when user opens the app)
router.post('/', async (req, res) => {
  try {
    const user = req.body;
    await userModel.createUser(user);
    res.status(201).json({ message: 'User saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// Get user by Telegram ID
router.get('/by-telegram/:telegram_id', async (req, res) => {
  try {
    const telegram_id = req.params.telegram_id;
    const user = await userModel.getUserByTelegramId(telegram_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router; 