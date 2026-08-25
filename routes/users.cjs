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

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
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
        teacherProfile: user.teacher_profile,
        status: user.status || 'active'
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

    let user = await User.findByAnyId(firebaseUid);
    if (!user) {
      console.warn(`⚠️ [Backend] User record not found for ${firebaseUid} on GET /firebase endpoint. Creating fallback record...`);
      try {
        user = await User.upsert({
          id: firebaseUid,
          email: `user_${firebaseUid.slice(0, 8)}@example.com`,
          username: `user_${firebaseUid.slice(0, 8)}`,
          display_name: 'Người dùng',
          role: 'student',
          status: 'active'
        });
      } catch (err) {
        console.error('❌ Failed fallback creation:', err.message);
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
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
      teacher_status: user.teacher_status,
      teacherProfile: user.teacher_profile,
      status: user.status || 'active'
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

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
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

// GET /users/teachers - Fetch all teacher records via backend Service Role (bypasses RLS & stale client tokens)
router.get('/teachers', async (req, res) => {
  try {
    console.log('📡 [API /users/teachers] Fetching all teachers via service role...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'teacher');
      
    if (error) {
      console.error('❌ Error in /users/teachers:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({
      success: true,
      teachers: data || []
    });
  } catch (err) {
    console.error('❌ Server error in /users/teachers:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { displayName, bio, school, grade, avatar, subject, teachingGrades } = req.body;
    const user = await User.findByAnyId(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (avatar !== undefined) updates.avatar = avatar;

    if (user.role === 'teacher') {
      const teacherProfile = user.teacher_profile || {};
      if (bio !== undefined) teacherProfile.bio = bio;
      if (school !== undefined) teacherProfile.school = school;
      if (subject !== undefined) teacherProfile.subject = subject;
      if (teachingGrades !== undefined) teacherProfile.teachingGrades = teachingGrades;
      updates.teacher_profile = teacherProfile;
    } else {
      const profile = user.profile || {};
      if (bio !== undefined) profile.bio = bio;
      if (school !== undefined) profile.school = school;
      if (grade !== undefined) profile.grade = grade;
      if (avatar !== undefined) profile.avatar = avatar;
      updates.profile = profile;
    }

    const updated = await User.update(user.id, updates);

    res.json({
      success: true, message: 'Profile updated successfully',
      user: { 
        id: updated.id, 
        displayName: updated.display_name, 
        profile: updated.profile,
        teacherProfile: updated.teacher_profile,
        role: updated.role,
        avatar: updated.avatar
      }
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

    if (completed) {
      User.addRecentActivity(user, {
        type: 'lesson',
        title: 'Hoàn thành bài học',
        detail: `Bài học ${lessonId} (Chương ${chapterId}) - Lớp ${classId}`,
        xp: xpGained
      });
    } else {
      User.addRecentActivity(user, {
        type: 'lesson',
        title: 'Khám phá bài học',
        detail: `Bài học ${lessonId} (Chương ${chapterId}) - Lớp ${classId}`,
        xp: xpGained
      });
    }

    await User.update(user.id, { programs, xp: newXp, profile: user.profile });

    res.json({
      success: true, message: 'Progress saved successfully',
      xpGained, totalXP: newXp, completedLessons: program.progress.completedLessons
    });
  } catch (error) {
    console.error('❌ Submit physics lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', '10minutemail.com', 'tempmail.com', 'yopmail.com',
  'guerrillamail.com', 'trashmail.com', 'dispostable.com', 'getnada.com',
  'sharklasers.com', 'throwawaymail.com', 'mailnesia.com', 'maildrop.cc'
];

function validateTeacherApplicationData({ fullName, email, phone, school, reason }) {
  // 1. Họ và tên
  const trimmedName = fullName?.trim() || '';
  if (!trimmedName) return 'Vui lòng nhập họ và tên đầy đủ.';
  if (trimmedName.length < 3) return 'Họ và tên phải từ 3 đến 60 ký tự.';
  if (trimmedName.length > 60) return 'Họ và tên không được vượt quá 60 ký tự.';
  if (/^\d+$/.test(trimmedName.replace(/\s/g, ''))) {
    return 'Họ và tên không hợp lệ (không được chứa toàn chữ số). Vui lòng nhập họ tên thật.';
  }
  if (!/^[a-zA-ZÀ-ỹ\s'.]+$/u.test(trimmedName)) {
    return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng (không chứa số hoặc ký tự đặc biệt).';
  }

  // 2. Email
  const trimmedEmail = email?.trim() || '';
  if (!trimmedEmail) return 'Vui lòng nhập email liên hệ.';
  if (trimmedEmail.length > 100) return 'Email không được vượt quá 100 ký tự.';
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) return 'Định dạng email không hợp lệ (VD: teacher@gmail.com).';
  const domain = trimmedEmail.split('@')[1]?.toLowerCase();
  if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return 'Hệ thống không tiếp nhận đăng ký từ địa chỉ email rác/tạm thời.';
  }

  // 3. Số điện thoại
  const cleanPhone = phone?.trim().replace(/\s/g, '') || '';
  if (!cleanPhone) return 'Vui lòng nhập số điện thoại liên hệ.';
  if (cleanPhone.length > 12) return 'Số điện thoại không được vượt quá 12 ký tự.';
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Số điện thoại không hợp lệ (Phải là SĐT Việt Nam gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84).';
  }
  const subscriberNumber = cleanPhone.replace(/^(0|\+84)/, '');
  if (/^(\d)\1{7,}$/.test(subscriberNumber)) {
    return 'Số điện thoại không hợp lệ (chứa dãy số lặp lại ngẫu nhiên).';
  }

  // 4. Nơi công tác / Trường
  const trimmedSchool = school?.trim() || '';
  if (!trimmedSchool) return 'Vui lòng nhập trường / nơi công tác.';
  if (trimmedSchool.length < 5) return 'Tên trường/nơi công tác phải từ 5 ký tự trở lên.';
  if (trimmedSchool.length > 120) return 'Tên trường/nơi công tác không vượt quá 120 ký tự.';
  if (/^\d+$/.test(trimmedSchool.replace(/\s/g, ''))) {
    return 'Tên trường/nơi công tác không thể chỉ gồm các con số.';
  }
  if (/(.)\1{4,}/.test(trimmedSchool.replace(/\s/g, ''))) {
    return 'Tên trường/nơi công tác chứa chuỗi ký tự lặp lại bất thường.';
  }

  // 5. Lý do tham gia
  const trimmedReason = reason?.trim() || '';
  if (!trimmedReason || trimmedReason.length < 30) return 'Lý do tham gia cần tối thiểu 30 ký tự.';
  if (trimmedReason.length > 1000) return 'Lý do tham gia không vượt quá 1000 ký tự.';

  return null;
}

router.post('/teacher-application', async (req, res) => {
  try {
    const { userId, email, fullName, phone, school, subject, experience, degree, reason, certificates } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId' });
    }

    const validationError = validateTeacherApplicationData({ fullName, email, phone, school, reason });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    let user = await User.findByAnyId(userId);
    const validEmail = email && typeof email === 'string' && email.trim() && !email.includes('@example.com') ? email.trim() : null;

    if (!user) {
      console.warn(`⚠️ [Backend] User record not found for ${userId}. Creating user profile record...`);
      try {
        user = await User.upsert({
          id: userId,
          email: validEmail || (email && !email.includes('@example.com') ? email : null) || `user_${userId.slice(0, 8)}@example.com`,
          username: (fullName?.trim() || 'teacher').toLowerCase().replace(/\s+/g, '_'),
          display_name: fullName?.trim() || 'Giáo viên',
          role: 'teacher',
          teacher_status: 'pending',
          status: 'active'
        });
      } catch (createErr) {
        console.error('❌ [Backend] Failed to create user profile on teacher-application:', createErr.message);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Ensure storage bucket exists and is set to public
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === 'teacher-certificates')) {
        await supabase.storage.createBucket('teacher-certificates', { public: true });
        console.log('✅ [Backend] Created storage bucket: teacher-certificates');
      } else {
        await supabase.storage.updateBucket('teacher-certificates', { public: true });
      }
    } catch (bErr) {
      console.warn('⚠️ [Backend] Bucket check warning:', bErr.message);
    }

    // Process certificate files using backend Service Role Key (bypasses Storage RLS)
    const uploadedCerts = [];
    if (certificates && Array.isArray(certificates)) {
      for (const cert of certificates) {
        if (cert.base64) {
          try {
            const ext = (cert.name || 'file.png').split('.').pop();
            const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const matches = cert.base64.match(/^data:(.+);base64,(.+)$/);
            const contentType = matches ? matches[1] : cert.type || 'application/octet-stream';
            const buffer = Buffer.from(matches ? matches[2] : cert.base64, 'base64');

            const { error: uploadErr } = await supabase.storage
              .from('teacher-certificates')
              .upload(filePath, buffer, { contentType, upsert: true });

            if (uploadErr) {
              console.warn(`⚠️ [Backend] Upload certificate warning for ${cert.name}:`, uploadErr.message);
              uploadedCerts.push({ name: cert.name, type: contentType, url: cert.base64, base64: cert.base64 });
            } else {
              uploadedCerts.push({ name: cert.name, path: filePath, type: contentType, url: cert.base64, base64: cert.base64 });
            }
          } catch (fileErr) {
            console.error(`❌ [Backend] File processing exception:`, fileErr.message);
            if (cert.base64) {
              uploadedCerts.push({ name: cert.name, type: cert.type || 'image/jpeg', url: cert.base64, base64: cert.base64 });
            }
          }
        } else if (cert.path || cert.url || cert.base64) {
          uploadedCerts.push(cert);
        }
      }
    }

    let resolvedEmail = validEmail;
    if (!resolvedEmail && user.email && !user.email.includes('@example.com')) {
      resolvedEmail = user.email;
    }
    if (!resolvedEmail && user.id) {
      try {
        const { data: authUserData } = await supabase.auth.admin.getUserById(user.id);
        if (authUserData?.user?.email && !authUserData.user.email.includes('@example.com')) {
          resolvedEmail = authUserData.user.email;
          console.log(`✅ [Backend] Synced email from Supabase Auth: ${resolvedEmail}`);
        }
      } catch (authErr) {
        console.warn('⚠️ [Backend] Auth user lookup warning:', authErr.message);
      }
    }
    if (!resolvedEmail) resolvedEmail = email || user.email;

    const teacherProfile = {
      ...(user.teacher_profile || {}),
      email: resolvedEmail,
      phone: phone?.trim(),
      school: school?.trim(),
      subject: subject || 'Vật lý',
      experience: experience || '1–3 năm',
      degree: degree || 'Cử nhân Sư phạm',
      reason: reason?.trim(),
      certificates: uploadedCerts,
      applied_at: new Date().toISOString(),
      agreed_to_share: true
    };

    const updates = {
      display_name: fullName?.trim() || user.display_name,
      teacher_profile: teacherProfile,
      teacher_status: 'pending',
      role: 'teacher',
      updated_at: new Date().toISOString()
    };

    if (resolvedEmail && !resolvedEmail.includes('@example.com')) {
      updates.email = resolvedEmail;
      if (user.id && typeof user.id === 'string' && user.id.length > 20) {
        try {
          await supabase.auth.admin.updateUserById(user.id, { email: resolvedEmail });
        } catch (aErr) {
          console.warn('⚠️ Supabase auth email sync warning:', aErr.message);
        }
      }
    }

    console.log(`📋 [Backend] Submitting teacher application for user ${resolvedEmail} (${user.id})`);
    const updated = await User.update(user.id, updates);

    res.json({
      success: true,
      message: 'Gửi hồ sơ thành công',
      user: {
        id: updated.id,
        email: updated.email,
        displayName: updated.display_name,
        teacherStatus: updated.teacher_status,
        teacherProfile: updated.teacher_profile,
        role: updated.role
      }
    });
  } catch (error) {
    console.error('❌ [Backend] teacher-application error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lưu hồ sơ', error: error.message });
  }
});

async function ensureTeacherEmail(t) {
  if (!t) return t;
  const currentEmail = t.teacher_profile?.email || (t.email && !t.email.includes('@example.com') ? t.email : null);
  if (!currentEmail && t.id) {
    try {
      const { data: authUserData } = await supabase.auth.admin.getUserById(t.id);
      if (authUserData?.user?.email && !authUserData.user.email.includes('@example.com')) {
        const realEmail = authUserData.user.email;
        t.email = realEmail;
        t.teacher_profile = { ...(t.teacher_profile || {}), email: realEmail };
        supabase.from('users').update({ email: realEmail, teacher_profile: t.teacher_profile }).eq('id', t.id).catch(() => {});
      }
    } catch (e) {}
  }
  return t;
}

router.get('/pending-teachers', async (req, res) => {
  try {
    const teachers = await User.find(
      { role: 'teacher', teacher_status: 'pending' },
      { select: 'id,username,email,display_name,avatar,teacher_profile,created_at' }
    );
    const enriched = await Promise.all(teachers.map(ensureTeacherEmail));
    res.json({ success: true, count: enriched.length, teachers: enriched });
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
    const enriched = await Promise.all(teachers.map(ensureTeacherEmail));
    res.json({ success: true, count: enriched.length, teachers: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/verify-teacher/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`📡 [Backend] Attempting to verify teacher: ${id}`);
    
    const user = await User.findById(id);
    if (!user) {
      console.warn(`⚠️ [Backend] User not found for ID: ${id}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prepare profile update
    const teacherProfile = user.teacher_profile || {};
    teacherProfile.verifiedAt = new Date().toISOString();
    teacherProfile.verifiedBy = req.body?.adminId || 'admin-hardcoded';

    console.log(`📡 [Backend] Updating status for: ${user.email}`);

    // Update DB
    const updated = await User.update(id, { 
      teacher_status: 'verified', 
      teacher_profile: teacherProfile,
      role: 'teacher' // Force role to teacher just in case
    });

    if (updated) {
      console.log(`✅ [Backend] Teacher ${id} verified successfully`);
      return res.json({ success: true, message: 'Giáo viên đã được duyệt thành công' });
    } else {
      throw new Error('Update returned no data');
    }
  } catch (error) {
    console.error('❌ [Backend] verify-teacher exception:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ khi duyệt giáo viên', 
      error: error.message 
    });
  }
});

router.post('/reject-teacher/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const teacherProfile = user.teacher_profile || {};
    teacherProfile.rejectedAt = new Date().toISOString();
    teacherProfile.rejectionReason = req.body?.reason || 'Không đáp ứng yêu cầu';

    await User.update(user.id, { 
      role: 'teacher',
      teacher_status: 'rejected', 
      teacher_profile: teacherProfile 
    });

    console.log(`✅ [Backend] Teacher ${user.email} (${user.id}) set to REJECTED`);
    res.json({ success: true, message: 'Đã từ chối đăng ký giáo viên' });
  } catch (error) {
    console.error('❌ [Backend] reject-teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/teacher-stats/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // 1. Lessons Created
    const { count: lessonsCreated, error: lError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId);

    // 2. Exercises and Experiments Created
    const { data: challenges, error: chError } = await supabase
      .from('challenges')
      .select('category, completions_count, views_count')
      .eq('teacher_id', teacherId);

    let exercisesCreated = 0;
    let experimentsCreated = 0;
    let challengeViews = 0;
    
    if (challenges) {
      challenges.forEach(ch => {
        if (ch.category === 'experiment') {
          experimentsCreated++;
        } else {
          exercisesCreated++;
        }
        challengeViews += (ch.views_count || 0);
      });
    }

    // 3. Lessons Views
    const { data: lessonViewsData, error: lvError } = await supabase
      .from('lessons')
      .select('views')
      .eq('teacher_id', teacherId);

    let lessonViews = 0;
    if (lessonViewsData) {
      lessonViews = lessonViewsData.reduce((sum, item) => sum + (item.views || 0), 0);
    }

    const totalViews = lessonViews + challengeViews;

    // 4. Enrolled Students
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId);

    const classIds = (classes || []).map(c => c.id);
    let totalStudents = 0;
    let averageCompletion = 0;

    if (classIds.length > 0) {
      const { data: members, error: memError } = await supabase
        .from('class_members')
        .select('student_id')
        .in('class_id', classIds);

      const studentIds = [...new Set((members || []).map(m => m.student_id))];
      totalStudents = studentIds.length;

      if (totalStudents > 0) {
        // Average completion/score across all enrolled students
        const { data: completions, error: compError } = await supabase
          .from('lesson_completions')
          .select('score, total_questions')
          .in('user_id', studentIds);

        if (completions && completions.length > 0) {
          const totalPct = completions.reduce((sum, item) => sum + (item.score / (item.total_questions || 1) * 100), 0);
          averageCompletion = Math.round(totalPct / completions.length);
        } else {
          averageCompletion = 0;
        }
      }
    }

    res.json({
      success: true,
      stats: {
        lessonsCreated: lessonsCreated || 0,
        exercisesCreated: exercisesCreated || 0,
        experimentsCreated: experimentsCreated || 0,
        totalStudents,
        totalViews,
        averageCompletion
      },
      teacher: {
        id: teacher.id,
        displayName: teacher.display_name,
        teacherStatus: teacher.teacher_status,
        teacherProfile: teacher.teacher_profile
      }
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/users/teacher/:teacherId/activity - Get student activity in last 7 days
router.get('/teacher/:teacherId/activity', async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Find teacher's classes
    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId);

    const classIds = (classes || []).map(c => c.id);
    if (classIds.length === 0) {
      return res.json({ success: true, activity: [] });
    }

    // Find enrolled students
    const { data: members } = await supabase
      .from('class_members')
      .select('student_id')
      .in('class_id', classIds);

    const studentIds = [...new Set((members || []).map(m => m.student_id))];
    if (studentIds.length === 0) {
      return res.json({ success: true, activity: [] });
    }

    // Get completions in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: completions } = await supabase
      .from('lesson_completions')
      .select('completed_at, user_id')
      .in('user_id', studentIds)
      .gte('completed_at', sevenDaysAgo.toISOString());

    // Group by day of week (T2, T3, T4, T5, T6, T7, CN)
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const activityMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      activityMap[dayName] = { day: dayName, students: new Set(), lessons: 0 };
    }

    if (completions) {
      completions.forEach(c => {
        const date = new Date(c.completed_at);
        const dayName = dayNames[date.getDay()];
        if (activityMap[dayName]) {
          activityMap[dayName].students.add(c.user_id);
          activityMap[dayName].lessons++;
        }
      });
    }

    const activity = Object.values(activityMap).map(act => ({
      day: act.day,
      students: act.students.size,
      lessons: act.lessons
    }));

    res.json({ success: true, activity });
  } catch (error) {
    console.error('Error fetching teacher student activity:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/users/teacher/:teacherId/top-students
router.get('/teacher/:teacherId/top-students', async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Find teacher's classes
    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId);

    const classIds = (classes || []).map(c => c.id);
    if (classIds.length === 0) {
      return res.json({ success: true, students: [] });
    }

    // Find class members
    const { data: members, error: memError } = await supabase
      .from('class_members')
      .select('student_id')
      .in('class_id', classIds);

    if (memError) throw memError;

    const studentIds = [...new Set((members || []).map(m => m.student_id))];
    if (studentIds.length === 0) {
      return res.json({ success: true, students: [] });
    }

    // Fetch user details
    const { data: users, error: uError } = await supabase
      .from('users')
      .select('id, display_name, grade')
      .in('id', studentIds);

    if (uError) throw uError;

    // Fetch lesson completions
    const { data: completions, error: cError } = await supabase
      .from('lesson_completions')
      .select('user_id, score, total_questions, completed_at')
      .in('user_id', studentIds);

    if (cError) throw cError;

    // Aggregate statistics per student
    const studentStats = users.map(user => {
      const userComps = (completions || []).filter(c => c.user_id === user.id);
      const lessonsCompleted = userComps.length;
      
      let avgScore = 0;
      if (lessonsCompleted > 0) {
        const totalPct = userComps.reduce((sum, item) => sum + (item.score / (item.total_questions || 1) * 100), 0);
        avgScore = Math.round(totalPct / lessonsCompleted);
      }

      // Find last active timestamp
      let lastActive = 'Chưa hoạt động';
      if (lessonsCompleted > 0) {
        const sorted = userComps.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
        const lastDate = new Date(sorted[0].completed_at);
        lastActive = lastDate.toLocaleDateString('vi-VN');
      }

      return {
        id: user.id,
        name: user.display_name || 'Học sinh',
        grade: user.grade || 10,
        lessonsCompleted,
        avgScore,
        lastActive
      };
    });

    // Sort by avgScore desc, then lessonsCompleted desc
    studentStats.sort((a, b) => b.avgScore - a.avgScore || b.lessonsCompleted - a.lessonsCompleted);

    res.json({ success: true, students: studentStats });
  } catch (error) {
    console.error('Error fetching teacher top students:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============ ADMIN USER STATUS MANAGEMENT ============
// Uses service role key (bypasses RLS) — for Admin panel only

// POST /api/users/update-status — update user status + teacher_status
router.post('/update-status', async (req, res) => {
  try {
    const { id, email, status, teacher_status, name, role } = req.body;

    if (!id && !email) {
      return res.status(400).json({ success: false, message: 'Cần cung cấp id hoặc email' });
    }
    if (!status) {
      return res.status(400).json({ success: false, message: 'Cần cung cấp trạng thái (status)' });
    }

    // Find user first
    let user = null;
    if (id) user = await User.findById(id);
    if (!user && email) user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Build update payload
    const updates = { status };
    if (teacher_status !== undefined) updates.teacher_status = teacher_status;
    if (name !== undefined) updates.display_name = name;
    if (role !== undefined) updates.role = role;
    if (email !== undefined && email !== null && typeof email === 'string' && email.trim() !== '' && !email.includes('@example.com')) {
      updates.email = email.trim();
      if (user.teacher_profile) {
        updates.teacher_profile = { ...user.teacher_profile, email: email.trim() };
      }
    }

    console.log(`📡 [Backend] Admin updating user ${user.email}: status=${status}, teacher_status=${teacher_status}`);

    // Use User.update which uses service role key — bypasses RLS
    const updated = await User.update(user.id, updates);

    console.log(`✅ [Backend] User ${user.email} updated successfully`);
    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      user: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        teacher_status: updated.teacher_status,
        display_name: updated.display_name
      }
    });
  } catch (error) {
    console.error('❌ [Backend] update-status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
});

// POST /api/users/batch-update-status — update multiple users status
router.post('/batch-update-status', async (req, res) => {
  try {
    const { userIds, status } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Cần danh sách userIds' });
    }
    if (!status) {
      return res.status(400).json({ success: false, message: 'Cần cung cấp status' });
    }

    console.log(`📡 [Backend] Batch updating ${userIds.length} users to status=${status}`);

    const results = await Promise.allSettled(
      userIds.map(async (id) => {
        const user = await User.findById(id);
        if (!user) return null;
        const updates = { status };
        // For teachers, also update teacher_status
        if (user.role === 'teacher') {
          updates.teacher_status = status === 'active' ? 'verified' : status;
        }
        return User.update(id, updates);
      })
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ [Backend] Batch update: ${succeeded}/${userIds.length} succeeded`);

    res.json({ success: true, message: `Cập nhật ${succeeded}/${userIds.length} tài khoản thành công` });
  } catch (error) {
    console.error('❌ [Backend] batch-update-status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
});

// DELETE /api/users/delete/:id — delete a user (service role)
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    await User.delete(id);
    console.log(`✅ [Backend] User ${id} deleted`);
    res.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    console.error('❌ [Backend] delete user error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
});

// GET /api/users/check-status — Polling endpoint for client-side inactive detection
// Uses service role key (bypasses RLS) — safe to call every few seconds
router.get('/check-status', async (req, res) => {
  try {
    const { email, id } = req.query;
    if (!email && !id) {
      return res.status(400).json({ success: false, message: 'email hoặc id là bắt buộc' });
    }

    let user = null;
    if (id) user = await User.findById(id);
    if (!user && email) user = await User.findByEmail(email);

    if (!user) {
      return res.json({ success: true, exists: false, status: 'active', teacher_status: null });
    }

    const isDeactivated =
      user.status === 'inactive' ||
      user.teacher_status === 'inactive';

    return res.json({
      success: true,
      exists: true,
      status: user.status || 'active',
      teacher_status: user.teacher_status || null,
      display_name: user.display_name,
      role: user.role,
      teacher_profile: user.teacher_profile || null,
      rejectionReason: user.teacher_profile?.rejectionReason || null,
      isDeactivated
    });
  } catch (error) {
    console.error('❌ [Backend] check-status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
});

module.exports = router;
