const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTestAccounts() {
  console.log('Checking student@gmail.com and teacher@gmail.com...');
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .in('email', ['student@gmail.com', 'teacher@gmail.com']);

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log('Public Users:', users);

  // Check auth.users via admin API
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error listing auth users:', authError);
  } else {
    const matchedAuth = authUsers.users.filter(u => ['student@gmail.com', 'teacher@gmail.com'].includes(u.email));
    console.log('Auth Users matched:', matchedAuth.map(u => ({ id: u.id, email: u.email })));
  }
}

checkTestAccounts();
