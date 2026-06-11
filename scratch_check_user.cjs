const { supabase } = require('./src/config/supabase.cjs');

async function check() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'luongminhthanh1404@gmail.com')
    .single();

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  console.log('User status in Supabase:', data.teacher_status);
  console.log('User role in Supabase:', data.role);
}

check();
