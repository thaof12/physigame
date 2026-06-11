const { supabase } = require('./src/config/supabase.cjs');

async function check() {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching public.users:', error);
    return;
  }

  console.log('--- Public Users List ---');
  data.forEach(u => {
    console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Status: ${u.status}, TeacherStatus: ${u.teacher_status}`);
  });
}

check();
