// PhysicsGameProgress model - Supabase version
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'physics_game_progress';

const PhysicsGameProgress = {
  async saveProgress(userId, userEmail, grade, completed, current) {
    try {
      // Check existing
      const { data: existing } = await supabase
        .from(TABLE).select('id')
        .eq('user_id', userId).eq('grade', grade).single();

      const record = {
        user_id: userId,
        user_email: userEmail,
        grade,
        completed_games: completed || [],
        current_game: current || null,
        total_trophies: (completed || []).length,
        last_played_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from(TABLE).update(record).eq('id', existing.id).select().single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from(TABLE).insert(record).select().single();
        if (error) throw error;
        result = data;
      }
      return result;
    } catch (error) {
      console.error('Error saving physics game progress:', error);
      throw error;
    }
  },

  async getProgress(userId, grade) {
    try {
      const { data, error } = await supabase
        .from(TABLE).select('*')
        .eq('user_id', userId).eq('grade', grade).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        return {
          completed: data.completed_games || [],
          current: data.current_game || null,
          totalScore: data.total_score || 0,
          totalTrophies: data.total_trophies || 0
        };
      }
      return { completed: [], current: null, totalScore: 0, totalTrophies: 0 };
    } catch (error) {
      console.error('Error getting physics game progress:', error);
      throw error;
    }
  },

  async getProgressByEmail(userEmail, grade) {
    try {
      const { data, error } = await supabase
        .from(TABLE).select('*')
        .eq('user_email', userEmail).eq('grade', grade).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        return {
          completed: data.completed_games || [],
          current: data.current_game || null,
          totalScore: data.total_score || 0,
          totalTrophies: data.total_trophies || 0
        };
      }
      return { completed: [], current: null, totalScore: 0, totalTrophies: 0 };
    } catch (error) {
      console.error('Error getting physics game progress by email:', error);
      throw error;
    }
  },

  async getAllProgress(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLE).select('*')
        .eq('user_id', userId).order('grade', { ascending: true });
      if (error) throw error;
      const result = {};
      (data || []).forEach(record => {
        result[record.grade.toString()] = {
          completed: record.completed_games || [],
          current: record.current_game || null,
          totalScore: record.total_score || 0,
          totalTrophies: record.total_trophies || 0
        };
      });
      return result;
    } catch (error) {
      console.error('Error getting all physics game progress:', error);
      throw error;
    }
  }
};

module.exports = PhysicsGameProgress;
