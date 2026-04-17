// UserProgress model - Supabase version
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'user_progress';

const UserProgress = {
  async findByUserId(userId) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(progressData) {
    const { data, error } = await supabase
      .from(TABLE).insert(progressData).select().single();
    if (error) throw error;
    return data;
  },

  async update(userId, updates) {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async upsert(progressData) {
    const { data, error } = await supabase
      .from(TABLE).upsert(progressData, { onConflict: 'user_id' }).select().single();
    if (error) throw error;
    return data;
  }
};

module.exports = UserProgress;