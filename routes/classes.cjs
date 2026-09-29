const express = require('express');
const router = express.Router();
const { supabase } = require('../src/config/supabase.cjs');

// In-memory status map for tracking join approval state: `${classId}_${studentId}` -> 'pending' | 'approved' | 'rejected'
const statusMap = new Map();
const ASSIGNMENT_COMPLETIONS_UUID = '00000000-0000-0000-0000-000000000004';
const MEMBERSHIP_STATUS_UUID = '00000000-0000-0000-0000-000000000005';

// Synchronize statusMap & classGradeMap with persistent storage in teacher_notifications
async function loadPersistentStatuses(filter = null) {
  try {
    let query = supabase
      .from('teacher_notifications')
      .select('title, content')
      .eq('teacher_id', MEMBERSHIP_STATUS_UUID);

    if (filter) {
      query = query.like('title', filter);
    }
    const { data } = await query;
    if (data) {
      data.forEach(item => {
        if (item.title && item.title.startsWith('mem_status:')) {
          const parts = item.title.split(':');
          if (parts.length === 3) {
            statusMap.set(`${parts[1]}_${parts[2]}`, item.content);
          }
        } else if (item.title && item.title.startsWith('class_grade:')) {
          const cid = item.title.replace('class_grade:', '');
          if (cid) classGradeMap.set(cid, parseInt(item.content));
        }
      });
    }
  } catch (err) {
    console.warn('Error loading persistent statuses:', err.message);
  }
}

// Initial eager load
loadPersistentStatuses();

async function setPersistentStatus(classId, studentId, status) {
  const key = `${String(classId)}_${String(studentId)}`;
  if (status) {
    statusMap.set(key, status);
  } else {
    statusMap.delete(key);
  }
  const title = `mem_status:${classId}:${studentId}`;
  try {
    await supabase
      .from('teacher_notifications')
      .delete()
      .eq('teacher_id', MEMBERSHIP_STATUS_UUID)
      .eq('title', title);

    if (status) {
      await supabase
        .from('teacher_notifications')
        .insert({
          teacher_id: MEMBERSHIP_STATUS_UUID,
          title,
          content: status,
          is_read: false
        });
    }
  } catch (err) {
    console.warn('Error persisting membership status:', err.message);
  }
}

// Generate a random class code: 6 uppercase characters
function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// In-memory grade map for tracking class grades when DB column 'grade' is absent
const classGradeMap = new Map();

function cleanDescription(desc) {
  if (!desc) return '';
  return desc.replace(/\[GRADE:\d+\]\s*/gi, '').trim();
}

// Helper to reliably determine class grade (from grade column, in-memory map, description tag, or parsed from class name)
function parseGrade(clsGrade, className, classId = null, classCode = null, description = null) {
  if (clsGrade && !isNaN(parseInt(clsGrade))) {
    const parsed = parseInt(clsGrade);
    if (parsed >= 6 && parsed <= 12) return parsed;
  }
  if (classId && classGradeMap.has(String(classId))) {
    return classGradeMap.get(String(classId));
  }
  if (classCode && classGradeMap.has(String(classCode))) {
    return classGradeMap.get(String(classCode));
  }
  if (description) {
    const descMatch = description.match(/\[GRADE:(\d{1,2})\]/i);
    if (descMatch && descMatch[1]) {
      const g = parseInt(descMatch[1]);
      if (g >= 6 && g <= 12) return g;
    }
  }
  if (className) {
    const match = className.match(/(?:Lớp|Khối|K)\s*(\d{1,2})/i) || className.match(/\b([6-9]|1[0-2])\b/i);
    if (match && match[1]) {
      const g = parseInt(match[1]);
      if (g >= 6 && g <= 12) return g;
    }
  }
  return 10; // Default fallback
}

// Helper to get student's membership status for a class
function getMembershipStatus(classId, studentId, dbStatus) {
  const key = `${String(classId)}_${String(studentId)}`;
  if (statusMap.has(key)) {
    return statusMap.get(key);
  }
  if (dbStatus && ['pending', 'approved', 'rejected'].includes(dbStatus)) {
    return dbStatus;
  }
  // Default for existing memberships in class_members without explicit status tag is 'approved'
  return 'approved';
}

// GET /api/classes/all - Get all available/featured classes for browsing & discovery
router.get('/all', async (req, res) => {
  try {
    const { grade, search, studentId } = req.query;

    if (studentId) {
      await loadPersistentStatuses(`mem_status:%:${studentId}`);
    }

    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let filteredClasses = classes || [];

    // Filter by grade
    if (grade && grade !== 'all') {
      const targetGrade = parseInt(grade);
      filteredClasses = filteredClasses.filter(c => parseGrade(c.grade, c.name, c.id, c.code, c.description) === targetGrade);
    }

    // Filter by search query (name or code)
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filteredClasses = filteredClasses.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.code && c.code.toLowerCase().includes(q))
      );
    }

    // Get student's current memberships if studentId provided
    let myMembershipsMap = {};
    if (studentId) {
      try {
        const { data: mData } = await supabase
          .from('class_members')
          .select('*')
          .eq('student_id', studentId);

        (mData || []).forEach(m => {
          myMembershipsMap[m.class_id] = getMembershipStatus(m.class_id, studentId, m.status);
        });
      } catch (mErr) {
        console.warn('Membership check warning:', mErr.message);
      }
    }

    // Enrich classes with teacher info and student count
    const enriched = await Promise.all(filteredClasses.map(async (cls) => {
      let teacher = null;
      try {
        const { data: tData } = await supabase
          .from('users')
          .select('id, display_name, email, avatar')
          .eq('id', cls.teacher_id)
          .maybeSingle();
        teacher = tData;
      } catch (tErr) {}

      let count = 0;
      try {
        const { count: cVal } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id);
        count = cVal || 0;
      } catch (cErr) {}

      return {
        id: cls.id,
        name: cls.name,
        code: cls.code,
        grade: parseGrade(cls.grade, cls.name, cls.id, cls.code, cls.description),
        description: cleanDescription(cls.description),
        created: cls.created_at ? cls.created_at.split('T')[0] : '',
        studentsCount: count,
        teacher: teacher ? {
          name: teacher.display_name || (teacher.email ? teacher.email.split('@')[0] : 'Giáo viên'),
          email: teacher.email,
          avatar: teacher.avatar
        } : null,
        myStatus: myMembershipsMap[cls.id] || null
      };
    }));

    res.json({ success: true, classes: enriched });
  } catch (error) {
    console.error('Error fetching all classes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/teacher/:teacherId - Get classes for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Load persistent statuses to ensure pendingCount & students count are accurate
    await loadPersistentStatuses('mem_status:%');
    
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const classesWithCounts = await Promise.all((classes || []).map(async (cls) => {
      let count = 0;
      let pendingCount = 0;

      try {
        const { data: mList } = await supabase
          .from('class_members')
          .select('*')
          .eq('class_id', cls.id);

        if (mList) {
          mList.forEach(m => {
            const st = getMembershipStatus(cls.id, m.student_id, m.status);
            if (st === 'approved') count++;
            if (st === 'pending') pendingCount++;
          });
        }
      } catch (err) {}

      let assignmentsCount = 0;
      try {
        const { count: asgCount } = await supabase
          .from('class_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id);
        assignmentsCount = asgCount || 0;
      } catch (err) {}

      return {
        id: cls.id,
        name: cls.name,
        code: cls.code,
        grade: parseGrade(cls.grade, cls.name, cls.id, cls.code, cls.description),
        description: cleanDescription(cls.description),
        students: count,
        pendingCount,
        lessons: assignmentsCount,
        assignmentsCount: assignmentsCount,
        created: cls.created_at ? cls.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
    }));

    res.json({ success: true, classes: classesWithCounts });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes - Create a new class
router.post('/', async (req, res) => {
  try {
    const { teacherId, name, grade, description } = req.body;
    if (!teacherId || !name) {
      return res.status(400).json({ success: false, message: 'Missing teacherId or name' });
    }

    const selectedGrade = grade ? parseInt(grade) : parseGrade(null, name);

    let code = generateClassCode();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const { data } = await supabase
        .from('classes')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      if (!data) {
        isUnique = true;
      } else {
        code = generateClassCode();
      }
      attempts++;
    }

    const rawDescription = description ? description.trim() : '';
    const descWithTag = `[GRADE:${selectedGrade}] ${rawDescription}`.trim();

    const insertPayload = {
      teacher_id: teacherId,
      name: name.trim(),
      code,
      grade: selectedGrade,
      description: descWithTag,
      lessons_count: 0
    };

    let newClass;
    const { data, error } = await supabase
      .from('classes')
      .insert(insertPayload)
      .select()
      .maybeSingle();

    if (error) {
      delete insertPayload.grade;
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('classes')
        .insert(insertPayload)
        .select()
        .single();
      
      if (fallbackError) {
        delete insertPayload.description;
        const { data: minData, error: minError } = await supabase
          .from('classes')
          .insert(insertPayload)
          .select()
          .single();
        if (minError) throw minError;
        newClass = minData;
      } else {
        newClass = fallbackData;
      }
    } else {
      newClass = data;
    }

    if (newClass) {
      if (newClass.id) {
        classGradeMap.set(String(newClass.id), selectedGrade);
        // Persist grade mapping to avoid losing custom class grade across restarts
        supabase.from('teacher_notifications').insert({
          teacher_id: MEMBERSHIP_STATUS_UUID,
          title: `class_grade:${newClass.id}`,
          content: String(selectedGrade),
          is_read: false
        }).then(() => {}).catch(() => {});
      }
      if (newClass.code) classGradeMap.set(String(newClass.code), selectedGrade);
    }

    res.status(201).json({
      success: true,
      class: {
        id: newClass.id,
        name: newClass.name,
        code: newClass.code,
        grade: selectedGrade,
        description: rawDescription,
        students: 0,
        lessons: 0,
        created: newClass.created_at ? newClass.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE /api/classes/:classId - Delete class
router.delete('/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) throw error;

    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/join - Join a class via class code or class id (sets status='pending')
router.post('/join', async (req, res) => {
  try {
    const { studentId, classCode, classId, studentName: clientStudentName } = req.body;
    if (!studentId || (!classCode && !classId)) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin mã lớp hoặc mã học sinh' });
    }

    let cls = null;
    if (classCode) {
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('code', classCode.trim().toUpperCase())
        .maybeSingle();
      cls = data;
    } else if (classId) {
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .maybeSingle();
      cls = data;
    }

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Lớp học không tồn tại hoặc mã lớp không chính xác' });
    }

    // Ensure persistent statuses for this student are loaded
    await loadPersistentStatuses(`mem_status:${cls.id}:${studentId}`);

    // Check existing membership in database
    let existingMember = null;
    try {
      const { data } = await supabase
        .from('class_members')
        .select('*')
        .eq('class_id', cls.id)
        .eq('student_id', studentId)
        .maybeSingle();
      existingMember = data;
    } catch (e) {}

    if (existingMember) {
      const currentStatus = getMembershipStatus(cls.id, studentId, existingMember.status);
      if (currentStatus === 'approved') {
        return res.status(400).json({ success: false, message: 'Bạn đã là thành viên chính thức của lớp này rồi. Hãy nhấn "Vào Lớp Học" để học!' });
      } else if (currentStatus === 'pending') {
        return res.status(400).json({ success: false, message: 'Yêu cầu tham gia của bạn đang chờ giáo viên duyệt' });
      } else if (currentStatus === 'rejected') {
        await setPersistentStatus(cls.id, studentId, 'pending');
        try {
          await supabase
            .from('class_members')
            .update({ status: 'pending', joined_at: new Date() })
            .eq('id', existingMember.id);
        } catch (upErr) {}

        // Send teacher notification for re-submitted join request immediately
        const sName = clientStudentName || 'Học sinh';
        try {
          await supabase
            .from('teacher_notifications')
            .insert({
              teacher_id: cls.teacher_id,
              title: 'Yêu cầu gia nhập lớp mới',
              content: `Học sinh ${sName} đã gửi lại yêu cầu tham gia vào lớp "${cls.name}" của bạn.`,
              is_read: false
            });
        } catch (notifErr) {}

        return res.json({
          success: true,
          message: 'Đã gửi lại yêu cầu tham gia lớp học. Vui lòng chờ giáo viên duyệt!',
          status: 'pending',
          class: cls
        });
      }
    }

    // Persist status as 'pending' persistently
    await setPersistentStatus(cls.id, studentId, 'pending');

    // Try inserting into database table
    let joinError = null;
    const { error: insErr } = await supabase
      .from('class_members')
      .insert({
        class_id: cls.id,
        student_id: studentId,
        status: 'pending'
      });

    if (insErr) {
      // Fallback if status column is missing in DB
      const { error: insFallbackErr } = await supabase
        .from('class_members')
        .insert({
          class_id: cls.id,
          student_id: studentId
        });
      joinError = insFallbackErr;
    }

    if (joinError && joinError.code !== '23505') {
      console.error('Error joining class:', joinError);
      return res.status(400).json({ success: false, message: joinError.message || 'Không thể gửi yêu cầu tham gia' });
    }

    // Resolve student display name with zero latency if provided, or quick lookup
    let finalStudentName = clientStudentName;
    if (!finalStudentName) {
      try {
        const { data: studentUser } = await supabase
          .from('users')
          .select('display_name, username')
          .eq('id', studentId)
          .maybeSingle();
        finalStudentName = studentUser?.display_name || studentUser?.username || 'Học sinh';
      } catch (e) {
        finalStudentName = 'Học sinh';
      }
    }

    // Create teacher notification immediately to trigger Realtime WebSocket push
    try {
      await supabase
        .from('teacher_notifications')
        .insert({
          teacher_id: cls.teacher_id,
          title: 'Yêu cầu gia nhập lớp mới',
          content: `Học sinh ${finalStudentName} đã gửi yêu cầu tham gia vào lớp "${cls.name}" của bạn.`,
          is_read: false
        });
    } catch (notifErr) {}

    res.json({
      success: true,
      message: 'Đã gửi yêu cầu tham gia lớp học. Vui lòng chờ giáo viên chấp nhận!',
      status: 'pending',
      class: cls
    });
  } catch (error) {
    console.error('Error in /api/classes/join:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/:classId/students - Get students enrolled or pending in a class (High-performance optimized)
router.get('/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;
    const { status } = req.query; // 'approved', 'pending', 'all'

    // Load persistent statuses for this class
    await loadPersistentStatuses(`mem_status:${classId}:%`);

    const { data: members, error } = await supabase
      .from('class_members')
      .select('*')
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching class_members:', error);
      return res.json({ success: true, students: [] });
    }

    if (!members || members.length === 0) {
      return res.json({ success: true, students: [] });
    }

    // Filter by status in memory using getMembershipStatus
    let filteredMembers = members;
    if (status && status !== 'all') {
      filteredMembers = members.filter(m => getMembershipStatus(classId, m.student_id, m.status) === status);
    }

    const memberMap = {};
    filteredMembers.forEach(m => {
      memberMap[m.student_id] = {
        status: getMembershipStatus(classId, m.student_id, m.status),
        joinedAt: m.joined_at
      };
    });

    const studentIds = Object.keys(memberMap);
    if (studentIds.length === 0) {
      return res.json({ success: true, students: [] });
    }

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, username, email, display_name, avatar, xp, level, created_at, status')
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Separate approved students for batch statistics querying
    const approvedStudentIds = studentIds.filter(id => memberMap[id]?.status === 'approved');

    // Batch query lesson completions for all approved students in ONE query
    let completionsByUser = {};
    if (approvedStudentIds.length > 0) {
      try {
        const { data: completions } = await supabase
          .from('lesson_completions')
          .select('user_id, score, total_questions, completed, completed_at')
          .in('user_id', approvedStudentIds);

        (completions || []).forEach(c => {
          if (!completionsByUser[c.user_id]) {
            completionsByUser[c.user_id] = [];
          }
          completionsByUser[c.user_id].push(c);
        });
      } catch (e) {}
    }

    // Batch query assignment completions for all approved students in ONE query
    let manualByUser = {};
    if (approvedStudentIds.length > 0) {
      try {
        const { data: manualList } = await supabase
          .from('teacher_notifications')
          .select('title, created_at')
          .eq('teacher_id', ASSIGNMENT_COMPLETIONS_UUID);

        (manualList || []).forEach(m => {
          if (m.title && m.title.startsWith('asg_comp:')) {
            const parts = m.title.split(':');
            const uid = parts[1];
            if (uid && approvedStudentIds.includes(uid)) {
              if (!manualByUser[uid]) manualByUser[uid] = [];
              manualByUser[uid].push(m);
            }
          }
        });
      } catch (e) {}
    }

    // Map students with stats in memory with zero extra DB roundtrips
    const studentsWithStats = (students || []).map((student) => {
      const mInfo = memberMap[student.id] || { status: 'approved', joinedAt: null };
      const isAccountLocked = student.status === 'inactive';

      // Pending students: return immediately without expensive calculation
      if (mInfo.status === 'pending') {
        return {
          id: student.id,
          name: student.display_name || student.username || (student.email ? student.email.split('@')[0] : 'Học sinh'),
          email: student.email,
          avatar: student.avatar,
          xp: student.xp || 0,
          level: student.level || 1,
          status: 'pending',
          userStatus: student.status || 'active',
          joinedAt: mInfo.joinedAt,
          lessonsCompleted: 0,
          avgScore: 0,
          lastActive: isAccountLocked ? 'Tài khoản bị khóa' : 'Chờ duyệt'
        };
      }

      // Approved students: compute stats from in-memory batch maps
      const userComps = completionsByUser[student.id] || [];
      const userManual = manualByUser[student.id] || [];

      const completedLessons = userComps.filter(c => c.completed).length;
      const lessonsCompleted = completedLessons + userManual.length;

      let avgScore = 0;
      if (userComps.length > 0) {
        const totalPct = userComps.reduce((sum, item) => sum + ((item.score || 0) / (item.total_questions || 1) * 100), 0);
        avgScore = Math.round(totalPct / userComps.length);
      } else if (userManual.length > 0) {
        avgScore = 100;
      }

      let lastActive = isAccountLocked ? 'Tài khoản bị khóa' : 'Không hoạt động';
      let latestTime = null;

      userComps.forEach(c => {
        if (c.completed_at) {
          const t = new Date(c.completed_at).getTime();
          if (!latestTime || t > latestTime) latestTime = t;
        }
      });

      userManual.forEach(m => {
        if (m.created_at) {
          const t = new Date(m.created_at).getTime();
          if (!latestTime || t > latestTime) latestTime = t;
        }
      });

      if (latestTime) {
        const diff = Date.now() - latestTime;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (mins < 1) {
          lastActive = 'Vừa xong';
        } else if (mins < 60) {
          lastActive = `${mins} phút trước`;
        } else if (hours < 24) {
          lastActive = `${hours} giờ trước`;
        } else {
          lastActive = `${days} ngày trước`;
        }
      }

      if (isAccountLocked) {
        lastActive = 'Tài khoản bị khóa';
      }

      return {
        id: student.id,
        name: student.display_name || student.username || (student.email ? student.email.split('@')[0] : 'Học sinh'),
        email: student.email,
        avatar: student.avatar,
        xp: student.xp || 0,
        level: student.level || 1,
        status: mInfo.status,
        userStatus: student.status || 'active',
        joinedAt: mInfo.joinedAt,
        lessonsCompleted,
        avgScore,
        lastActive
      };
    });

    res.json({ success: true, students: studentsWithStats });
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/:classId/students/:studentId/approve - Teacher accepts student join request
router.post('/:classId/students/:studentId/approve', async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    await setPersistentStatus(classId, studentId, 'approved');

    try {
      await supabase
        .from('class_members')
        .update({ status: 'approved' })
        .eq('class_id', classId)
        .eq('student_id', studentId);
    } catch (e) {}

    res.json({ success: true, message: 'Đã chấp nhận học sinh vào lớp' });
  } catch (error) {
    console.error('Error approving student:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/:classId/students/:studentId/reject - Teacher rejects student join request
router.post('/:classId/students/:studentId/reject', async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    await setPersistentStatus(classId, studentId, 'rejected');

    try {
      await supabase
        .from('class_members')
        .update({ status: 'rejected' })
        .eq('class_id', classId)
        .eq('student_id', studentId);
    } catch (e) {}

    res.json({ success: true, message: 'Đã từ chối yêu cầu gia nhập của học sinh' });
  } catch (error) {
    console.error('Error rejecting student:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE /api/classes/:classId/students/:studentId - Teacher kicks/removes student from class
router.delete('/:classId/students/:studentId', async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    await setPersistentStatus(classId, studentId, null);

    const { error } = await supabase
      .from('class_members')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', studentId);

    if (error) throw error;

    res.json({ success: true, message: 'Đã xóa học sinh khỏi lớp thành công' });
  } catch (error) {
    console.error('Error removing student from class:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/student/:studentId - Get classes enrolled or requested by a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Load persistent statuses for this student
    await loadPersistentStatuses(`mem_status:%:${studentId}`);
    
    const { data: memberships, error: memberError } = await supabase
      .from('class_members')
      .select('*')
      .eq('student_id', studentId);
      
    if (memberError) throw memberError;
    
    if (!memberships || memberships.length === 0) {
      return res.json({ success: true, classes: [] });
    }

    const membershipMap = {};
    memberships.forEach(m => {
      membershipMap[m.class_id] = getMembershipStatus(m.class_id, studentId, m.status);
    });
    
    const classIds = memberships.map(m => m.class_id);
    
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .in('id', classIds)
      .order('created_at', { ascending: false });
      
    if (classError) throw classError;
    
    const enrichedClasses = await Promise.all((classes || []).map(async (cls) => {
      let teacher = null;
      try {
        const { data: tData } = await supabase
          .from('users')
          .select('id, display_name, email, avatar')
          .eq('id', cls.teacher_id)
          .maybeSingle();
        teacher = tData;
      } catch (e) {}
        
      let count = 0;
      try {
        const { count: cVal } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id);
        count = cVal || 0;
      } catch (e) {}
        
      return {
        id: cls.id,
        name: cls.name,
        code: cls.code,
        grade: parseGrade(cls.grade, cls.name, cls.id, cls.code, cls.description),
        description: cleanDescription(cls.description),
        created: cls.created_at ? cls.created_at.split('T')[0] : '',
        studentsCount: count,
        membershipStatus: membershipMap[cls.id] || 'pending',
        teacher: teacher ? {
          name: teacher.display_name || (teacher.email ? teacher.email.split('@')[0] : 'Giáo viên'),
          email: teacher.email,
          avatar: teacher.avatar
        } : null
      };
    }));
    
    res.json({ success: true, classes: enrichedClasses });
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/:classId/announcements - Get announcements for a class
router.get('/:classId/announcements', async (req, res) => {
  try {
    const { classId } = req.params;
    const { data, error } = await supabase
      .from('class_announcements')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
      
    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return res.json({ success: true, warning: 'needs_migration', announcements: [] });
      }
      throw error;
    }
    res.json({ success: true, announcements: data || [] });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/:classId/announcements - Post announcement
router.post('/:classId/announcements', async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, content } = req.body;
    
    const { data, error } = await supabase
      .from('class_announcements')
      .insert({ class_id: classId, title, content })
      .select()
      .single();
      
    if (error) throw error;
    res.json({ success: true, announcement: data });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/:classId/assignments - Get assignments for a class (with optional completion status)
router.get('/:classId/assignments', async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.query;
    
    const { data: assignments, error } = await supabase
      .from('class_assignments')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
      
    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return res.json({ success: true, warning: 'needs_migration', assignments: [] });
      }
      throw error;
    }
    
    if (!studentId) {
      return res.json({ success: true, assignments: assignments || [] });
    }
    
    // Fetch manual assignment completions for this student
    const manualCompletions = new Set();
    try {
      const { data: compRecords } = await supabase
        .from('teacher_notifications')
        .select('title')
        .eq('teacher_id', ASSIGNMENT_COMPLETIONS_UUID)
        .like('title', `asg_comp:${studentId}:%`);
        
      if (compRecords) {
        compRecords.forEach(r => {
          const parts = r.title.split(':');
          if (parts[2]) manualCompletions.add(parts[2]);
        });
      }
    } catch (e) {}

    // Check completions if studentId provided
    const enriched = await Promise.all((assignments || []).map(async (asg) => {
      let completed = manualCompletions.has(String(asg.id));
      let score = null;
      
      if (!completed && asg.type === 'lesson') {
        const { data: comp } = await supabase
          .from('lesson_completions')
          .select('completed, score')
          .eq('user_id', studentId)
          .eq('lesson_id', asg.resource_id)
          .maybeSingle();
          
        if (comp) {
          completed = comp.completed;
          score = comp.score;
        }
      } else if (!completed && asg.type === 'challenge') {
        const { data: resObj } = await supabase
          .from('game_results')
          .select('completed, score')
          .eq('user_id', studentId)
          .eq('game_id', asg.resource_id)
          .maybeSingle();
          
        if (resObj) {
          completed = resObj.completed;
          score = resObj.score;
        }
      }
      
      return { ...asg, completed, score };
    }));
    
    res.json({ success: true, assignments: enriched });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/:classId/assignments/:assignmentId/toggle-complete - Student marks assignment completed/incomplete
router.post('/:classId/assignments/:assignmentId/toggle-complete', async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;
    const { studentId, completed } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    const titleKey = `asg_comp:${studentId}:${assignmentId}`;

    let willComplete = completed !== undefined ? !!completed : true;

    if (completed === undefined) {
      const { data: existing } = await supabase
        .from('teacher_notifications')
        .select('id')
        .eq('teacher_id', ASSIGNMENT_COMPLETIONS_UUID)
        .eq('title', titleKey)
        .maybeSingle();
      willComplete = !existing;
    }

    if (willComplete) {
      // Upsert/Insert completion record
      await supabase
        .from('teacher_notifications')
        .delete()
        .eq('teacher_id', ASSIGNMENT_COMPLETIONS_UUID)
        .eq('title', titleKey);

      await supabase
        .from('teacher_notifications')
        .insert({
          teacher_id: ASSIGNMENT_COMPLETIONS_UUID,
          title: titleKey,
          content: JSON.stringify({
            studentId,
            assignmentId,
            classId,
            completedAt: new Date().toISOString(),
            score: null
          }),
          is_read: true
        });

      // Send teacher notification about student completion
      try {
        const { data: cls } = await supabase
          .from('classes')
          .select('id, name, teacher_id')
          .eq('id', classId)
          .maybeSingle();

        const { data: asg } = await supabase
          .from('class_assignments')
          .select('id, title')
          .eq('id', assignmentId)
          .maybeSingle();

        const { data: studentUser } = await supabase
          .from('users')
          .select('display_name, username')
          .eq('id', studentId)
          .maybeSingle();

        const studentName = studentUser?.display_name || studentUser?.username || 'Học sinh';
        const asgTitle = asg?.title || 'Bài tập';
        const className = cls?.name || 'Lớp học';

        if (cls?.teacher_id) {
          await supabase
            .from('teacher_notifications')
            .insert({
              teacher_id: cls.teacher_id,
              title: 'Học sinh đã hoàn thành bài tập',
              content: `Học sinh ${studentName} đã hoàn thành bài tập "${asgTitle}" trong lớp "${className}".`,
              is_read: false
            });
        }
      } catch (notifErr) {
        console.error('Error sending teacher notification on assignment complete:', notifErr);
      }

      return res.json({
        success: true,
        completed: true,
        message: 'Đã báo cáo hoàn thành bài tập tới giáo viên!'
      });
    } else {
      // Remove completion record
      await supabase
        .from('teacher_notifications')
        .delete()
        .eq('teacher_id', ASSIGNMENT_COMPLETIONS_UUID)
        .eq('title', titleKey);

      return res.json({
        success: true,
        completed: false,
        message: 'Đã hủy đánh dấu hoàn thành bài tập'
      });
    }
  } catch (error) {
    console.error('Error toggling assignment completion:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/:classId/assignments - Assign homework
router.post('/:classId/assignments', async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, type, resourceId, link, dueDate } = req.body;

    let validParamType = type;
    if (!validParamType || validParamType === 'link') {
      validParamType = 'custom';
    }

    let formattedDueDate = null;
    if (dueDate && typeof dueDate === 'string' && dueDate.trim() !== '') {
      formattedDueDate = dueDate.trim();
    }
    
    const insertPayload = {
      class_id: classId,
      title: title ? title.trim() : '',
      description: description ? description.trim() : null,
      type: validParamType,
      resource_id: link || resourceId || '',
      due_date: formattedDueDate
    };

    if (link) {
      insertPayload.link = link;
    }
    
    const { data, error } = await supabase
      .from('class_assignments')
      .insert(insertPayload)
      .select()
      .single();
      
    if (error) {
      if (error.message && (error.message.includes('link') || error.code === 'PGRST204')) {
        delete insertPayload.link;
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from('class_assignments')
          .insert(insertPayload)
          .select()
          .single();
        if (fallbackErr) throw fallbackErr;
        return res.json({ success: true, assignment: fallbackData });
      }
      throw error;
    }
    res.json({ success: true, assignment: data });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/:classId/meetings - Get meetings
router.get('/:classId/meetings', async (req, res) => {
  try {
    const { classId } = req.params;
    const { data, error } = await supabase
      .from('class_meetings')
      .select('*')
      .eq('class_id', classId)
      .order('start_time', { ascending: true });
      
    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return res.json({ success: true, warning: 'needs_migration', meetings: [] });
      }
      throw error;
    }
    res.json({ success: true, meetings: data || [] });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/:classId/meetings - Add meeting
router.post('/:classId/meetings', async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, meetingLink, startTime } = req.body;
    
    const { data, error } = await supabase
      .from('class_meetings')
      .insert({
        class_id: classId,
        title,
        description,
        meeting_link: meetingLink,
        start_time: startTime
      })
      .select()
      .single();
      
    if (error) throw error;
    res.json({ success: true, meeting: data });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/:classId/discussions - Get discussions
router.get('/:classId/discussions', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const { data: posts, error } = await supabase
      .from('class_discussions')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: true });
      
    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return res.json({ success: true, warning: 'needs_migration', discussions: [] });
      }
      throw error;
    }
    
    if (!posts || posts.length === 0) {
      return res.json({ success: true, discussions: [] });
    }
    
    const userIds = [...new Set(posts.map(p => p.user_id))];
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email, avatar, role')
      .in('id', userIds);
      
    if (userError) throw userError;
    
    const userMap = {};
    (users || []).forEach(u => {
      userMap[u.id] = {
        name: u.display_name || u.email.split('@')[0],
        email: u.email,
        avatar: u.avatar,
        role: u.role
      };
    });
    
    const enrichedPosts = posts.map(p => ({
      ...p,
      user: userMap[p.user_id] || { name: 'Người dùng ẩn danh', email: '', avatar: '', role: 'student' }
    }));
    
    res.json({ success: true, discussions: enrichedPosts });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/:classId/discussions - Post message
router.post('/:classId/discussions', async (req, res) => {
  try {
    const { classId } = req.params;
    const { userId, content } = req.body;
    
    const { data, error } = await supabase
      .from('class_discussions')
      .insert({
        class_id: classId,
        user_id: userId,
        content
      })
      .select()
      .single();
      
    if (error) throw error;
    
    const { data: userObj } = await supabase
      .from('users')
      .select('id, display_name, email, avatar, role')
      .eq('id', userId)
      .single();
      
    try {
      const { data: cls } = await supabase
        .from('classes')
        .select('name, teacher_id')
        .eq('id', classId)
        .single();

      if (cls && cls.teacher_id !== userId) {
        const studentName = userObj?.display_name || userObj?.email.split('@')[0] || 'Học sinh';
        await supabase
          .from('teacher_notifications')
          .insert({
            teacher_id: cls.teacher_id,
            title: 'Thảo luận mới trong lớp',
            content: `Học sinh ${studentName} đã gửi tin nhắn thảo luận mới trong lớp "${cls.name}".`,
            is_read: false
          });
      }
    } catch (notifErr) {}
      
    res.json({
      success: true,
      discussion: {
        ...data,
        user: userObj ? {
          name: userObj.display_name || userObj.email.split('@')[0],
          email: userObj.email,
          avatar: userObj.avatar,
          role: userObj.role
        } : null
      }
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/teacher/:teacherId/notifications - Fetch notifications
router.get('/teacher/:teacherId/notifications', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { data, error } = await supabase
      .from('teacher_notifications')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return res.json({ success: true, warning: 'needs_migration', notifications: [] });
      }
      throw error;
    }

    res.json({ success: true, notifications: data || [] });
  } catch (error) {
    console.error('Error fetching teacher notifications:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes/teacher/:teacherId/notifications/read-all - Mark all notifications as read
router.post('/teacher/:teacherId/notifications/read-all', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { error } = await supabase
      .from('teacher_notifications')
      .update({ is_read: true })
      .eq('teacher_id', teacherId);

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return res.json({ success: true, warning: 'needs_migration' });
      }
      throw error;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
