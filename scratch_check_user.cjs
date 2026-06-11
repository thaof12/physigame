const { supabase } = require('./src/config/supabase.cjs');

async function check() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching auth users:', error);
    return;
  }

  console.log('All auth users:');
  users.forEach(u => {
    console.log(`ID: ${u.id}, Email: ${u.email}, Metadata:`, u.user_metadata);
  });
}

check();
