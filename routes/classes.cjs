const express = require('express');
const router = express.Router();
const { supabase } = require('../src/config/supabase.cjs');

// Generate a random class code: 6 uppercase characters
function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/classes/teacher/:teacherId - Get classes for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Fetch classes
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // For each class, fetch members count dynamically
    const classesWithCounts = await Promise.all((classes || []).map(async (cls) => {
      const { count, error: countError } = await supabase
        .from('class_members')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', cls.id);

      // Also get the number of lessons assigned to this class/teacher
      const { count: lessonsCount, error: lessonsCountError } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId);

      return {
        id: cls.id,
        name: cls.name,
        code: cls.code,
        students: count || 0,
        lessons: lessonsCount || 0,
        created: cls.created_at ? cls.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
    }));

    res.json({ success: true, classes: classesWithCounts });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/classes - Create a new class
router.post('/', async (req, res) => {
  try {
    const { teacherId, name } = req.body;
    if (!teacherId || !name) {
      return res.status(400).json({ success: false, message: 'Missing teacherId or name' });
    }

    // Generate unique class code
    let code = generateClassCode();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const { data, error } = await supabase
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

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        teacher_id: teacherId,
        name,
        code,
        lessons_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      class: {
        id: newClass.id,
        name: newClass.name,
        code: newClass.code,
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

// POST /api/classes/join - Join a class via class code
router.post('/join', async (req, res) => {
  try {
    const { studentId, classCode } = req.body;
    if (!studentId || !classCode) {
      return res.status(400).json({ success: false, message: 'Missing studentId or classCode' });
    }

    // Find class
    const { data: cls, error: findError } = await supabase
      .from('classes')
      .select('*')
      .eq('code', classCode.trim().toUpperCase())
      .maybeSingle();

    if (findError) throw findError;
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Mã lớp không chính xác' });
    }

    // Join
    const { error: joinError } = await supabase
      .from('class_members')
      .insert({
        class_id: cls.id,
        student_id: studentId
      });

    if (joinError) {
      if (joinError.code === '23505') {
        return res.status(400).json({ success: false, message: 'Bạn đã tham gia lớp này rồi' });
      }
      throw joinError;
    }

    // Create teacher notification asynchronously
    try {
      const { data: studentUser } = await supabase
        .from('users')
        .select('display_name, username')
        .eq('id', studentId)
        .maybeSingle();
      const studentName = studentUser?.display_name || studentUser?.username || 'Học sinh';

      await supabase
        .from('teacher_notifications')
        .insert({
          teacher_id: cls.teacher_id,
          title: 'Học sinh mới tham gia lớp',
          content: `Học sinh ${studentName} đã tham gia vào lớp "${cls.name}" của bạn.`,
          is_read: false
        });
    } catch (notifErr) {
      console.error('Error creating teacher notification for join:', notifErr);
    }

    res.json({ success: true, message: 'Tham gia lớp thành công', class: cls });
  } catch (error) {
    console.error('Error joining class:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/:classId/students - Get students enrolled in a class
router.get('/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;

    const { data: members, error } = await supabase
      .from('class_members')
      .select('student_id, joined_at')
      .eq('class_id', classId);

    if (error) throw error;

    const studentIds = (members || []).map(m => m.student_id);
    if (studentIds.length === 0) {
      return res.json({ success: true, students: [] });
    }

    // Fetch student profile details from public.users
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, username, email, display_name, avatar, xp, level, created_at')
      .in('id', studentIds);

    if (studentsError) throw studentsError;

    // Get completions/stats for each student
    const studentsWithStats = await Promise.all((students || []).map(async (student) => {
      // Count completions from lesson_completions
      const { count: lessonsCompleted, error: lcError } = await supabase
        .from('lesson_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', student.id)
        .eq('completed', true);

      // Average score from lesson_completions
      const { data: lcScores, error: lcSerror } = await supabase
        .from('lesson_completions')
        .select('score, total_questions')
        .eq('user_id', student.id);

      let avgScore = 0;
      if (lcScores && lcScores.length > 0) {
        const totalPct = lcScores.reduce((sum, item) => sum + (item.score / (item.total_questions || 1) * 100), 0);
        avgScore = Math.round(totalPct / lcScores.length);
      }

      // Last active: get from lesson_completions or users.updated_at
      const { data: latestCompletion, error: lCompError } = await supabase
        .from('lesson_completions')
        .select('completed_at')
        .eq('user_id', student.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let lastActive = 'Không hoạt động';
      if (latestCompletion && latestCompletion.completed_at) {
        const diff = Date.now() - new Date(latestCompletion.completed_at).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (mins < 60) {
          lastActive = `${mins} phút trước`;
        } else if (hours < 24) {
          lastActive = `${hours} giờ trước`;
        } else {
          lastActive = `${days} ngày trước`;
        }
      }

      return {
        id: student.id,
        name: student.display_name || student.username || student.email.split('@')[0],
        email: student.email,
        xp: student.xp || 0,
        level: student.level || 1,
        lessonsCompleted: lessonsCompleted || 0,
        avgScore: avgScore || 0,
        lastActive
      };
    }));

    res.json({ success: true, students: studentsWithStats });
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/classes/student/:studentId - Get classes enrolled by a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const { data: memberships, error: memberError } = await supabase
      .from('class_members')
      .select('class_id, joined_at')
      .eq('student_id', studentId);
      
    if (memberError) throw memberError;
    
    if (!memberships || memberships.length === 0) {
      return res.json({ success: true, classes: [] });
    }
    
    const classIds = memberships.map(m => m.class_id);
    
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .in('id', classIds)
      .order('created_at', { ascending: false });
      
    if (classError) throw classError;
    
    const enrichedClasses = await Promise.all((classes || []).map(async (cls) => {
      // Get teacher profile details
      const { data: teacher, error: teacherError } = await supabase
        .from('users')
        .select('id, display_name, email, avatar')
        .eq('id', cls.teacher_id)
        .maybeSingle();
        
      // Get student count in class
      const { count, error: countError } = await supabase
        .from('class_members')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', cls.id);
        
      return {
        id: cls.id,
        name: cls.name,
        code: cls.code,
        created: cls.created_at ? cls.created_at.split('T')[0] : '',
        studentsCount: count || 0,
        teacher: teacher ? {
          name: teacher.display_name || teacher.email.split('@')[0],
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
    
    // Check completions if studentId provided
    const enriched = await Promise.all((assignments || []).map(async (asg) => {
      let completed = false;
      let score = null;
      
      if (asg.type === 'lesson') {
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
      } else if (asg.type === 'challenge') {
        // Find in game_results
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

    // Store link if column exists in schema
    if (link) {
      insertPayload.link = link;
    }
    
    const { data, error } = await supabase
      .from('class_assignments')
      .insert(insertPayload)
      .select()
      .single();
      
    if (error) {
      // If error is due to missing 'link' column in database table, fallback without 'link' field
      if (error.message && (error.message.includes('link') || error.code === 'PGRST204')) {
        delete insertPayload.link;
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from('class_assignments')
          .insert(insertPayload)
          .select()
          .single();
        if (fallbackErr) {
          console.error('Fallback assignment error:', fallbackErr);
          throw fallbackErr;
        }
        return res.json({ success: true, assignment: fallbackData });
      }
      console.error('Insert assignment error:', error);
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
    
    // Fetch posting user info
    const { data: userObj } = await supabase
      .from('users')
      .select('id, display_name, email, avatar, role')
      .eq('id', userId)
      .single();
      
    // Create teacher notification asynchronously
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
    } catch (notifErr) {
      console.error('Error creating teacher notification for discussion:', notifErr);
    }
      
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
