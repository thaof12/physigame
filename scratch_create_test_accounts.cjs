const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCompleteSeeding() {
  try {
    console.log('🚀 Setting up complete test accounts for PhysiGame...');

    // 1. Get existing auth users
    const { data: authList } = await supabase.auth.admin.listUsers();
    let studentAuth = authList?.users?.find(u => u.email === 'student@gmail.com');
    let teacherAuth = authList?.users?.find(u => u.email === 'teacher@gmail.com');

    // Create Teacher Auth if not exists
    if (!teacherAuth) {
      console.log('🔑 Creating Teacher Auth User (teacher@gmail.com)...');
      const { data: createdTeacher, error: tErr } = await supabase.auth.admin.createUser({
        email: 'teacher@gmail.com',
        password: 'teacher123@',
        email_confirm: true,
        user_metadata: { username: 'teacher_test', display_name: 'Thầy Nguyễn Văn Đức', role: 'teacher' }
      });
      if (tErr) throw tErr;
      teacherAuth = createdTeacher.user;
    } else {
      console.log('ℹ️ Teacher Auth User exists:', teacherAuth.id);
      await supabase.auth.admin.updateUserById(teacherAuth.id, { password: 'teacher123@' });
    }

    // Create Student Auth if not exists
    if (!studentAuth) {
      console.log('🔑 Creating Student Auth User (student@gmail.com)...');
      const { data: createdStudent, error: sErr } = await supabase.auth.admin.createUser({
        email: 'student@gmail.com',
        password: 'student123@',
        email_confirm: true,
        user_metadata: { username: 'student_test', display_name: 'Nguyễn Văn Học Sinh', role: 'student' }
      });
      if (sErr) throw sErr;
      studentAuth = createdStudent.user;
    } else {
      console.log('ℹ️ Student Auth User exists:', studentAuth.id);
      await supabase.auth.admin.updateUserById(studentAuth.id, { password: 'student123@' });
    }

    const teacherId = teacherAuth.id;
    const studentId = studentAuth.id;

    // 2. Upsert Teacher Profile in public.users
    const teacherAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=TeacherTest';
    const teacherProfile = {
      full_name: 'Nguyễn Văn Đức',
      phone: '0987654321',
      school: 'THPT Chuyên Quốc Học',
      experience: '8 năm kinh nghiệm giảng dạy Vật Lý THPT',
      bio: 'Giảng viên Vật Lý THPT chuyên môn cao, tâm huyết với việc ứng dụng công nghệ và mô phỏng game vào giảng dạy.',
      subjects: ['Vật lý 10', 'Vật lý 11', 'Vật lý 12'],
      avatar: teacherAvatar
    };

    const { error: tUserErr } = await supabase.from('users').upsert({
      id: teacherId,
      username: 'teacher_test',
      email: 'teacher@gmail.com',
      display_name: 'Thầy Nguyễn Văn Đức',
      avatar: teacherAvatar,
      role: 'teacher',
      status: 'active',
      teacher_status: 'verified',
      teacher_profile: teacherProfile,
      profile: { bio: teacherProfile.bio, school: teacherProfile.school },
      xp: 850,
      level: 9,
      programs: []
    });
    if (tUserErr) console.error('❌ Error updating teacher user:', tUserErr.message);
    else console.log('✅ Updated public.users for Teacher.');

    // 3. Upsert Student Profile in public.users
    const studentAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=StudentTest';
    const studentProfile = {
      bio: 'Học sinh đam mê môn Vật lý, chăm chỉ ôn tập và tích cực tham gia thi đấu arena!',
      school: 'THPT Chuyên KNTT',
      grade: 10,
      avatar: studentAvatar
    };

    const studentPrograms = [
      {
        programId: 'physics_10',
        programName: 'Vật Lý 10',
        currentClass: 10,
        isActive: true,
        placementTestCompleted: true,
        placementTestScore: 90,
        enrolledAt: '2026-09-01T08:00:00.000Z',
        progress: {
          completedLessons: ['10-1-1', '10-1-2', '10-1-3', '10-2-1', '10-2-2'],
          totalScore: 480,
          lastStudyDate: '2026-09-17T15:30:00.000Z',
          lessonStars: {
            '10-1-1': 3,
            '10-1-2': 3,
            '10-1-3': 3,
            '10-2-1': 3,
            '10-2-2': 2
          }
        }
      }
    ];

    const { error: sUserErr } = await supabase.from('users').upsert({
      id: studentId,
      username: 'student_test',
      email: 'student@gmail.com',
      display_name: 'Nguyễn Văn Học Sinh',
      avatar: studentAvatar,
      role: 'student',
      status: 'active',
      profile: studentProfile,
      xp: 1450,
      level: 15,
      programs: studentPrograms,
      physics_game_progress: {
        total_score: 950,
        completed_games_count: 5
      }
    });
    if (sUserErr) console.error('❌ Error updating student user:', sUserErr.message);
    else console.log('✅ Updated public.users for Student.');

    // 4. Create Classes for Teacher
    console.log('\n--- Creating Teacher Classes ---');
    await supabase.from('classes').delete().eq('teacher_id', teacherId);

    const { data: cls1 } = await supabase.from('classes').insert({
      teacher_id: teacherId,
      name: 'Lớp Vật Lý 10A1 - Cơ Học & Động Học',
      code: 'PHYS10',
      lessons_count: 5
    }).select().single();

    const { data: cls2 } = await supabase.from('classes').insert({
      teacher_id: teacherId,
      name: 'Lớp Vật Lý 11B2 - Điện Tích & Dòng Điện',
      code: 'PHYS11',
      lessons_count: 4
    }).select().single();

    const { data: cls3 } = await supabase.from('classes').insert({
      teacher_id: teacherId,
      name: 'Lớp Ôn Thi THPT Quốc Gia - Vật Lý 12',
      code: 'PHYS12',
      lessons_count: 6
    }).select().single();

    console.log('✅ Created 3 classes (PHYS10, PHYS11, PHYS12).');

    // 5. Enroll Student into Teacher Classes
    if (cls1 && cls2) {
      await supabase.from('class_members').delete().eq('student_id', studentId);
      await supabase.from('class_members').insert([
        { class_id: cls1.id, student_id: studentId },
        { class_id: cls2.id, student_id: studentId }
      ]);

      // Add other active students to class 1 as roster members
      const { data: otherStudents } = await supabase.from('users').select('id').eq('role', 'student').neq('id', studentId).limit(2);
      if (otherStudents && otherStudents.length > 0) {
        for (const st of otherStudents) {
          try {
            await supabase.from('class_members').insert({ class_id: cls1.id, student_id: st.id });
          } catch (e) {}
        }
      }
      console.log('✅ Student enrolled in PHYS10 and PHYS11.');
    }

    // 6. Seed Student Learning History & Game Results
    console.log('\n--- Seeding Student Learning History & Game Results ---');
    await supabase.from('lesson_completions').delete().eq('user_id', studentId);
    await supabase.from('lesson_completions').insert([
      { user_id: studentId, lesson_id: '10-1-1', class_id: 10, chapter_id: 1, lesson_number: 1, completed: true, score: 10, total_questions: 10, quiz_answers: [] },
      { user_id: studentId, lesson_id: '10-1-2', class_id: 10, chapter_id: 1, lesson_number: 2, completed: true, score: 10, total_questions: 10, quiz_answers: [] },
      { user_id: studentId, lesson_id: '10-1-3', class_id: 10, chapter_id: 1, lesson_number: 3, completed: true, score: 10, total_questions: 10, quiz_answers: [] },
      { user_id: studentId, lesson_id: '10-2-1', class_id: 10, chapter_id: 2, lesson_number: 1, completed: true, score: 10, total_questions: 10, quiz_answers: [] },
      { user_id: studentId, lesson_id: '10-2-2', class_id: 10, chapter_id: 2, lesson_number: 2, completed: true, score: 8, total_questions: 10, quiz_answers: [] }
    ]);
    console.log('✅ Seeded 5 lesson completions.');

    await supabase.from('game_results').delete().eq('user_id', studentId);
    await supabase.from('game_results').insert([
      { user_id: studentId, user_email: 'student@gmail.com', game_id: '2000', grade: 10, chapter: 1, score: 100, max_score: 100, stars: 3, completed: true, play_time: 120, attempts: 1 },
      { user_id: studentId, user_email: 'student@gmail.com', game_id: '2001', grade: 10, chapter: 1, score: 95, max_score: 100, stars: 3, completed: true, play_time: 140, attempts: 1 },
      { user_id: studentId, user_email: 'student@gmail.com', game_id: '2002', grade: 10, chapter: 2, score: 90, max_score: 100, stars: 3, completed: true, play_time: 160, attempts: 2 }
    ]);
    console.log('✅ Seeded 3 game results.');

    await supabase.from('physics_game_progress').delete().eq('user_id', studentId);
    await supabase.from('physics_game_progress').insert({
      user_id: studentId,
      user_email: 'student@gmail.com',
      grade: 10,
      completed_games: ['2000', '2001', '2002'],
      total_score: 285,
      total_trophies: 3
    });

    await supabase.from('user_progress').delete().eq('user_id', studentId);
    await supabase.from('user_progress').insert({
      user_id: studentId,
      learning_progress: [
        { lessonId: '10-1-1', completed: true, score: 100 },
        { lessonId: '10-1-2', completed: true, score: 100 },
        { lessonId: '10-1-3', completed: true, score: 100 },
        { lessonId: '10-2-1', completed: true, score: 100 },
        { lessonId: '10-2-2', completed: true, score: 80 }
      ],
      game_progress: [
        { gameId: '2000', completed: true, stars: 3 },
        { gameId: '2001', completed: true, stars: 3 },
        { gameId: '2002', completed: true, stars: 3 }
      ]
    });
    console.log('✅ Seeded physics & overall progress.');

    // 7. Seed Arena Battles
    console.log('\n--- Seeding Arena Battles (Đấu Trường PK) ---');
    const battleIds = [
      'a0000001-0000-4000-8000-000000000001',
      'a0000002-0000-4000-8000-000000000002',
      'a0000003-0000-4000-8000-000000000003',
      'a0000004-0000-4000-8000-000000000004',
      'a0000005-0000-4000-8000-000000000005',
      'a0000006-0000-4000-8000-000000000006'
    ];
    await supabase.from('battles').delete().in('id', battleIds);

    await supabase.from('battles').insert([
      {
        id: battleIds[0],
        room_id: 'BTL001',
        status: 'finished',
        game_type: 'physics',
        game_mode: 'quiz',
        grade: '10',
        topic: 'Cơ Học',
        difficulty: 'medium',
        players: [
          { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar, score: 920, correctAnswers: 9, wrongAnswers: 1, isHost: true },
          { firebaseUid: 'opponent_01', displayName: 'Trần Văn Nam', avatar: '', score: 680, correctAnswers: 6, wrongAnswers: 4 }
        ],
        winner: { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar },
        total_questions: 10,
        finished_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
      },
      {
        id: battleIds[1],
        room_id: 'BTL002',
        status: 'finished',
        game_type: 'physics',
        game_mode: 'mixed',
        grade: '10',
        topic: 'Động Học',
        difficulty: 'hard',
        players: [
          { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar, score: 980, correctAnswers: 10, wrongAnswers: 0, isHost: false },
          { firebaseUid: 'opponent_02', displayName: 'Lê Minh Anh', avatar: '', score: 720, correctAnswers: 7, wrongAnswers: 3 }
        ],
        winner: { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar },
        total_questions: 10,
        finished_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
      },
      {
        id: battleIds[2],
        room_id: 'BTL003',
        status: 'finished',
        game_type: 'physics',
        game_mode: 'challenge',
        grade: '10',
        topic: 'Lực & Chuyển Động',
        difficulty: 'medium',
        players: [
          { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar, score: 850, correctAnswers: 8, wrongAnswers: 2, isHost: true },
          { firebaseUid: 'opponent_03', displayName: 'Phạm Bảo Hoàng', avatar: '', score: 610, correctAnswers: 6, wrongAnswers: 4 }
        ],
        winner: { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar },
        total_questions: 10,
        finished_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
      },
      {
        id: battleIds[3],
        room_id: 'BTL004',
        status: 'finished',
        game_type: 'physics',
        game_mode: 'quiz',
        grade: '10',
        topic: 'Năng Lượng',
        difficulty: 'easy',
        players: [
          { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar, score: 890, correctAnswers: 9, wrongAnswers: 1, isHost: true },
          { firebaseUid: 'opponent_04', displayName: 'Ngô Thanh Hải', avatar: '', score: 550, correctAnswers: 5, wrongAnswers: 5 }
        ],
        winner: { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar },
        total_questions: 10,
        finished_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      },
      {
        id: battleIds[4],
        room_id: 'BTL005',
        status: 'finished',
        game_type: 'physics',
        game_mode: 'mixed',
        grade: '10',
        topic: 'Động Lực Học',
        difficulty: 'hard',
        players: [
          { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar, score: 940, correctAnswers: 9, wrongAnswers: 1, isHost: false },
          { firebaseUid: 'opponent_05', displayName: 'Vũ Quốc Huy', avatar: '', score: 800, correctAnswers: 8, wrongAnswers: 2 }
        ],
        winner: { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar },
        total_questions: 10,
        finished_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
      },
      {
        id: battleIds[5],
        room_id: 'BTL006',
        status: 'finished',
        game_type: 'physics',
        game_mode: 'quiz',
        grade: '10',
        topic: 'Tổng Hợp Lực',
        difficulty: 'hard',
        players: [
          { firebaseUid: studentId, displayName: 'Nguyễn Văn Học Sinh', avatar: studentAvatar, score: 760, correctAnswers: 7, wrongAnswers: 3, isHost: true },
          { firebaseUid: 'opponent_top', displayName: 'Đặng Bích Ngọc', avatar: '', score: 960, correctAnswers: 9, wrongAnswers: 1 }
        ],
        winner: { firebaseUid: 'opponent_top', displayName: 'Đặng Bích Ngọc', avatar: '' },
        total_questions: 10,
        finished_at: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ]);
    console.log('✅ Seeded 6 arena matches (5 Wins, 1 Loss).');

    // 8. Seed Badges & Quests
    console.log('\n--- Seeding Badges & Quest Achievements ---');
    const achievementsPayload = [
      { id: 'first_lesson', unlockedAt: '2026-09-02T09:00:00.000Z' },
      { id: 'lessons_10', unlockedAt: '2026-09-08T10:30:00.000Z' },
      { id: 'streak_7', unlockedAt: '2026-09-12T08:00:00.000Z' },
      { id: 'perfect_scores_5', unlockedAt: '2026-09-14T14:15:00.000Z' },
      { id: 'xp_1000', unlockedAt: '2026-09-15T16:00:00.000Z' },
      { id: 'level_5', unlockedAt: '2026-09-15T16:00:00.000Z' },
      { id: 'pk_winner_5', unlockedAt: '2026-09-17T17:30:00.000Z' },
      { id: 'challenges_10', unlockedAt: '2026-09-17T18:00:00.000Z' }
    ];

    const dailyQuestsPayload = [
      { odId: 'daily_login', odType: 'daily', progress: 1, target: 1, completed: true, claimed: true },
      { odId: 'complete_1_lesson', odType: 'daily', progress: 1, target: 1, completed: true, claimed: true },
      { odId: 'complete_3_lessons', odType: 'daily', progress: 3, target: 3, completed: true, claimed: false },
      { odId: 'complete_1_challenge', odType: 'daily', progress: 1, target: 1, completed: true, claimed: true },
      { odId: 'score_80_percent', odType: 'daily', progress: 1, target: 1, completed: true, claimed: true }
    ];

    const weeklyQuestsPayload = [
      { odId: 'weekly_5_lessons', odType: 'weekly', progress: 5, target: 5, completed: true, claimed: true },
      { odId: 'weekly_streak_3', odType: 'weekly', progress: 3, target: 3, completed: true, claimed: true },
      { odId: 'weekly_perfect_score', odType: 'weekly', progress: 1, target: 1, completed: true, claimed: true },
      { odId: 'weekly_pk_battle', odType: 'weekly', progress: 1, target: 1, completed: true, claimed: true }
    ];

    await supabase.from('quest_progress').delete().eq('user_id', studentId);
    await supabase.from('quest_progress').insert({
      user_id: studentId,
      daily_quests: dailyQuestsPayload,
      weekly_quests: weeklyQuestsPayload,
      achievements: achievementsPayload,
      login_streak: { current: 7, longest: 14, lastLoginDate: new Date().toISOString() },
      stats: { totalQuestsCompleted: 24, totalRewardsClaimed: 20, totalXPFromQuests: 850 }
    });
    console.log('✅ Seeded quest progress & 8 earned badges for Student.');

    console.log('\n✨ DONE! ALL ACCOUNTS AND REAL DATABASE RECORDS ARE FULLY PREPARED AND STORED! ✨');
    process.exit(0);
  } catch (err) {
    console.error('💥 Error in seeding script:', err);
    process.exit(1);
  }
}

runCompleteSeeding();
