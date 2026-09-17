const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
  const { data: lessons } = await supabase.from('lessons').select('*').limit(10);
  console.log('Sample Lessons:', lessons ? lessons.slice(0, 5) : []);

  const { data: challenges } = await supabase.from('challenges').select('*').limit(5);
  console.log('Sample Challenges:', challenges);

  const { data: otherStudents } = await supabase.from('users').select('id, email, display_name').eq('role', 'student').limit(5);
  console.log('Other Students:', otherStudents);
}

inspectData();
