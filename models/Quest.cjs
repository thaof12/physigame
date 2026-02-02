const mongoose = require('mongoose');

// Schema cho nhiệm vụ hàng ngày của user
const userQuestSchema = new mongoose.Schema({
  odId: {
    type: String,
    required: true
  },
  odType: {
    type: String,
    enum: ['daily', 'weekly', 'achievement'],
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  claimed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  claimedAt: Date
});

// Schema chính cho Quest Progress của User
const questProgressSchema = new mongoose.Schema({
  oderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Nhiệm vụ hàng ngày
  dailyQuests: [userQuestSchema],
  lastDailyReset: {
    type: Date,
    default: Date.now
  },
  
  // Nhiệm vụ thưởng (tuần/sự kiện)
  weeklyQuests: [userQuestSchema],
  lastWeeklyReset: {
    type: Date,
    default: Date.now
  },
  
  // Thành tựu (Achievement) - không reset
  achievements: [{
    achievementId: String,
    unlockedAt: Date,
    claimed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Streak tracking
  loginStreak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastLoginDate: Date
  },
  
  // Stats tổng hợp
  stats: {
    totalQuestsCompleted: { type: Number, default: 0 },
    totalRewardsClaimed: { type: Number, default: 0 },
    totalXPFromQuests: { type: Number, default: 0 }
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware
questProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Định nghĩa các nhiệm vụ hàng ngày
const DAILY_QUEST_TEMPLATES = [
  {
    id: 'daily_login',
    name: 'Đăng nhập hôm nay',
    description: 'Đăng nhập vào ứng dụng',
    target: 1,
    reward: { xp: 5 },
    icon: '🎯'
  },
  {
    id: 'complete_1_lesson',
    name: 'Hoàn thành 1 bài học hôm nay',
    description: 'Hoàn thành 1 bài học bất kỳ',
    target: 1,
    reward: { xp: 15 },
    icon: '📚'
  },
  {
    id: 'complete_3_lessons',
    name: 'Hoàn thành 3 bài học hôm nay',
    description: 'Hoàn thành 3 bài học bất kỳ',
    target: 3,
    reward: { xp: 30 },
    icon: '📖'
  },
  {
    id: 'complete_1_challenge',
    name: 'Hoàn thành 1 thử thách hôm nay',
    description: 'Hoàn thành 1 mini game thử thách',
    target: 1,
    reward: { xp: 20 },
    icon: '🎮'
  },
  {
    id: 'score_80_percent',
    name: 'Đạt 80% trong 1 bài học',
    description: 'Đạt điểm từ 80% trở lên',
    target: 1,
    reward: { xp: 25 },
    icon: '⭐'
  }
];

// Định nghĩa các nhiệm vụ thưởng (tuần)
const WEEKLY_QUEST_TEMPLATES = [
  {
    id: 'weekly_5_lessons',
    name: 'Hoàn thành 5 bài học trong tuần',
    description: 'Học đều đặn trong tuần',
    target: 5,
    reward: { xp: 100 },
    icon: '🏆'
  },
  {
    id: 'weekly_streak_3',
    name: 'Đăng nhập 3 ngày liên tiếp',
    description: 'Duy trì streak 3 ngày',
    target: 3,
    reward: { xp: 50 },
    icon: '🔥'
  },
  {
    id: 'weekly_perfect_score',
    name: 'Đạt điểm tuyệt đối',
    description: 'Đạt 100% trong 1 bài học',
    target: 1,
    reward: { xp: 75 },
    icon: '💯'
  },
  {
    id: 'weekly_pk_battle',
    name: 'Tham gia 1 trận PK',
    description: 'Đấu với người chơi khác',
    target: 1,
    reward: { xp: 40 },
    icon: '⚔️'
  }
];

// Định nghĩa thành tựu
const ACHIEVEMENT_TEMPLATES = [
  {
    id: 'first_lesson',
    name: 'Khởi đầu',
    description: 'Hoàn thành bài học đầu tiên',
    condition: { type: 'lessons_completed', value: 1 },
    reward: { xp: 50 },
    icon: '🌟',
    rarity: 'common'
  },
  {
    id: 'lessons_10',
    name: 'Học sinh chăm chỉ',
    description: 'Hoàn thành 10 bài học',
    condition: { type: 'lessons_completed', value: 10 },
    reward: { xp: 100 },
    icon: '📚',
    rarity: 'common'
  },
  {
    id: 'lessons_50',
    name: 'Nhà khoa học trẻ',
    description: 'Hoàn thành 50 bài học',
    condition: { type: 'lessons_completed', value: 50 },
    reward: { xp: 300 },
    icon: '🔬',
    rarity: 'rare'
  },
  {
    id: 'streak_7',
    name: 'Kiên trì 7 ngày',
    description: 'Đăng nhập 7 ngày liên tiếp',
    condition: { type: 'login_streak', value: 7 },
    reward: { xp: 150 },
    icon: '🔥',
    rarity: 'uncommon'
  },
  {
    id: 'streak_30',
    name: 'Bậc thầy kiên trì',
    description: 'Đăng nhập 30 ngày liên tiếp',
    condition: { type: 'login_streak', value: 30 },
    reward: { xp: 500 },
    icon: '💎',
    rarity: 'epic'
  },
  {
    id: 'perfect_scores_5',
    name: 'Hoàn hảo',
    description: 'Đạt 100% trong 5 bài học',
    condition: { type: 'perfect_scores', value: 5 },
    reward: { xp: 200 },
    icon: '🏆',
    rarity: 'rare'
  },
  {
    id: 'xp_1000',
    name: 'Tích lũy 1000 XP',
    description: 'Đạt tổng cộng 1000 XP',
    condition: { type: 'total_xp', value: 1000 },
    reward: { xp: 100 },
    icon: '⚡',
    rarity: 'uncommon'
  },
  {
    id: 'xp_5000',
    name: 'Chiến binh XP',
    description: 'Đạt tổng cộng 5000 XP',
    condition: { type: 'total_xp', value: 5000 },
    reward: { xp: 300 },
    icon: '🌟',
    rarity: 'rare'
  },
  {
    id: 'level_5',
    name: 'Cấp độ 5',
    description: 'Đạt level 5',
    condition: { type: 'level', value: 5 },
    reward: { xp: 100 },
    icon: '🎖️',
    rarity: 'common'
  },
  {
    id: 'level_10',
    name: 'Cấp độ 10',
    description: 'Đạt level 10',
    condition: { type: 'level', value: 10 },
    reward: { xp: 250 },
    icon: '🏅',
    rarity: 'uncommon'
  },
  {
    id: 'pk_winner_5',
    name: 'Chiến thắng 5 trận PK',
    description: 'Giành chiến thắng 5 trận đấu',
    condition: { type: 'pk_wins', value: 5 },
    reward: { xp: 200 },
    icon: '⚔️',
    rarity: 'rare'
  },
  {
    id: 'challenges_10',
    name: 'Thử thách gia',
    description: 'Hoàn thành 10 mini game',
    condition: { type: 'challenges_completed', value: 10 },
    reward: { xp: 150 },
    icon: '🎮',
    rarity: 'uncommon'
  }
];

// Methods
questProgressSchema.methods.initializeDailyQuests = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastReset = this.lastDailyReset ? new Date(this.lastDailyReset) : new Date(0);
  lastReset.setHours(0, 0, 0, 0);
  
  // Reset nếu là ngày mới HOẶC nếu dailyQuests rỗng
  if (today > lastReset || !this.dailyQuests || this.dailyQuests.length === 0) {
    this.dailyQuests = DAILY_QUEST_TEMPLATES.map(template => ({
      odId: template.id,
      odType: 'daily',
      progress: 0,
      target: template.target,
      completed: false,
      claimed: false
    }));
    this.lastDailyReset = today;
    return true;
  }
  return false;
};

questProgressSchema.methods.initializeWeeklyQuests = function() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const lastReset = this.lastWeeklyReset ? new Date(this.lastWeeklyReset) : new Date(0);
  lastReset.setHours(0, 0, 0, 0);
  
  // Reset nếu là tuần mới HOẶC nếu weeklyQuests rỗng
  if (startOfWeek > lastReset || !this.weeklyQuests || this.weeklyQuests.length === 0) {
    this.weeklyQuests = WEEKLY_QUEST_TEMPLATES.map(template => ({
      odId: template.id,
      odType: 'weekly',
      progress: 0,
      target: template.target,
      completed: false,
      claimed: false
    }));
    this.lastWeeklyReset = startOfWeek;
    return true;
  }
  return false;
};

questProgressSchema.methods.updateQuestProgress = function(questType, questId, increment = 1) {
  const quests = questType === 'daily' ? this.dailyQuests : this.weeklyQuests;
  const quest = quests.find(q => q.odId === questId);
  
  if (quest && !quest.completed) {
    quest.progress = Math.min(quest.progress + increment, quest.target);
    if (quest.progress >= quest.target) {
      quest.completed = true;
      quest.completedAt = new Date();
    }
    return quest;
  }
  return null;
};

questProgressSchema.methods.claimQuestReward = function(questType, questId) {
  const quests = questType === 'daily' ? this.dailyQuests : this.weeklyQuests;
  const templates = questType === 'daily' ? DAILY_QUEST_TEMPLATES : WEEKLY_QUEST_TEMPLATES;
  
  const quest = quests.find(q => q.odId === questId);
  const template = templates.find(t => t.id === questId);
  
  if (quest && quest.completed && !quest.claimed && template) {
    quest.claimed = true;
    quest.claimedAt = new Date();
    this.stats.totalQuestsCompleted++;
    this.stats.totalRewardsClaimed++;
    this.stats.totalXPFromQuests += template.reward.xp;
    return template.reward;
  }
  return null;
};

questProgressSchema.methods.updateLoginStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastLogin = this.loginStreak.lastLoginDate 
    ? new Date(this.loginStreak.lastLoginDate) 
    : null;
  
  if (!lastLogin) {
    this.loginStreak.current = 1;
    this.loginStreak.longest = 1;
    this.loginStreak.lastLoginDate = today;
    return { streakUpdated: true, current: 1 };
  }
  
  lastLogin.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Cùng ngày, không thay đổi
    return { streakUpdated: false, current: this.loginStreak.current };
  } else if (diffDays === 1) {
    // Ngày tiếp theo, tăng streak
    this.loginStreak.current++;
    if (this.loginStreak.current > this.loginStreak.longest) {
      this.loginStreak.longest = this.loginStreak.current;
    }
    this.loginStreak.lastLoginDate = today;
    return { streakUpdated: true, current: this.loginStreak.current };
  } else {
    // Mất streak
    this.loginStreak.current = 1;
    this.loginStreak.lastLoginDate = today;
    return { streakUpdated: true, current: 1, streakLost: true };
  }
};

questProgressSchema.methods.checkAndUnlockAchievement = function(achievementId) {
  const existing = this.achievements.find(a => a.achievementId === achievementId);
  if (existing) return null;
  
  const template = ACHIEVEMENT_TEMPLATES.find(a => a.id === achievementId);
  if (!template) return null;
  
  this.achievements.push({
    achievementId,
    unlockedAt: new Date(),
    claimed: false
  });
  
  return template;
};

questProgressSchema.methods.claimAchievementReward = function(achievementId) {
  const achievement = this.achievements.find(a => a.achievementId === achievementId);
  const template = ACHIEVEMENT_TEMPLATES.find(t => t.id === achievementId);
  
  if (achievement && !achievement.claimed && template) {
    achievement.claimed = true;
    this.stats.totalRewardsClaimed++;
    this.stats.totalXPFromQuests += template.reward.xp;
    return template.reward;
  }
  return null;
};

// Statics để lấy templates
questProgressSchema.statics.getDailyQuestTemplates = () => DAILY_QUEST_TEMPLATES;
questProgressSchema.statics.getWeeklyQuestTemplates = () => WEEKLY_QUEST_TEMPLATES;
questProgressSchema.statics.getAchievementTemplates = () => ACHIEVEMENT_TEMPLATES;

module.exports = mongoose.model('QuestProgress', questProgressSchema);
