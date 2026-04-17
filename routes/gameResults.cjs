const express = require('express');
const router = express.Router();
const GameResult = require('../models/GameResult.cjs');
const PhysicsGameProgress = require('../models/PhysicsGameProgress.cjs');
const User = require('../models/User.cjs');

const findUser = async (userId) => {
  return await User.findByAnyId(userId);
};

// POST /api/game-results/save
router.post('/save', async (req, res) => {
  try {
    const { userId, gameId, grade, chapter, score, maxScore, playTime, details, completed } = req.body;

    if (!userId || !gameId) {
      return res.status(400).json({ success: false, message: 'Missing required fields: userId and gameId' });
    }

    const user = await findUser(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await GameResult.saveResult({
      userId: user.id, userEmail: user.email, gameId,
      grade: parseInt(grade), chapter: parseInt(chapter),
      score: score || 0, maxScore: maxScore || 100,
      playTime: playTime || 0, details: details || {},
      completed: completed || false
    });

    if (result.completed) {
      const completedGames = await GameResult.getCompletedGames(user.id, parseInt(grade));
      await PhysicsGameProgress.saveProgress(user.id, user.email, parseInt(grade), completedGames, null);
    }

    res.json({
      success: true, message: 'Game result saved successfully',
      result: { gameId: result.game_id, score: result.score, stars: result.stars, completed: result.completed, attempts: result.attempts }
    });
  } catch (error) {
    console.error('❌ Save game result error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/game-results/:userId/:gameId
router.get('/:userId/:gameId', async (req, res) => {
  try {
    const user = await findUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await GameResult.getResult(user.id, req.params.gameId);
    res.json({ success: true, result: result || null });
  } catch (error) {
    console.error('❌ Get game result error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/game-results/:userId/grade/:grade
router.get('/:userId/grade/:grade', async (req, res) => {
  try {
    const user = await findUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const results = await GameResult.getResultsByGrade(user.id, parseInt(req.params.grade));
    const completedGames = await GameResult.getCompletedGames(user.id, parseInt(req.params.grade));

    res.json({ success: true, grade: parseInt(req.params.grade), results, completedGames });
  } catch (error) {
    console.error('❌ Get game results by grade error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/game-results/:userId/stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const user = await findUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const stats = await GameResult.getStats(user.id);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Get game stats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/game-results/complete
router.post('/complete', async (req, res) => {
  try {
    const { userId, gameId, grade, chapter, score, maxScore, playTime, details } = req.body;

    if (!userId || !gameId) return res.status(400).json({ success: false, message: 'Missing required fields' });

    const user = await findUser(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await GameResult.saveResult({
      userId: user.id, userEmail: user.email, gameId,
      grade: parseInt(grade), chapter: parseInt(chapter),
      score: score || 100, maxScore: maxScore || 100,
      playTime: playTime || 0, details: details || {},
      completed: true
    });

    const completedGames = await GameResult.getCompletedGames(user.id, parseInt(grade));
    await PhysicsGameProgress.saveProgress(user.id, user.email, parseInt(grade), completedGames, null);

    const xpGained = (result.stars || 0) * 20;
    if (xpGained > 0) {
      await User.update(user.id, { xp: (user.xp || 0) + xpGained });
    }

    res.json({
      success: true, message: 'Game completed successfully',
      result: { gameId: result.game_id, score: result.score, stars: result.stars, completed: result.completed, xpGained },
      completedGames
    });
  } catch (error) {
    console.error('❌ Complete game error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/game-results/:userId/progress/:grade
router.get('/:userId/progress/:grade', async (req, res) => {
  try {
    const user = await findUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const results = await GameResult.getResultsByGrade(user.id, parseInt(req.params.grade));
    const completedGames = await GameResult.getCompletedGames(user.id, parseInt(req.params.grade));
    const progress = await PhysicsGameProgress.getProgress(user.id, parseInt(req.params.grade));

    res.json({
      success: true, grade: parseInt(req.params.grade),
      progress: { completed: completedGames, current: progress.current, totalTrophies: progress.totalTrophies },
      gameResults: results
    });
  } catch (error) {
    console.error('❌ Get progress error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
