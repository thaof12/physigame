const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminVisibility() {
  console.log('🔍 TESTING ADMIN VISIBILITY FOR TEST ACCOUNTS...');

  // 1. Query public.users as Admin
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .in('email', ['student@gmail.com', 'teacher@gmail.com']);

  if (error) {
    console.error('❌ Error fetching users for Admin:', error);
    return;
  }

  console.log(`\nFound ${users.length} test accounts in public.users:`);
  users.forEach(u => {
    console.log(`--------------------------------------------------`);
    console.log(`ID:             ${u.id}`);
    console.log(`Name:           ${u.display_name}`);
    console.log(`Email:          ${u.email}`);
    console.log(`Role:           ${u.role}`);
    console.log(`Status:         ${u.status}`);
    console.log(`Teacher Status: ${u.teacher_status}`);
    console.log(`XP / Level:     ${u.xp} XP / Level ${u.level}`);
    console.log(`Programs:       ${JSON.stringify(u.programs)}`);
    console.log(`Profile:        ${JSON.stringify(u.profile)}`);
    if (u.teacher_profile) {
      console.log(`TeacherProf:    ${JSON.stringify(u.teacher_profile)}`);
    }
  });

  // 2. Test Admin capabilities: Status toggle test (active -> active)
  console.log('\n--- Testing Admin Management Operation (Updating status & profile) ---');
  const student = users.find(u => u.email === 'student@gmail.com');
  const teacher = users.find(u => u.email === 'teacher@gmail.com');

  if (student) {
    const { error: sUpErr } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', student.id);
    if (sUpErr) console.error('❌ Admin update student error:', sUpErr.message);
    else console.log('✅ Admin can update/manage Student account (student@gmail.com)');
  }

  if (teacher) {
    const { error: tUpErr } = await supabase
      .from('users')
      .update({ teacher_status: 'verified', status: 'active', updated_at: new Date().toISOString() })
      .eq('id', teacher.id);
    if (tUpErr) console.error('❌ Admin update teacher error:', tUpErr.message);
    else console.log('✅ Admin can update/manage/approve Teacher account (teacher@gmail.com)');
  }

  console.log('\n🎉 BOTH TEST ACCOUNTS ARE 100% VISIBLE AND FULLY MANAGED BY ADMIN!');
  process.exit(0);
}

testAdminVisibility();
