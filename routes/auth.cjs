const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');

// Đăng ký với email/password
router.post('/register', async (req, res) => {
  try {
    const { username, email, firebaseUid, selectedProgram, role, teacherInfo } = req.body;

    console.log('📝 Register request:', { username, email, firebaseUid, selectedProgram, role });

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Tên người dùng đã được sử dụng'
      });
    }

    // Tạo user mới
    const newUser = new User({
      username,
      email,
      firebaseUid,
      displayName: username,
      xp: 0,
      level: 1,
      programs: [],
      profile: {},
      role: role || 'student',
      teacherStatus: role === 'teacher' ? 'pending' : null,
      teacherProfile: role === 'teacher' ? {
        school: teacherInfo?.school || '',
        subject: teacherInfo?.subject || '',
        teachingGrades: teacherInfo?.teachingGrades || [],
        bio: teacherInfo?.bio || '',
        appliedAt: new Date()
      } : undefined
    });

    await newUser.save();
    console.log('✅ User registered successfully:', newUser.email, 'role:', newUser.role);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email,
        firebaseUid: newUser.firebaseUid 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: newUser.role === 'teacher' ? 'Đăng ký thành công. Tài khoản giáo viên đang chờ duyệt.' : 'Đăng ký thành công',
      token: token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        firebaseUid: newUser.firebaseUid,
        uid: newUser.firebaseUid,
        xp: newUser.xp,
        level: newUser.level,
        programs: newUser.programs,
        profile: newUser.profile,
        role: newUser.role,
        teacherStatus: newUser.teacherStatus,
        teacherProfile: newUser.teacherProfile
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Đăng nhập với Google
router.post('/google-login', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, avatar, selectedProgram, role, teacherInfo } = req.body;

    console.log('📝 Google login request:', { firebaseUid, email, role });

    // Tìm user theo firebaseUid hoặc email
    let user = await User.findOne({ $or: [{ firebaseUid }, { email }] });
    let isNewUser = false;

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      isNewUser = true;
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);

      user = new User({
        username,
        email,
        firebaseUid,
        displayName: displayName || username,
        avatar: avatar || '',
        xp: 0,
        level: 1,
        programs: [],
        profile: {},
        role: role || 'student',
        teacherStatus: role === 'teacher' ? 'pending' : null,
        teacherProfile: role === 'teacher' ? {
          school: teacherInfo?.school || '',
          subject: teacherInfo?.subject || '',
          teachingGrades: teacherInfo?.teachingGrades || [],
          bio: teacherInfo?.bio || '',
          appliedAt: new Date()
        } : undefined
      });

      await user.save();
      console.log('✅ New user created:', user.email, 'role:', user.role);
    } else {
      // Cập nhật firebaseUid nếu user đã tồn tại nhưng chưa có firebaseUid
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
      console.log('✅ Existing user logged in:', user.email, 'role:', user.role);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        firebaseUid: user.firebaseUid 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const isTeacherPending = user.role === 'teacher' && user.teacherStatus === 'pending';

    res.json({
      success: true,
      message: isTeacherPending
        ? 'Tài khoản giáo viên đang chờ xét duyệt. Vui lòng đợi admin phê duyệt trước khi truy cập.'
        : (isNewUser && user.role === 'teacher'
          ? 'Đăng ký thành công. Tài khoản giáo viên đang chờ duyệt.'
          : 'Đăng nhập thành công'),
      isNewUser,
      requiresApproval: isTeacherPending,
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        firebaseUid: user.firebaseUid,
        uid: user.firebaseUid,
        xp: user.xp,
        level: user.level,
        programs: user.programs,
        profile: user.profile,
        avatar: user.avatar,
        role: user.role,
        teacherStatus: user.teacherStatus,
        teacherProfile: user.teacherProfile
      }
    });
  } catch (error) {
    console.error('❌ Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Đăng nhập với email/password
router.post('/email-login', async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    const user = await User.findOne({ $or: [{ firebaseUid }, { email }] });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        xp: user.xp,
        level: user.level,
        programs: user.programs,
        profile: user.profile,
      }
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Lấy thông tin user
router.get('/me/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        xp: user.xp,
        level: user.level,
        programs: user.programs,
        profile: user.profile,
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
