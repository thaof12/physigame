// LessonCompletion model - Supabase version
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'lesson_completions';

const LessonCompletion = {
  async findOne(userId, lessonId) {
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('user_id', userId).eq('lesson_id', lessonId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByClass(userId, classId) {
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('user_id', userId).eq('class_id', classId).eq('completed', true);
    if (error) throw error;
    return data || [];
  },

  async upsert(completionData) {
    // Check existing
    const { data: existing } = await supabase
      .from(TABLE).select('id')
      .eq('user_id', completionData.user_id)
      .eq('lesson_id', completionData.lesson_id)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from(TABLE).update(completionData).eq('id', existing.id).select().single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from(TABLE).insert(completionData).select().single();
      if (error) throw error;
      result = data;
    }
    return result;
  }
};

module.exports = LessonCompletion;
