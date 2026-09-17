const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testClassesSetup() {
  const teacherId = '03196d06-ee8d-4ace-a193-98aef41b24a0'; // teacher@gmail.com
  const studentId = 'dbe4c8b4-9e05-436f-a21a-b73c44f22446'; // student@gmail.com

  // Clear existing test classes for this teacher
  await supabase.from('classes').delete().eq('teacher_id', teacherId);

  // 1. Create Class 1
  const { data: cls1, error: e1 } = await supabase.from('classes').insert({
    teacher_id: teacherId,
    name: 'Lớp Vật Lý 10A1 - Cơ Học & Động Học',
    code: 'PHYS10',
    lessons_count: 5
  }).select().single();
  console.log('Class 1 created:', cls1, e1?.message);

  // 2. Create Class 2
  const { data: cls2, error: e2 } = await supabase.from('classes').insert({
    teacher_id: teacherId,
    name: 'Lớp Vật Lý 11B2 - Điện Tích & Dòng Điện',
    code: 'PHYS11',
    lessons_count: 4
  }).select().single();
  console.log('Class 2 created:', cls2, e2?.message);

  // 3. Create Class 3
  const { data: cls3, error: e3 } = await supabase.from('classes').insert({
    teacher_id: teacherId,
    name: 'Lớp Ôn Thi THPT Quốc Gia - Vật Lý 12',
    code: 'PHYS12',
    lessons_count: 6
  }).select().single();
  console.log('Class 3 created:', cls3, e3?.message);

  if (cls1 && cls2) {
    // Add student to class 1 & 2
    const { data: m1, error: me1 } = await supabase.from('class_members').insert([
      { class_id: cls1.id, student_id: studentId },
      { class_id: cls2.id, student_id: studentId }
    ]).select();
    console.log('Members enrolled:', m1, me1?.message);

    // Add 2 other active students to class 1
    const { data: otherStudents } = await supabase.from('users').select('id').eq('role', 'student').neq('id', studentId).limit(2);
    if (otherStudents && otherStudents.length > 0) {
      const otherMembers = otherStudents.map(st => ({ class_id: cls1.id, student_id: st.id }));
      const { data: m2, error: me2 } = await supabase.from('class_members').insert(otherMembers).select();
      console.log('Other members enrolled:', m2, me2?.message);
    }
  }
}

testClassesSetup();
