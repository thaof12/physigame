const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs');
const { supabase } = require('../src/config/supabase.cjs');

// Đăng ký với email/password
router.post('/register', async (req, res) => {
  try {
    const { username, email, firebaseUid, selectedProgram } = req.body;
    console.log('📝 Register request:', { username, email });

    // Check duplicates
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Tên người dùng đã được sử dụng' });
    }

    // If firebaseUid is a Supabase auth user ID, update their profile
    if (firebaseUid) {
      const user = await User.findById(firebaseUid);
      if (user) {
        const updated = await User.update(firebaseUid, {
          username,
          display_name: username,
          xp: 0, level: 1,
          programs: [], profile: {}
        });

        return res.json({
          success: true, message: 'Đăng ký thành công',
          user: {
            id: updated.id, username: updated.username, email: updated.email,
            displayName: updated.display_name, firebaseUid: updated.id,
            uid: updated.id, xp: updated.xp, level: updated.level,
            programs: updated.programs, profile: updated.profile
          }
        });
      }
    }

    res.status(400).json({ success: false, message: 'Invalid registration request' });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// Đăng nhập với Google (sync profile after Supabase Auth)
router.post('/google-login', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, avatar } = req.body;
    console.log('📝 Google login sync:', { firebaseUid, email });

    let user = await User.findByEmail(email);

    if (!user && firebaseUid) {
      user = await User.findById(firebaseUid);
      if (user) {
        user = await User.update(firebaseUid, {
          display_name: displayName || user.display_name || email.split('@')[0],
          avatar: avatar || user.avatar || ''
        });
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
    }

    res.json({
      success: true, message: 'Đăng nhập thành công',
      user: {
        id: user.id, username: user.username, email: user.email,
        displayName: user.display_name, firebaseUid: user.id,
        uid: user.id, xp: user.xp, level: user.level,
        programs: user.programs, profile: user.profile, avatar: user.avatar,
        status: user.status || 'active'
      }
    });
  } catch (error) {
    console.error('❌ Google login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// Đăng nhập với email/password (sync profile)
router.post('/email-login', async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    let user = await User.findByEmail(email);
    if (!user && firebaseUid) user = await User.findById(firebaseUid);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
    }

    res.json({
      success: true, message: 'Đăng nhập thành công',
      user: {
        id: user.id, username: user.username, email: user.email,
        displayName: user.display_name, xp: user.xp, level: user.level,
        programs: user.programs, profile: user.profile,
        status: user.status || 'active'
      }
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// Lấy thông tin user
router.get('/me/:idValue', async (req, res) => {
  try {
    const idValue = req.params.idValue;
    const user = await User.findByAnyId(idValue);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({
      success: true,
      user: {
        id: user.id, firebaseUid: user.id,
        username: user.username, email: user.email,
        displayName: user.display_name, xp: user.xp, level: user.level,
        programs: user.programs, profile: user.profile,
        status: user.status || 'active'
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

module.exports = router;