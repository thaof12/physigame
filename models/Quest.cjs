// Quest model - Supabase version
// Preserves all quest templates and business logic
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'quest_progress';

// ============ QUEST TEMPLATES (unchanged) ============

const DAILY_QUEST_TEMPLATES = [
  { id: 'daily_login', name: 'Đăng nhập hôm nay', description: 'Đăng nhập vào ứng dụng', target: 1, reward: { xp: 5 }, icon: '🎯' },
  { id: 'complete_1_lesson', name: 'Hoàn thành 1 bài học hôm nay', description: 'Hoàn thành 1 bài học bất kỳ', target: 1, reward: { xp: 15 }, icon: '📚' },
  { id: 'complete_3_lessons', name: 'Hoàn thành 3 bài học hôm nay', description: 'Hoàn thành 3 bài học bất kỳ', target: 3, reward: { xp: 30 }, icon: '📖' },
  { id: 'complete_1_challenge', name: 'Hoàn thành 1 thử thách hôm nay', description: 'Hoàn thành 1 mini game thử thách', target: 1, reward: { xp: 20 }, icon: '🎮' },
  { id: 'score_80_percent', name: 'Đạt 80% trong 1 bài học', description: 'Đạt điểm từ 80% trở lên', target: 1, reward: { xp: 25 }, icon: '⭐' }
];

const WEEKLY_QUEST_TEMPLATES = [
  { id: 'weekly_5_lessons', name: 'Hoàn thành 5 bài học trong tuần', description: 'Học đều đặn trong tuần', target: 5, reward: { xp: 100 }, icon: '🏆' },
  { id: 'weekly_streak_3', name: 'Đăng nhập 3 ngày liên tiếp', description: 'Duy trì streak 3 ngày', target: 3, reward: { xp: 50 }, icon: '🔥' },
  { id: 'weekly_perfect_score', name: 'Đạt điểm tuyệt đối', description: 'Đạt 100% trong 1 bài học', target: 1, reward: { xp: 75 }, icon: '💯' },
  { id: 'weekly_pk_battle', name: 'Tham gia 1 trận PK', description: 'Đấu với người chơi khác', target: 1, reward: { xp: 40 }, icon: '⚔️' }
];

const ACHIEVEMENT_TEMPLATES = [
  { id: 'first_lesson', name: 'Khởi đầu', description: 'Hoàn thành bài học đầu tiên', condition: { type: 'lessons_completed', value: 1 }, reward: { xp: 50 }, icon: '🌟', rarity: 'common' },
  { id: 'lessons_10', name: 'Học sinh chăm chỉ', description: 'Hoàn thành 10 bài học', condition: { type: 'lessons_completed', value: 10 }, reward: { xp: 100 }, icon: '📚', rarity: 'common' },
  { id: 'lessons_50', name: 'Nhà khoa học trẻ', description: 'Hoàn thành 50 bài học', condition: { type: 'lessons_completed', value: 50 }, reward: { xp: 300 }, icon: '🔬', rarity: 'rare' },
  { id: 'streak_7', name: 'Kiên trì 7 ngày', description: 'Đăng nhập 7 ngày liên tiếp', condition: { type: 'login_streak', value: 7 }, reward: { xp: 150 }, icon: '🔥', rarity: 'uncommon' },
  { id: 'streak_30', name: 'Bậc thầy kiên trì', description: 'Đăng nhập 30 ngày liên tiếp', condition: { type: 'login_streak', value: 30 }, reward: { xp: 500 }, icon: '💎', rarity: 'epic' },
  { id: 'perfect_scores_5', name: 'Hoàn hảo', description: 'Đạt 100% trong 5 bài học', condition: { type: 'perfect_scores', value: 5 }, reward: { xp: 200 }, icon: '🏆', rarity: 'rare' },
  { id: 'xp_1000', name: 'Tích lũy 1000 XP', description: 'Đạt tổng cộng 1000 XP', condition: { type: 'total_xp', value: 1000 }, reward: { xp: 100 }, icon: '⚡', rarity: 'uncommon' },
  { id: 'xp_5000', name: 'Chiến binh XP', description: 'Đạt tổng cộng 5000 XP', condition: { type: 'total_xp', value: 5000 }, reward: { xp: 300 }, icon: '🌟', rarity: 'rare' },
  { id: 'level_5', name: 'Cấp độ 5', description: 'Đạt level 5', condition: { type: 'level', value: 5 }, reward: { xp: 100 }, icon: '🎖️', rarity: 'common' },
  { id: 'level_10', name: 'Cấp độ 10', description: 'Đạt level 10', condition: { type: 'level', value: 10 }, reward: { xp: 250 }, icon: '🏅', rarity: 'uncommon' },
  { id: 'pk_winner_5', name: 'Chiến thắng 5 trận PK', description: 'Giành chiến thắng 5 trận đấu', condition: { type: 'pk_wins', value: 5 }, reward: { xp: 200 }, icon: '⚔️', rarity: 'rare' },
  { id: 'challenges_10', name: 'Thử thách gia', description: 'Hoàn thành 10 mini game', condition: { type: 'challenges_completed', value: 10 }, reward: { xp: 150 }, icon: '🎮', rarity: 'uncommon' }
];

// ============ BUSINESS LOGIC METHODS ============

function initializeDailyQuests(questProgress) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReset = questProgress.last_daily_reset ? new Date(questProgress.last_daily_reset) : new Date(0);
  lastReset.setHours(0, 0, 0, 0);

  if (today > lastReset || !questProgress.daily_quests || questProgress.daily_quests.length === 0) {
    questProgress.daily_quests = DAILY_QUEST_TEMPLATES.map(template => ({
      odId: template.id, odType: 'daily', progress: 0, target: template.target, completed: false, claimed: false
    }));
    questProgress.last_daily_reset = today.toISOString();
    return true;
  }
  return false;
}

function initializeWeeklyQuests(questProgress) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const lastReset = questProgress.last_weekly_reset ? new Date(questProgress.last_weekly_reset) : new Date(0);
  lastReset.setHours(0, 0, 0, 0);

  if (startOfWeek > lastReset || !questProgress.weekly_quests || questProgress.weekly_quests.length === 0) {
    questProgress.weekly_quests = WEEKLY_QUEST_TEMPLATES.map(template => ({
      odId: template.id, odType: 'weekly', progress: 0, target: template.target, completed: false, claimed: false
    }));
    questProgress.last_weekly_reset = startOfWeek.toISOString();
    return true;
  }
  return false;
}

function updateQuestProgress(questProgress, questType, questId, increment = 1) {
  const quests = questType === 'daily' ? questProgress.daily_quests : questProgress.weekly_quests;
  const quest = quests.find(q => q.odId === questId);

  if (quest && !quest.completed) {
    quest.progress = Math.min(quest.progress + increment, quest.target);
    if (quest.progress >= quest.target) {
      quest.completed = true;
      quest.completedAt = new Date().toISOString();
    }
    return quest;
  }
  return null;
}

function claimQuestReward(questProgress, questType, questId) {
  const quests = questType === 'daily' ? questProgress.daily_quests : questProgress.weekly_quests;
  const templates = questType === 'daily' ? DAILY_QUEST_TEMPLATES : WEEKLY_QUEST_TEMPLATES;

  const quest = quests.find(q => q.odId === questId);
  const template = templates.find(t => t.id === questId);

  if (quest && quest.completed && !quest.claimed && template) {
    quest.claimed = true;
    quest.claimedAt = new Date().toISOString();
    questProgress.stats.totalQuestsCompleted++;
    questProgress.stats.totalRewardsClaimed++;
    questProgress.stats.totalXPFromQuests += template.reward.xp;
    return template.reward;
  }
  return null;
}

function updateLoginStreak(questProgress) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const loginStreak = questProgress.login_streak || { current: 0, longest: 0, lastLoginDate: null };
  const lastLogin = loginStreak.lastLoginDate ? new Date(loginStreak.lastLoginDate) : null;

  if (!lastLogin) {
    loginStreak.current = 1;
    loginStreak.longest = 1;
    loginStreak.lastLoginDate = today.toISOString();
    questProgress.login_streak = loginStreak;
    return { streakUpdated: true, current: 1 };
  }

  lastLogin.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { streakUpdated: false, current: loginStreak.current };
  } else if (diffDays === 1) {
    loginStreak.current++;
    if (loginStreak.current > loginStreak.longest) loginStreak.longest = loginStreak.current;
    loginStreak.lastLoginDate = today.toISOString();
    questProgress.login_streak = loginStreak;
    return { streakUpdated: true, current: loginStreak.current };
  } else {
    loginStreak.current = 1;
    loginStreak.lastLoginDate = today.toISOString();
    questProgress.login_streak = loginStreak;
    return { streakUpdated: true, current: 1, streakLost: true };
  }
}

function checkAndUnlockAchievement(questProgress, achievementId) {
  const achievements = questProgress.achievements || [];
  const existing = achievements.find(a => a.achievementId === achievementId);
  if (existing) return null;

  const template = ACHIEVEMENT_TEMPLATES.find(a => a.id === achievementId);
  if (!template) return null;

  achievements.push({ achievementId, unlockedAt: new Date().toISOString(), claimed: false });
  questProgress.achievements = achievements;
  return template;
}

function claimAchievementReward(questProgress, achievementId) {
  const achievement = (questProgress.achievements || []).find(a => a.achievementId === achievementId);
  const template = ACHIEVEMENT_TEMPLATES.find(t => t.id === achievementId);

  if (achievement && !achievement.claimed && template) {
    achievement.claimed = true;
    questProgress.stats.totalRewardsClaimed++;
    questProgress.stats.totalXPFromQuests += template.reward.xp;
    return template.reward;
  }
  return null;
}

// ============ DB METHODS ============

const QuestProgress = {
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

  async update(id, updates) {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async save(questProgress) {
    if (questProgress.id) {
      return await this.update(questProgress.id, {
        daily_quests: questProgress.daily_quests,
        last_daily_reset: questProgress.last_daily_reset,
        weekly_quests: questProgress.weekly_quests,
        last_weekly_reset: questProgress.last_weekly_reset,
        achievements: questProgress.achievements,
        login_streak: questProgress.login_streak,
        stats: questProgress.stats
      });
    } else {
      return await this.create(questProgress);
    }
  },

  // Template accessors
  getDailyQuestTemplates: () => DAILY_QUEST_TEMPLATES,
  getWeeklyQuestTemplates: () => WEEKLY_QUEST_TEMPLATES,
  getAchievementTemplates: () => ACHIEVEMENT_TEMPLATES,

  // Business logic
  initializeDailyQuests,
  initializeWeeklyQuests,
  updateQuestProgress,
  claimQuestReward,
  updateLoginStreak,
  checkAndUnlockAchievement,
  claimAchievementReward
};

module.exports = QuestProgress;
