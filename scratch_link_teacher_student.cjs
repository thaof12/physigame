const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function linkTeacherAndStudent() {
  console.log('🔗 LINKING TEACHER AND STUDENT ACCOUNTS ACROSS ALL FEATURES...');

  // 1. Get Teacher and Student Auth IDs
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const teacherAuth = authUsers?.users?.find(u => u.email === 'teacher@gmail.com');
  const studentAuth = authUsers?.users?.find(u => u.email === 'student@gmail.com');

  if (!teacherAuth || !studentAuth) {
    console.error('❌ Missing teacher or student auth users!');
    return;
  }

  const teacherId = teacherAuth.id;
  const studentId = studentAuth.id;

  const teacherAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=TeacherTest';
  const studentAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=StudentTest';

  console.log(`Teacher ID: ${teacherId}`);
  console.log(`Student ID: ${studentId}`);

  // 2. Link Lessons to Teacher
  console.log('--- Updating Lessons with Teacher ID ---');
  const { error: lErr } = await supabase
    .from('lessons')
    .update({ teacher_id: teacherId, students_count: 8, views: 125 })
    .eq('class_id', 10);

  if (lErr) console.warn('Lesson update info:', lErr.message);
  else console.log('✅ Linked grade 10 lessons to teacher@gmail.com.');

  // 3. Link Challenges to Teacher
  console.log('--- Updating Challenges with Teacher ID ---');
  const { error: cErr } = await supabase
    .from('challenges')
    .update({ teacher_id: teacherId, completions_count: 12, avg_score: 95 })
    .in('challenge_id', [2000, 2001, 2002]);

  if (cErr) console.warn('Challenge update info:', cErr.message);
  else console.log('✅ Linked challenges (2000, 2001, 2002) to teacher@gmail.com.');

  // 4. Add direct Teacher-Student Friendly PK Match in Battles
  console.log('--- Adding Teacher vs Student Friendly Arena Match ---');
  const matchId = 'a0000007-0000-4000-8000-000000000007';
  await supabase.from('battles').delete().eq('id', matchId);

  const { error: bErr } = await supabase.from('battles').insert({
    id: matchId,
    room_id: 'TS_PK01',
    status: 'finished',
    game_type: 'physics',
    game_mode: 'mixed',
    grade: '10',
    topic: 'Thi Đấu Giao Lưu Thầy & Trò (Cơ Học)',
    difficulty: 'hard',
    players: [
      { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar, score: 960, correctAnswers: 10, wrongAnswers: 0, isHost: true },
      { firebaseUid: teacherId, displayName: 'Thầy Nguyễn Văn Đức', avatar: teacherAvatar, score: 920, correctAnswers: 9, wrongAnswers: 1, isHost: false }
    ],
    winner: { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar },
    total_questions: 10,
    finished_at: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
  });

  if (bErr) console.error('❌ Error adding teacher-student battle:', bErr.message);
  else console.log('✅ Added Friendly PK Match between Thầy Nguyễn Văn Đức & Nguyễn Văn Học Sinh!');

  // 5. Create teacher notification
  try {
    await supabase.from('teacher_notifications').insert({
      teacher_id: teacherId,
      title: 'Học sinh hoàn thành bài học xuất sắc',
      content: 'Học sinh Nguyễn Văn Học Sinh (student@gmail.com) vừa đạt 100% trong bài kiểm tra Lớp Vật Lý 10A1!',
      is_read: false,
      created_at: new Date().toISOString()
    });
    console.log('✅ Created teacher notification for student activity.');
  } catch (notifErr) {
    console.log('ℹ️ Teacher notification table skipped.');
  }

  // 6. Verify class membership confirmation
  const { data: classes } = await supabase.from('classes').select('id, name, code').eq('teacher_id', teacherId);
  console.log('\n--- VERIFYING LINKED CLASSES ---');
  if (classes) {
    for (const cls of classes) {
      const { data: members } = await supabase.from('class_members').select('student_id, joined_at').eq('class_id', cls.id);
      console.log(`Class: "${cls.name}" (Code: ${cls.code}) has ${members?.length || 0} members.`);
      const isStudentIn = members?.some(m => m.student_id === studentId);
      console.log(`  -> Student (student@gmail.com) enrolled: ${isStudentIn ? 'YES ✅' : 'NO ❌'}`);
    }
  }

  console.log('\n🎉 TEACHER AND STUDENT ACCOUNTS ARE NOW FULLY INTERCONNECTED!');
  process.exit(0);
}

linkTeacherAndStudent();
