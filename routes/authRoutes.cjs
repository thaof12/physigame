const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs');
const { supabase } = require('../src/config/supabase.cjs');

// Đăng ký với email/password
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firebaseUid, selectedProgram } = req.body;
    console.log('📝 Register request:', { username, email });

    // Validate email format and domain
    const trimmedEmail = (email || '').trim().toLowerCase();
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2 || (parts[1] !== 'gmail.com' && parts[1] !== 'googlemail.com')) {
      return res.status(400).json({ success: false, message: 'không tìm thấy gmail của bạn.' });
    }
    const [uName] = parts;
    if (
      uName.length < 6 ||
      uName.length > 30 ||
      !/^[a-z0-9.]+$/.test(uName) ||
      uName.startsWith('.') ||
      uName.endsWith('.') ||
      uName.includes('..')
    ) {
      return res.status(400).json({ success: false, message: 'không tìm thấy gmail của bạn.' });
    }

    // Check duplicates only against OTHER users
    const existingEmail = await User.findByEmail(email);
    if (existingEmail && existingEmail.id !== firebaseUid) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }
    const existingUsername = await User.findByUsername(username);
    if (existingUsername && existingUsername.id !== firebaseUid) {
      return res.status(400).json({ success: false, message: 'Tên người dùng đã được sử dụng' });
    }

    let targetUid = firebaseUid;

    // If targetUid is not provided, create user directly via Supabase Admin SDK
    // This avoids hitting Supabase email rate limits (429) and ensures email_confirm: true
    if (!targetUid && password) {
      try {
        const { data: createdAuth, error: createAuthErr } = await supabase.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password: password,
          email_confirm: true,
          user_metadata: {
            username: username || email.split('@')[0],
            display_name: username || email.split('@')[0],
            role: req.body.role || 'student'
          }
        });

        if (createAuthErr) {
          if (createAuthErr.message?.toLowerCase().includes('already')) {
            return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
          }
          throw createAuthErr;
        }
        targetUid = createdAuth.user.id;
        console.log(`✅ [authRoutes] Created Supabase auth user via Admin: ${email} (${targetUid})`);
      } catch (adminCreateErr) {
        console.error('❌ [authRoutes] Admin createUser failed:', adminCreateErr.message);
        throw adminCreateErr;
      }
    } else if (targetUid) {
      try {
        await supabase.auth.admin.updateUserById(targetUid, { email_confirm: true });
        console.log(`✅ [authRoutes] Auto-confirmed Supabase email for ${email} (${targetUid})`);
      } catch (confirmErr) {
        console.warn('⚠️ [authRoutes] Failed to auto-confirm Supabase email:', confirmErr.message);
      }
    }

    if (targetUid) {
      let user = await User.findById(targetUid);
      const isTeacherRole = req.body.role === 'teacher';

      if (user) {
        user = await User.update(targetUid, {
          username: username || user.username,
          display_name: username || user.display_name,
          role: req.body.role || user.role || 'student',
          status: user.status || 'active',
          teacher_status: isTeacherRole ? (user.teacher_status || 'pending') : user.teacher_status,
          updated_at: new Date().toISOString()
        });
      } else {
        user = await User.upsert({
          id: targetUid,
          email: email.trim().toLowerCase(),
          username: username || email.split('@')[0],
          display_name: username || email.split('@')[0],
          role: req.body.role || 'student',
          status: 'active',
          teacher_status: isTeacherRole ? 'pending' : null,
          xp: 0,
          level: 1,
          programs: [],
          profile: {},
          updated_at: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        message: 'Đăng ký thành công',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          firebaseUid: user.id,
          uid: user.id,
          role: user.role,
          teacherStatus: user.teacher_status,
          teacher_status: user.teacher_status,
          xp: user.xp || 0,
          level: user.level || 1,
          programs: user.programs || [],
          profile: user.profile || {}
        }
      });
    }

    res.status(400).json({ success: false, message: 'Thiếu thông tin người dùng' });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// Endpoint to auto-confirm Supabase user email if stuck in unconfirmed state
router.post('/confirm-email', async (req, res) => {
  try {
    const { email, userId } = req.body;
    if (!email && !userId) {
      return res.status(400).json({ success: false, message: 'email hoặc userId là bắt buộc' });
    }

    let targetId = userId;
    if (!targetId && email) {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const matched = users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
      if (matched) targetId = matched.id;
    }

    if (targetId) {
      await supabase.auth.admin.updateUserById(targetId, { email_confirm: true });
      console.log(`✅ [authRoutes] Successfully confirmed email for ${email || targetId}`);
      return res.json({ success: true, message: 'Email đã được xác nhận thành công' });
    }

    res.status(404).json({ success: false, message: 'Không tìm thấy người dùng trong Supabase Auth' });
  } catch (err) {
    console.error('❌ Error confirming email:', err.message);
    res.status(500).json({ success: false, message: err.message });
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

    // Update updated_at timestamp to record real-time activity
    try {
      await User.update(user.id, { updated_at: new Date().toISOString() });
    } catch (upErr) {
      console.warn('⚠️ [authRoutes] Failed to update updated_at on google-login:', upErr.message);
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

    // Update updated_at timestamp to record real-time activity
    try {
      await User.update(user.id, { updated_at: new Date().toISOString() });
    } catch (upErr) {
      console.warn('⚠️ [authRoutes] Failed to update updated_at on email-login:', upErr.message);
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