const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumns() {
  console.log('Testing inserting into classes with minimal payload...');
  const { data: testClass, error: err1 } = await supabase.from('classes').insert({
    teacher_id: '03196d06-ee8d-4ace-a193-98aef41b24a0',
    name: 'Lớp Vật Lý 10A1 - Cơ Học & Động Học',
    code: 'PHYS10',
    grade: 10,
    lessons_count: 5
  }).select();

  console.log('Insert classes result:', { data: testClass, error: err1?.message });

  if (err1 && err1.message.includes('grade')) {
    console.log('Trying without grade column...');
    const { data: testClass2, error: err2 } = await supabase.from('classes').insert({
      teacher_id: '03196d06-ee8d-4ace-a193-98aef41b24a0',
      name: 'Lớp Vật Lý 10A1 - Cơ Học & Động Học',
      code: 'PHYS10',
      lessons_count: 5
    }).select();
    console.log('Insert classes without grade result:', { data: testClass2, error: err2?.message });
  }

  console.log('Testing inserting into class_members with minimal payload...');
  const { data: testMember, error: errMember } = await supabase.from('class_members').insert({
    class_id: testClass ? testClass[0].id : '11111111-1111-4111-a111-111111111111',
    student_id: 'dbe4c8b4-9e05-436f-a21a-b73c44f22446'
  }).select();

  console.log('Insert class_members result:', { data: testMember, error: errMember?.message });
}

testColumns();
