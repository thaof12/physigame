const express = require('express');
const router = express.Router();
const QuestProgress = require('../models/Quest.cjs');
const User = require('../models/User.cjs');

// GET /api/quests/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let qp = await QuestProgress.findByUserId(userId);
    if (!qp) {
      qp = await QuestProgress.create({
        user_id: userId,
        daily_quests: [], weekly_quests: [], achievements: [],
        login_streak: { current: 0, longest: 0, lastLoginDate: null },
        stats: { totalQuestsCompleted: 0, totalRewardsClaimed: 0, totalXPFromQuests: 0 }
      });
    }

    QuestProgress.initializeDailyQuests(qp);
    QuestProgress.initializeWeeklyQuests(qp);
    const streakResult = QuestProgress.updateLoginStreak(qp);

    if (streakResult && streakResult.streakUpdated) {
      QuestProgress.updateQuestProgress(qp, 'daily', 'daily_login', 1);
      if (qp.login_streak.current >= 3) {
        const ws = (qp.weekly_quests || []).find(q => q.odId === 'weekly_streak_3');
        if (ws && !ws.completed) {
          ws.progress = qp.login_streak.current;
          if (ws.progress >= ws.target) { ws.completed = true; ws.completedAt = new Date().toISOString(); }
        }
      }
    }

    await QuestProgress.save(qp);

    const user = await User.findById(userId);

    const dailyTemplates = QuestProgress.getDailyQuestTemplates();
    const weeklyTemplates = QuestProgress.getWeeklyQuestTemplates();
    const achievementTemplates = QuestProgress.getAchievementTemplates();

    const dailyQuests = (qp.daily_quests || []).map(quest => {
      const template = dailyTemplates.find(t => t.id === quest.odId);
      return { ...quest, name: template?.name, description: template?.description, reward: template?.reward, icon: template?.icon };
    });

    const weeklyQuests = (qp.weekly_quests || []).map(quest => {
      const template = weeklyTemplates.find(t => t.id === quest.odId);
      return { ...quest, name: template?.name, description: template?.description, reward: template?.reward, icon: template?.icon };
    });

    const achievements = achievementTemplates.map(template => {
      const userAchievement = (qp.achievements || []).find(a => a.achievementId === template.id);
      return { ...template, unlocked: !!userAchievement, unlockedAt: userAchievement?.unlockedAt, claimed: userAchievement?.claimed || false };
    });

    res.json({
      dailyQuests, weeklyQuests, achievements,
      loginStreak: qp.login_streak, stats: qp.stats,
      lastDailyReset: qp.last_daily_reset, lastWeeklyReset: qp.last_weekly_reset,
      userLevel: user?.level || 1, userXP: user?.xp || 0
    });
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

// POST /api/quests/:userId/progress
router.post('/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { questType, questId, increment = 1 } = req.body;

    let qp = await QuestProgress.findByUserId(userId);
    if (!qp) {
      qp = await QuestProgress.create({
        user_id: userId, daily_quests: [], weekly_quests: [], achievements: [],
        login_streak: { current: 0, longest: 0, lastLoginDate: null },
        stats: { totalQuestsCompleted: 0, totalRewardsClaimed: 0, totalXPFromQuests: 0 }
      });
      QuestProgress.initializeDailyQuests(qp);
      QuestProgress.initializeWeeklyQuests(qp);
    }

    const result = QuestProgress.updateQuestProgress(qp, questType, questId, increment);
    await QuestProgress.save(qp);

    res.json({ success: true, quest: result, message: result?.completed ? 'Nhiệm vụ hoàn thành!' : 'Cập nhật tiến độ' });
  } catch (error) {
    console.error('Error updating quest progress:', error);
    res.status(500).json({ error: 'Failed to update quest progress' });
  }
});

// POST /api/quests/:userId/claim
router.post('/:userId/claim', async (req, res) => {
  try {
    const { userId } = req.params;
    const { questType, questId } = req.body;

    const qp = await QuestProgress.findByUserId(userId);
    if (!qp) return res.status(404).json({ error: 'Quest progress not found' });

    const reward = QuestProgress.claimQuestReward(qp, questType, questId);
    if (!reward) return res.status(400).json({ error: 'Cannot claim this reward' });

    const user = await User.findById(userId);
    if (user && reward.xp) {
      const xpResult = User.addXP(user, reward.xp);
      await User.update(user.id, { xp: user.xp, level: user.level });
      await QuestProgress.save(qp);
      return res.json({ success: true, reward, newXP: xpResult.xp, newLevel: xpResult.level, leveledUp: xpResult.leveledUp });
    }

    await QuestProgress.save(qp);
    res.json({ success: true, reward });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

// POST /api/quests/:userId/achievement/claim
router.post('/:userId/achievement/claim', async (req, res) => {
  try {
    const { userId } = req.params;
    const { achievementId } = req.body;

    const qp = await QuestProgress.findByUserId(userId);
    if (!qp) return res.status(404).json({ error: 'Quest progress not found' });

    const reward = QuestProgress.claimAchievementReward(qp, achievementId);
    if (!reward) return res.status(400).json({ error: 'Cannot claim this achievement' });

    const user = await User.findById(userId);
    if (user && reward.xp) {
      const xpResult = User.addXP(user, reward.xp);
      await User.update(user.id, { xp: user.xp, level: user.level });
      await QuestProgress.save(qp);
      return res.json({ success: true, reward, newXP: xpResult.xp, newLevel: xpResult.level, leveledUp: xpResult.leveledUp });
    }

    await QuestProgress.save(qp);
    res.json({ success: true, reward });
  } catch (error) {
    console.error('Error claiming achievement:', error);
    res.status(500).json({ error: 'Failed to claim achievement' });
  }
});

// POST /api/quests/:userId/check-achievements
router.post('/:userId/check-achievements', async (req, res) => {
  try {
    const { userId } = req.params;
    const { stats } = req.body;

    let qp = await QuestProgress.findByUserId(userId);
    if (!qp) {
      qp = await QuestProgress.create({
        user_id: userId, daily_quests: [], weekly_quests: [], achievements: [],
        login_streak: { current: 0, longest: 0, lastLoginDate: null },
        stats: { totalQuestsCompleted: 0, totalRewardsClaimed: 0, totalXPFromQuests: 0 }
      });
    }

    const achievementTemplates = QuestProgress.getAchievementTemplates();
    const newlyUnlocked = [];

    for (const template of achievementTemplates) {
      const { condition } = template;
      let shouldUnlock = false;

      switch (condition.type) {
        case 'lessons_completed': shouldUnlock = stats.lessonsCompleted >= condition.value; break;
        case 'login_streak': shouldUnlock = (qp.login_streak?.current >= condition.value) || (qp.login_streak?.longest >= condition.value); break;
        case 'perfect_scores': shouldUnlock = stats.perfectScores >= condition.value; break;
        case 'total_xp': shouldUnlock = stats.totalXP >= condition.value; break;
        case 'level': shouldUnlock = stats.level >= condition.value; break;
        case 'pk_wins': shouldUnlock = stats.pkWins >= condition.value; break;
        case 'challenges_completed': shouldUnlock = stats.challengesCompleted >= condition.value; break;
      }

      if (shouldUnlock) {
        const unlocked = QuestProgress.checkAndUnlockAchievement(qp, template.id);
        if (unlocked) newlyUnlocked.push(unlocked);
      }
    }

    await QuestProgress.save(qp);
    res.json({ success: true, newlyUnlocked, totalAchievements: (qp.achievements || []).length });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

// POST /api/quests/:userId/trigger
router.post('/:userId/trigger', async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, data } = req.body;

    let qp = await QuestProgress.findByUserId(userId);
    if (!qp) {
      qp = await QuestProgress.create({
        user_id: userId, daily_quests: [], weekly_quests: [], achievements: [],
        login_streak: { current: 0, longest: 0, lastLoginDate: null },
        stats: { totalQuestsCompleted: 0, totalRewardsClaimed: 0, totalXPFromQuests: 0 }
      });
      QuestProgress.initializeDailyQuests(qp);
      QuestProgress.initializeWeeklyQuests(qp);
    }

    const questsUpdated = [];

    switch (action) {
      case 'complete_lesson':
      case 'lesson_completed': {
        let r = QuestProgress.updateQuestProgress(qp, 'daily', 'complete_1_lesson', 1); if (r) questsUpdated.push(r);
        r = QuestProgress.updateQuestProgress(qp, 'daily', 'complete_3_lessons', 1); if (r) questsUpdated.push(r);
        r = QuestProgress.updateQuestProgress(qp, 'weekly', 'weekly_5_lessons', 1); if (r) questsUpdated.push(r);
        if (data?.score >= 80 || data?.scorePercent >= 80) { r = QuestProgress.updateQuestProgress(qp, 'daily', 'score_80_percent', 1); if (r) questsUpdated.push(r); }
        if (data?.score === 100 || data?.scorePercent === 100) { r = QuestProgress.updateQuestProgress(qp, 'weekly', 'weekly_perfect_score', 1); if (r) questsUpdated.push(r); }
        break;
      }
      case 'perfect_score': {
        let r = QuestProgress.updateQuestProgress(qp, 'weekly', 'weekly_perfect_score', 1); if (r) questsUpdated.push(r);
        r = QuestProgress.updateQuestProgress(qp, 'daily', 'score_80_percent', 1); if (r) questsUpdated.push(r);
        break;
      }
      case 'complete_challenge':
      case 'challenge_completed': {
        const r = QuestProgress.updateQuestProgress(qp, 'daily', 'complete_1_challenge', 1); if (r) questsUpdated.push(r);
        break;
      }
      case 'experiment_complete': {
        const r = QuestProgress.updateQuestProgress(qp, 'daily', 'complete_1_challenge', 1); if (r) questsUpdated.push(r);
        break;
      }
      case 'win_pk':
      case 'play_pk':
      case 'pk_completed': {
        const r = QuestProgress.updateQuestProgress(qp, 'weekly', 'weekly_pk_battle', 1); if (r) questsUpdated.push(r);
        break;
      }
    }

    qp.stats.totalQuestsCompleted =
      (qp.daily_quests || []).filter(q => q.completed).length +
      (qp.weekly_quests || []).filter(q => q.completed).length;

    await QuestProgress.save(qp);
    res.json({ success: true, action, questsUpdated, achievementsUnlocked: [] });
  } catch (error) {
    console.error('Error triggering quest update:', error);
    res.status(500).json({ error: 'Failed to trigger quest update' });
  }
});

module.exports = router;
