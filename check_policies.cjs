const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function checkAnon() {
  const { data, error } = await supabaseAnon
    .from('users')
    .select('*')
    .eq('email', 'luongminhthanh1404@gmail.com')
    .single();

  if (error) {
    console.error('Anon fetch error:', error);
  } else {
    console.log('Anon fetch success:', data.id, data.role, data.teacher_status);
  }
}

checkAnon();
