const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs');
const { supabase } = require('../src/config/supabase.cjs');

// Register route - creates Supabase auth user + profile
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('📝 Register request received:', { username, email });

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Check if username already taken
    const existingUser = await User.findByEmailOrUsername(email, username);
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Tên người dùng';
      return res.status(400).json({ message: `${field} đã được sử dụng` });
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username, display_name: username },
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      if (authError.message?.includes('already')) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      throw authError;
    }

    // Update the auto-created profile with additional data
    const user = await User.update(authData.user.id, {
      username,
      display_name: username,
      xp: 0,
      level: 1,
      programs: [],
      profile: {}
    });

    console.log('✅ User registered successfully:', { id: user.id, email: user.email });

    // Sign in to get session token
    const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email
    });

    // Generate a session for the user
    const { data: sessionData } = await supabase.auth.signInWithPassword({ email, password });

    res.status(201).json({
      message: 'User registered successfully',
      token: sessionData?.session?.access_token || '',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        xp: user.xp,
        level: user.level,
        programs: user.programs
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📝 Login request received:', { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Login error:', authError);
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Get user profile
    const user = await User.findById(authData.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    console.log('✅ Login successful:', { id: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      token: authData.session.access_token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        xp: user.xp,
        level: user.level,
        programs: user.programs,
        firebaseUid: user.id,
        role: user.role,
        teacherStatus: user.teacher_status,
        teacherProfile: user.teacher_profile
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Google OAuth - handled by Supabase Auth on frontend, this syncs profile
router.post('/auth/google', async (req, res) => {
  try {
    const { email, username, googleId, displayName, userId } = req.body;

    // Find or create user profile
    let user = await User.findByEmail(email);

    if (!user && userId) {
      // Profile should have been auto-created by trigger, try to update it
      user = await User.findById(userId);
      if (user) {
        user = await User.update(userId, {
          username: username || email.split('@')[0],
          display_name: displayName || username || email.split('@')[0]
        });
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }

    console.log('✅ Google user synced:', { id: user.id, email: user.email });

    res.json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        xp: user.xp,
        level: user.level,
        programs: user.programs
      }
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Submit lesson completion and update progress
router.post('/submit-lesson', async (req, res) => {
  try {
    const { firebaseUid, programId, pathId, lessonId, score, totalQuestions } = req.body;

    const user = await User.findById(firebaseUid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const percentage = (score / totalQuestions) * 100;
    const completed = percentage >= 50;

    const updatedProgram = User.updateProgramProgress(user, programId, pathId, lessonId, score);
    const stars = User.updateLessonStars(user, programId, pathId, lessonId, percentage);

    if (completed && stars > 0) {
      const xpGain = stars * 20;
      user.xp = (user.xp || 0) + xpGain;
    }

    await User.update(user.id, { programs: user.programs, xp: user.xp });

    res.json({
      message: 'Lesson completed',
      completed,
      stars,
      score,
      totalQuestions,
      percentage: percentage.toFixed(2),
      xpGained: completed && stars > 0 ? stars * 20 : 0,
      program: updatedProgram
    });
  } catch (error) {
    console.error('❌ Error updating lesson progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user grade after placement test
router.post('/update-grade', async (req, res) => {
  try {
    const { userId, grade } = req.body;
    const user = await User.findByAnyId(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = user.profile || {};
    profile.grade = grade;
    await User.update(user.id, { profile });

    res.json({ message: 'Grade updated successfully', user: { id: user.id, grade } });
  } catch (error) {
    console.error('❌ Update grade error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enroll user in a program
router.post('/enroll-program', async (req, res) => {
  try {
    const { userId, programId, programName, initialClassId, placementTestScore } = req.body;
    console.log('📝 Enrolling user:', { userId, programId, initialClassId });

    const user = await User.findByAnyId(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const programs = user.programs || [];
    const existingProgram = programs.find(p => p.programId === programId);

    if (existingProgram) {
      existingProgram.currentClass = initialClassId;
      existingProgram.placementTestCompleted = true;
      existingProgram.placementTestScore = placementTestScore || 0;
      existingProgram.isActive = true;
    } else {
      programs.push({
        programId, programName, currentClass: initialClassId, isActive: true,
        placementTestCompleted: true, placementTestScore: placementTestScore || 0,
        enrolledAt: new Date().toISOString(),
        progress: { completedLessons: [], totalScore: 0, lastStudyDate: null }
      });
    }

    const profile = user.profile || {};
    profile.grade = initialClassId;

    await User.update(user.id, { programs, profile });

    res.json({
      success: true, message: 'Program enrolled successfully',
      user: { id: user.id, email: user.email, programs, profile }
    });
  } catch (error) {
    console.error('❌ Enroll program error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get user by ID (replaces firebase/:firebaseUid)
router.get('/firebase/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (!firebaseUid || firebaseUid === 'undefined' || firebaseUid === 'null') {
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    const user = await User.findByAnyId(firebaseUid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name || user.username || '',
      avatar: user.avatar || '',
      xp: user.xp,
      level: user.level,
      programs: user.programs,
      profile: user.profile,
      firebaseUid: user.id,
      role: user.role,
      teacherStatus: user.teacher_status,
      teacherProfile: user.teacher_profile
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findByAnyId(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id, username: user.username, email: user.email,
      displayName: user.display_name, xp: user.xp, level: user.level,
      programs: user.programs, profile: user.profile,
      firebaseUid: user.id, role: user.role,
      teacherStatus: user.teacher_status, teacherProfile: user.teacher_profile,
      createdAt: user.created_at
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { displayName, bio, school, grade } = req.body;
    const user = await User.findByAnyId(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;

    const profile = user.profile || {};
    if (bio !== undefined) profile.bio = bio;
    if (school !== undefined) profile.school = school;
    if (grade !== undefined) profile.grade = grade;
    updates.profile = profile;

    const updated = await User.update(user.id, updates);

    res.json({
      success: true, message: 'Profile updated successfully',
      user: { id: updated.id, displayName: updated.display_name, profile: updated.profile }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit physics lesson progress
router.post('/submit-physics-lesson', async (req, res) => {
  try {
    const { userId, programId, classId, chapterId, lessonId, score, totalQuestions, completed } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId' });
    }

    const user = await User.findByAnyId(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const programs = user.programs || [];
    let program = programs.find(p => p.programId === programId);

    if (!program) {
      program = {
        programId: programId || 'physics', programName: 'Vật lý',
        currentClass: classId, isActive: true, placementTestCompleted: true,
        enrolledAt: new Date().toISOString(),
        progress: { completedLessons: [], totalScore: 0, lastStudyDate: new Date().toISOString() }
      };
      programs.push(program);
    }

    const lessonKey = `${classId}-${chapterId}-${lessonId}`;
    if (!program.progress) {
      program.progress = { completedLessons: [], totalScore: 0, lastStudyDate: null };
    }
    if (completed && !program.progress.completedLessons.includes(lessonKey)) {
      program.progress.completedLessons.push(lessonKey);
    }
    if (score !== undefined) {
      program.progress.totalScore = (program.progress.totalScore || 0) + score;
    }
    program.progress.lastStudyDate = new Date().toISOString();

    const xpGained = score * 10;
    const newXp = (user.xp || 0) + xpGained;

    await User.update(user.id, { programs, xp: newXp });

    res.json({
      success: true, message: 'Progress saved successfully',
      xpGained, totalXP: newXp, completedLessons: program.progress.completedLessons
    });
  } catch (error) {
    console.error('❌ Submit physics lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============ TEACHER MANAGEMENT APIs ============

router.get('/pending-teachers', async (req, res) => {
  try {
    const teachers = await User.find(
      { role: 'teacher', teacher_status: 'pending' },
      { select: 'id,username,email,display_name,avatar,teacher_profile,created_at' }
    );
    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/teachers', async (req, res) => {
  try {
    const { status } = req.query;
    const filters = { role: 'teacher' };
    if (status) filters.teacher_status = status;

    const teachers = await User.find(filters, { sort: { created_at: -1 } });
    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/verify-teacher/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'teacher') return res.status(400).json({ success: false, message: 'User is not a teacher' });
    if (user.teacher_status !== 'pending') return res.status(400).json({ success: false, message: 'Teacher is not in pending status' });

    const teacherProfile = user.teacher_profile || {};
    teacherProfile.verifiedAt = new Date().toISOString();
    teacherProfile.verifiedBy = req.body.adminId || null;

    await User.update(user.id, { teacher_status: 'verified', teacher_profile: teacherProfile });

    res.json({ success: true, message: 'Giáo viên đã được duyệt thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/reject-teacher/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'teacher') return res.status(400).json({ success: false, message: 'User is not a teacher' });
    if (user.teacher_status !== 'pending') return res.status(400).json({ success: false, message: 'Teacher is not in pending status' });

    const teacherProfile = user.teacher_profile || {};
    teacherProfile.rejectedAt = new Date().toISOString();
    teacherProfile.rejectionReason = req.body.reason || 'Không đáp ứng yêu cầu';

    await User.update(user.id, { teacher_status: 'rejected', teacher_profile: teacherProfile });

    res.json({ success: true, message: 'Đã từ chối đăng ký giáo viên' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/teacher-stats/:teacherId', async (req, res) => {
  try {
    const teacher = await User.findById(req.params.teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({
      success: true,
      stats: { lessonsCreated: 0, exercisesCreated: 0, experimentsCreated: 0, totalStudents: 0, totalViews: 0, averageCompletion: 0 },
      teacher: { id: teacher.id, displayName: teacher.display_name, teacherStatus: teacher.teacher_status, teacherProfile: teacher.teacher_profile }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
