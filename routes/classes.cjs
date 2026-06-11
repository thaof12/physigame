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

module.exports = router;
