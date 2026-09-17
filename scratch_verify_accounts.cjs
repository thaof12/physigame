const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAccounts() {
  console.log('🔍 VERIFYING STUDENT ACCOUNT LOGIN & DATA...');

  // 1. Login Student
  const { data: sAuth, error: sAuthErr } = await anonClient.auth.signInWithPassword({
    email: 'student@gmail.com',
    password: 'student123@'
  });

  if (sAuthErr) {
    console.error('❌ Student login failed:', sAuthErr.message);
  } else {
    console.log('✅ Student Login Successful! User ID:', sAuth.user.id);
  }

  // Fetch Student Profile from public.users
  const { data: studentUser } = await serviceClient.from('users').select('*').eq('email', 'student@gmail.com').single();
  console.log('  - Display Name:', studentUser.display_name);
  console.log('  - Role:', studentUser.role);
  console.log('  - Level:', studentUser.level, '| XP:', studentUser.xp);
  console.log('  - Enrolled Programs:', studentUser.programs?.length || 0);

  // Check Student Battles
  const { data: battles } = await serviceClient.from('battles').select('*').contains('players', JSON.stringify([{ firebaseUid: studentUser.id }]));
  console.log('  - Arena Battles Count:', battles.length);

  // Check Student Badges & Quests
  const { data: questProgress } = await serviceClient.from('quest_progress').select('*').eq('user_id', studentUser.id).single();
  console.log('  - Earned Badges/Achievements:', questProgress.achievements?.length || 0);

  // Check Student Enrolled Classes
  const { data: classMembers } = await serviceClient.from('class_members').select('*').eq('student_id', studentUser.id);
  console.log('  - Enrolled Classes Count:', classMembers.length);

  console.log('\n🔍 VERIFYING TEACHER ACCOUNT LOGIN & DATA...');

  // 2. Login Teacher
  const { data: tAuth, error: tAuthErr } = await anonClient.auth.signInWithPassword({
    email: 'teacher@gmail.com',
    password: 'teacher123@'
  });

  if (tAuthErr) {
    console.error('❌ Teacher login failed:', tAuthErr.message);
  } else {
    console.log('✅ Teacher Login Successful! User ID:', tAuth.user.id);
  }

  // Fetch Teacher Profile from public.users
  const { data: teacherUser } = await serviceClient.from('users').select('*').eq('email', 'teacher@gmail.com').single();
  console.log('  - Display Name:', teacherUser.display_name);
  console.log('  - Role:', teacherUser.role);
  console.log('  - Teacher Status:', teacherUser.teacher_status);

  // Check Teacher Created Classes
  const { data: teacherClasses } = await serviceClient.from('classes').select('*').eq('teacher_id', teacherUser.id);
  console.log('  - Created Classes Count:', teacherClasses.length);
  teacherClasses.forEach(c => console.log(`    • Class Name: "${c.name}", Code: ${c.code}, Lessons: ${c.lessons_count}`));
}

verifyAccounts();
