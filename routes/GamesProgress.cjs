const express = require('express');
const router = express.Router();
const PhysicsGameProgress = require('../models/PhysicsGameProgress.cjs');
const User = require('../models/User.cjs');

// POST /api/games-progress/save
router.post('/save', async (req, res) => {
  try {
    const { userId, grade, completed, current } = req.body;

    const user = await User.findByAnyId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const progress = await PhysicsGameProgress.saveProgress(
      user.id, user.email, parseInt(grade), completed, current
    );

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error saving games progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/games-progress/:userId/:grade
router.get('/:userId/:grade', async (req, res) => {
  try {
    const user = await User.findByAnyId(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const progress = await PhysicsGameProgress.getProgress(user.id, parseInt(req.params.grade));
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error getting games progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;