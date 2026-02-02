const express = require('express');
const router = express.Router();
const QuestProgress = require('../models/Quest.cjs');
const User = require('../models/User.cjs');

// Middleware kiểm tra auth
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.userId = userId;
  next();
};

// GET /api/quests/:userId - Lấy thông tin quest của user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Tìm hoặc tạo mới QuestProgress
    let questProgress = await QuestProgress.findOne({ oderId: userId });
    let isNew = false;
    
    if (!questProgress) {
      questProgress = new QuestProgress({ oderId: userId });
      isNew = true;
    }
    
    // Initialize/reset daily quests nếu cần
    questProgress.initializeDailyQuests();
    questProgress.initializeWeeklyQuests();
    
    // Cập nhật login streak
    const streakResult = questProgress.updateLoginStreak();
    
    // Tự động hoàn thành quest đăng nhập
    if (streakResult && streakResult.streakUpdated) {
      questProgress.updateQuestProgress('daily', 'daily_login', 1);
      
      // Cập nhật quest streak tuần
      if (questProgress.loginStreak.current >= 3) {
        const weeklyStreak = questProgress.weeklyQuests.find(q => q.odId === 'weekly_streak_3');
        if (weeklyStreak && !weeklyStreak.completed) {
          weeklyStreak.progress = questProgress.loginStreak.current;
          if (weeklyStreak.progress >= weeklyStreak.target) {
            weeklyStreak.completed = true;
            weeklyStreak.completedAt = new Date();
          }
        }
      }
    }
    
    await questProgress.save();
    
    // Lấy user info để tính achievements
    const user = await User.findOne({ firebaseUid: userId });
    
    // Lấy templates
    const dailyTemplates = QuestProgress.getDailyQuestTemplates();
    const weeklyTemplates = QuestProgress.getWeeklyQuestTemplates();
    const achievementTemplates = QuestProgress.getAchievementTemplates();
    
    // Merge quest data với templates
    const dailyQuests = questProgress.dailyQuests.map(quest => {
      const template = dailyTemplates.find(t => t.id === quest.odId);
      return {
        ...quest.toObject(),
        name: template?.name,
        description: template?.description,
        reward: template?.reward,
        icon: template?.icon
      };
    });
    
    const weeklyQuests = questProgress.weeklyQuests.map(quest => {
      const template = weeklyTemplates.find(t => t.id === quest.odId);
      return {
        ...quest.toObject(),
        name: template?.name,
        description: template?.description,
        reward: template?.reward,
        icon: template?.icon
      };
    });
    
    // Merge achievements
    const achievements = achievementTemplates.map(template => {
      const userAchievement = questProgress.achievements.find(
        a => a.achievementId === template.id
      );
      return {
        ...template,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt,
        claimed: userAchievement?.claimed || false
      };
    });
    
    res.json({
      dailyQuests,
      weeklyQuests,
      achievements,
      loginStreak: questProgress.loginStreak,
      stats: questProgress.stats,
      lastDailyReset: questProgress.lastDailyReset,
      lastWeeklyReset: questProgress.lastWeeklyReset,
      userLevel: user?.level || 1,
      userXP: user?.xp || 0
    });
    
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

// POST /api/quests/:userId/progress - Cập nhật tiến độ quest
router.post('/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { questType, questId, increment = 1 } = req.body;
    
    let questProgress = await QuestProgress.findOne({ oderId: userId });
    if (!questProgress) {
      questProgress = new QuestProgress({ oderId: userId });
      questProgress.initializeDailyQuests();
      questProgress.initializeWeeklyQuests();
    }
    
    const result = questProgress.updateQuestProgress(questType, questId, increment);
    await questProgress.save();
    
    res.json({ 
      success: true, 
      quest: result,
      message: result?.completed ? 'Nhiệm vụ hoàn thành!' : 'Cập nhật tiến độ'
    });
    
  } catch (error) {
    console.error('Error updating quest progress:', error);
    res.status(500).json({ error: 'Failed to update quest progress' });
  }
});

// POST /api/quests/:userId/claim - Nhận thưởng quest
router.post('/:userId/claim', async (req, res) => {
  try {
    const { userId } = req.params;
    const { questType, questId } = req.body;
    
    const questProgress = await QuestProgress.findOne({ oderId: userId });
    if (!questProgress) {
      return res.status(404).json({ error: 'Quest progress not found' });
    }
    
    const reward = questProgress.claimQuestReward(questType, questId);
    if (!reward) {
      return res.status(400).json({ error: 'Cannot claim this reward' });
    }
    
    // Cập nhật XP cho user
    const user = await User.findOne({ firebaseUid: userId });
    if (user && reward.xp) {
      const xpResult = user.addXP(reward.xp);
      await user.save();
      
      await questProgress.save();
      
      return res.json({
        success: true,
        reward,
        newXP: xpResult.xp,
        newLevel: xpResult.level,
        leveledUp: xpResult.leveledUp
      });
    }
    
    await questProgress.save();
    res.json({ success: true, reward });
    
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

// POST /api/quests/:userId/achievement/claim - Nhận thưởng achievement
router.post('/:userId/achievement/claim', async (req, res) => {
  try {
    const { userId } = req.params;
    const { achievementId } = req.body;
    
    const questProgress = await QuestProgress.findOne({ oderId: userId });
    if (!questProgress) {
      return res.status(404).json({ error: 'Quest progress not found' });
    }
    
    const reward = questProgress.claimAchievementReward(achievementId);
    if (!reward) {
      return res.status(400).json({ error: 'Cannot claim this achievement' });
    }
    
    // Cập nhật XP cho user
    const user = await User.findOne({ firebaseUid: userId });
    if (user && reward.xp) {
      const xpResult = user.addXP(reward.xp);
      await user.save();
      
      await questProgress.save();
      
      return res.json({
        success: true,
        reward,
        newXP: xpResult.xp,
        newLevel: xpResult.level,
        leveledUp: xpResult.leveledUp
      });
    }
    
    await questProgress.save();
    res.json({ success: true, reward });
    
  } catch (error) {
    console.error('Error claiming achievement:', error);
    res.status(500).json({ error: 'Failed to claim achievement' });
  }
});

// POST /api/quests/:userId/check-achievements - Kiểm tra và mở khóa achievements
router.post('/:userId/check-achievements', async (req, res) => {
  try {
    const { userId } = req.params;
    const { stats } = req.body; // { lessonsCompleted, perfectScores, totalXP, level, pkWins, challengesCompleted }
    
    let questProgress = await QuestProgress.findOne({ oderId: userId });
    if (!questProgress) {
      questProgress = new QuestProgress({ oderId: userId });
    }
    
    const achievementTemplates = QuestProgress.getAchievementTemplates();
    const newlyUnlocked = [];
    
    for (const template of achievementTemplates) {
      const { condition } = template;
      let shouldUnlock = false;
      
      switch (condition.type) {
        case 'lessons_completed':
          shouldUnlock = stats.lessonsCompleted >= condition.value;
          break;
        case 'login_streak':
          shouldUnlock = questProgress.loginStreak.current >= condition.value ||
                        questProgress.loginStreak.longest >= condition.value;
          break;
        case 'perfect_scores':
          shouldUnlock = stats.perfectScores >= condition.value;
          break;
        case 'total_xp':
          shouldUnlock = stats.totalXP >= condition.value;
          break;
        case 'level':
          shouldUnlock = stats.level >= condition.value;
          break;
        case 'pk_wins':
          shouldUnlock = stats.pkWins >= condition.value;
          break;
        case 'challenges_completed':
          shouldUnlock = stats.challengesCompleted >= condition.value;
          break;
      }
      
      if (shouldUnlock) {
        const unlocked = questProgress.checkAndUnlockAchievement(template.id);
        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    }
    
    await questProgress.save();
    
    res.json({
      success: true,
      newlyUnlocked,
      totalAchievements: questProgress.achievements.length
    });
    
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

// Helper endpoint để trigger quest updates từ lessons/challenges
router.post('/:userId/trigger', async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, data } = req.body;
    // action: 'complete_lesson', 'perfect_score', 'complete_challenge', 'win_pk', 'play_pk', 'experiment_complete', 'study_time'
    
    let questProgress = await QuestProgress.findOne({ oderId: userId });
    if (!questProgress) {
      questProgress = new QuestProgress({ oderId: userId });
      questProgress.initializeDailyQuests();
      questProgress.initializeWeeklyQuests();
    }
    
    const questsUpdated = [];
    const achievementsUnlocked = [];
    
    switch (action) {
      case 'complete_lesson':
      case 'lesson_completed':
        // Cập nhật daily quests
        const lesson1Update = questProgress.updateQuestProgress('daily', 'complete_1_lesson', 1);
        if (lesson1Update) questsUpdated.push(lesson1Update);
        
        const lesson3Update = questProgress.updateQuestProgress('daily', 'complete_3_lessons', 1);
        if (lesson3Update) questsUpdated.push(lesson3Update);
        
        // Cập nhật weekly quests
        const weekly5Update = questProgress.updateQuestProgress('weekly', 'weekly_5_lessons', 1);
        if (weekly5Update) questsUpdated.push(weekly5Update);
        
        // Kiểm tra điểm
        if (data?.score >= 80 || data?.scorePercent >= 80) {
          const score80Update = questProgress.updateQuestProgress('daily', 'score_80_percent', 1);
          if (score80Update) questsUpdated.push(score80Update);
        }
        if (data?.score === 100 || data?.scorePercent === 100) {
          const perfectUpdate = questProgress.updateQuestProgress('weekly', 'weekly_perfect_score', 1);
          if (perfectUpdate) questsUpdated.push(perfectUpdate);
        }
        break;
      
      case 'perfect_score':
        const perfectScoreUpdate = questProgress.updateQuestProgress('weekly', 'weekly_perfect_score', 1);
        if (perfectScoreUpdate) questsUpdated.push(perfectScoreUpdate);
        
        const score80Update2 = questProgress.updateQuestProgress('daily', 'score_80_percent', 1);
        if (score80Update2) questsUpdated.push(score80Update2);
        break;
        
      case 'complete_challenge':
      case 'challenge_completed':
        const challengeUpdate = questProgress.updateQuestProgress('daily', 'complete_1_challenge', 1);
        if (challengeUpdate) questsUpdated.push(challengeUpdate);
        break;
      
      case 'experiment_complete':
        // Thí nghiệm tính như challenge
        const expUpdate = questProgress.updateQuestProgress('daily', 'complete_1_challenge', 1);
        if (expUpdate) questsUpdated.push(expUpdate);
        break;
        
      case 'win_pk':
        const pkWinUpdate = questProgress.updateQuestProgress('weekly', 'weekly_pk_battle', 1);
        if (pkWinUpdate) questsUpdated.push(pkWinUpdate);
        break;
      
      case 'play_pk':
      case 'pk_completed':
        const pkPlayUpdate = questProgress.updateQuestProgress('weekly', 'weekly_pk_battle', 1);
        if (pkPlayUpdate) questsUpdated.push(pkPlayUpdate);
        break;
      
      case 'study_time':
        if (data?.minutes) {
          const studyUpdate = questProgress.updateQuestProgress('daily', 'study_15_minutes', data.minutes);
          if (studyUpdate) questsUpdated.push(studyUpdate);
          
          const weeklyStudyUpdate = questProgress.updateQuestProgress('weekly', 'weekly_60_minutes', data.minutes);
          if (weeklyStudyUpdate) questsUpdated.push(weeklyStudyUpdate);
        }
        break;
    }
    
    // Update stats
    questProgress.stats.totalQuestsCompleted = 
      questProgress.dailyQuests.filter(q => q.completed).length +
      questProgress.weeklyQuests.filter(q => q.completed).length;
    
    await questProgress.save();
    
    res.json({
      success: true,
      action,
      questsUpdated,
      achievementsUnlocked
    });
    
  } catch (error) {
    console.error('Error triggering quest update:', error);
    res.status(500).json({ error: 'Failed to trigger quest update' });
  }
});

module.exports = router;
