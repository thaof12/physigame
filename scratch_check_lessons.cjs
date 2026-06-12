const { supabase } = require('./src/config/supabase.cjs');

async function testLessonsCRUD() {
  try {
    console.log('--- 1. Fetching current lessons ---');
    const { data: initialData, error: fetchErr } = await supabase
      .from('lessons')
      .select('id, title, class_id, status')
      .order('id', { ascending: true })
      .limit(3);

    if (fetchErr) throw fetchErr;

    console.log('Sample lessons in DB:', initialData);

    if (initialData.length > 0) {
      const targetLesson = initialData[0];
      const nextStatus = targetLesson.status === 'published' ? 'draft' : 'published';

      console.log(`\n--- 2. Toggling status for lesson ID ${targetLesson.id} to ${nextStatus} ---`);
      const { error: updateErr } = await supabase
        .from('lessons')
        .update({ status: nextStatus })
        .eq('id', targetLesson.id);

      if (updateErr) throw updateErr;

      // Verify toggle
      const { data: verifyData, error: verifyErr } = await supabase
        .from('lessons')
        .select('id, status')
        .eq('id', targetLesson.id)
        .single();

      if (verifyErr) throw verifyErr;
      console.log('Updated lesson state in DB:', verifyData);

      // Revert status to original
      await supabase
        .from('lessons')
        .update({ status: targetLesson.status })
        .eq('id', targetLesson.id);
      console.log('Reverted lesson status back to original');
    }

    console.log('\n--- 3. Inserting a temporary test lesson ---');
    const tempLesson = {
      class_id: 8,
      chapter_id: 1,
      lesson_id: 999,
      title: 'TEST LESSON FROM ANTIGRAVITY',
      description: 'Chương/ chủ đề: Chương I - Thể loại: Bài giảng',
      level: 'Beginner',
      status: 'draft',
      theory: '',
      content: '',
      game: {},
      sort_order: 8100999
    };

    const { data: insertData, error: insertErr } = await supabase
      .from('lessons')
      .insert(tempLesson)
      .select()
      .single();

    if (insertErr) throw insertErr;
    console.log('Inserted lesson:', { id: insertData.id, title: insertData.title, status: insertData.status });

    console.log('\n--- 4. Updating the temporary lesson title & status ---');
    const { data: updatedData, error: updateTestErr } = await supabase
      .from('lessons')
      .update({ title: 'UPDATED TEST LESSON', status: 'published' })
      .eq('id', insertData.id)
      .select()
      .single();

    if (updateTestErr) throw updateTestErr;
    console.log('Updated lesson:', { id: updatedData.id, title: updatedData.title, status: updatedData.status });

    console.log('\n--- 5. Deleting the temporary lesson ---');
    const { error: deleteErr } = await supabase
      .from('lessons')
      .delete()
      .eq('id', insertData.id);

    if (deleteErr) throw deleteErr;
    console.log('Successfully deleted the temporary lesson.');
    
    console.log('\nAll CRUD and Status checks passed successfully!');
  } catch (err) {
    console.error('Test failed with error:', err);
  }
}

testLessonsCRUD();
