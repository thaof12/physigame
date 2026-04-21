const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.cjs');
const User = require('../models/User.cjs');

// Verify token and return user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id, username: user.username, email: user.email,
        displayName: user.display_name, xp: user.xp, level: user.level,
        programs: user.programs, profile: user.profile,
        role: user.role, teacherStatus: user.teacher_status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
