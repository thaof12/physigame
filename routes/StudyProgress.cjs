const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs');

// POST /api/study-progress/track
router.post('/track', async (req, res) => {
  try {
    const { userId, programId, classId, lessonId, score } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId' });
    }

    const user = await User.findByAnyId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update program progress
    User.updateProgramProgress(user, programId || 'physics', classId, lessonId, score);
    await User.update(user.id, { programs: user.programs });

    res.json({ success: true, message: 'Progress tracked', programs: user.programs });
  } catch (error) {
    console.error('Error tracking study progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;