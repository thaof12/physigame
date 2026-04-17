// Lesson model - Supabase version
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'lessons';

const Lesson = {
  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async find(filters = {}, options = {}) {
    let query = supabase.from(TABLE).select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    if (options.sort) {
      Object.entries(options.sort).forEach(([field, dir]) => {
        query = query.order(field, { ascending: dir === 1 || dir === 'asc' });
      });
    }
    if (options.limit) query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findAll() {
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .order('class_id', { ascending: true })
      .order('chapter_id', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async findByClassAndChapter(classId, chapterId) {
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('class_id', classId)
      .eq('chapter_id', chapterId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async findByClassChapterLesson(classId, chapterId, lessonId) {
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('class_id', classId)
      .eq('chapter_id', chapterId)
      .eq('lesson_id', lessonId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(lessonData) {
    const { data, error } = await supabase
      .from(TABLE).insert(lessonData).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  }
};

module.exports = Lesson;
