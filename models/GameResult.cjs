// GameResult model - Supabase version
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'game_results';

const GameResult = {
  async saveResult(data) {
    const { userId, userEmail, gameId, grade, chapter, score, maxScore, playTime, details, completed } = data;

    // Calculate stars
    const percentage = (score / maxScore) * 100;
    let stars = 0;
    if (percentage >= 90) stars = 3;
    else if (percentage >= 70) stars = 2;
    else if (percentage >= 50) stars = 1;

    // Check existing
    const { data: existing } = await supabase
      .from(TABLE).select('*')
      .eq('user_id', userId).eq('game_id', gameId).single();

    const attempts = existing ? existing.attempts + 1 : 1;

    const updateData = {
      user_id: userId,
      user_email: userEmail,
      game_id: gameId,
      grade,
      chapter,
      attempts,
      details: details || {}
    };

    // Only update score/stars if better
    if (!existing || score > existing.score) {
      updateData.score = score;
      updateData.max_score = maxScore;
      updateData.stars = stars;
      updateData.play_time = playTime;
    }

    if (completed || percentage >= 50) {
      updateData.completed = true;
      if (!existing?.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }
    }

    let result;
    if (existing) {
      const { data: updated, error } = await supabase
        .from(TABLE).update(updateData).eq('id', existing.id).select().single();
      if (error) throw error;
      result = updated;
    } else {
      const { data: created, error } = await supabase
        .from(TABLE).insert(updateData).select().single();
      if (error) throw error;
      result = created;
    }

    return result;
  },

  async getResult(userId, gameId) {
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('user_id', userId).eq('game_id', gameId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getResultsByGrade(userId, grade) {
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('user_id', userId).eq('grade', grade)
      .order('chapter', { ascending: true });
    if (error) throw error;

    const resultMap = {};
    (data || []).forEach(r => {
      resultMap[r.game_id] = {
        score: r.score,
        maxScore: r.max_score,
        stars: r.stars,
        completed: r.completed,
        playTime: r.play_time,
        attempts: r.attempts,
        completedAt: r.completed_at
      };
    });
    return resultMap;
  },

  async getCompletedGames(userId, grade) {
    const { data, error } = await supabase
      .from(TABLE).select('game_id')
      .eq('user_id', userId).eq('grade', grade).eq('completed', true);
    if (error) throw error;
    return (data || []).map(r => r.game_id);
  },

  async getStats(userId) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId);
    if (error) throw error;

    const results = data || [];
    const stats = {
      totalGamesPlayed: results.length,
      totalCompleted: results.filter(r => r.completed).length,
      totalStars: results.reduce((sum, r) => sum + (r.stars || 0), 0),
      totalPlayTime: results.reduce((sum, r) => sum + (r.play_time || 0), 0),
      byGrade: {}
    };

    results.forEach(r => {
      if (!stats.byGrade[r.grade]) {
        stats.byGrade[r.grade] = { played: 0, completed: 0, stars: 0 };
      }
      stats.byGrade[r.grade].played++;
      if (r.completed) stats.byGrade[r.grade].completed++;
      stats.byGrade[r.grade].stars += r.stars || 0;
    });

    return stats;
  }
};

module.exports = GameResult;
