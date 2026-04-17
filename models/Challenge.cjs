// Challenge model - Supabase version
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'challenges';

const Challenge = {
  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByChallengeId(challengeId) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('challenge_id', challengeId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findAll() {
    const { data, error } = await supabase
      .from(TABLE).select('*').order('challenge_id', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(challengeData) {
    const { data, error } = await supabase
      .from(TABLE).insert(challengeData).select().single();
    if (error) throw error;
    return data;
  },

  async update(challengeId, updates) {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('challenge_id', challengeId).select().single();
    if (error) throw error;
    return data;
  },

  async delete(challengeId) {
    const { error } = await supabase
      .from(TABLE).delete().eq('challenge_id', challengeId);
    if (error) throw error;
  }
};

module.exports = Challenge;
