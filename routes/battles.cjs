const express = require('express');
const router = express.Router();
const Battle = require('../models/Battle.cjs');
const User = require('../models/User.cjs');
const { supabase } = require('../src/config/supabase.cjs');

// Get user's battle history
router.get('/history/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const lim = parseInt(limit);
    const offset = (parseInt(page) - 1) * lim;

    const battles = await Battle.findByPlayerUid(firebaseUid, 'finished', {
      sort: { finished_at: -1 }, limit: lim, offset
    });

    // Count total
    const allBattles = await Battle.findByPlayerUid(firebaseUid, 'finished');
    const total = allBattles.length;

    res.json({
      success: true, battles,
      pagination: { page: parseInt(page), limit: lim, total, pages: Math.ceil(total / lim) }
    });
  } catch (error) {
    console.error('Error fetching battle history:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải lịch sử đấu' });
  }
});

// Get user's battle stats
router.get('/stats/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const battles = await Battle.findByPlayerUid(firebaseUid, 'finished');

    let wins = 0, losses = 0, draws = 0, totalScore = 0, totalCorrect = 0, totalWrong = 0;

    battles.forEach(battle => {
      const player = (battle.players || []).find(p => p.firebaseUid === firebaseUid);
      if (player) {
        totalScore += player.score || 0;
        totalCorrect += player.correctAnswers || 0;
        totalWrong += player.wrongAnswers || 0;
      }
      if (battle.winner?.firebaseUid === firebaseUid) wins++;
      else if (battle.winner?.firebaseUid) losses++;
      else draws++;
    });

    const totalGames = battles.length;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

    let rank = 'Bronze', rankIcon = '🥉';
    if (wins >= 100) { rank = 'Grandmaster'; rankIcon = '👑'; }
    else if (wins >= 50) { rank = 'Diamond'; rankIcon = '💎'; }
    else if (wins >= 25) { rank = 'Platinum'; rankIcon = '🏆'; }
    else if (wins >= 10) { rank = 'Gold'; rankIcon = '🥇'; }
    else if (wins >= 5) { rank = 'Silver'; rankIcon = '🥈'; }

    res.json({
      success: true,
      stats: {
        totalGames, wins, losses, draws, winRate: parseFloat(winRate),
        totalScore, totalCorrect, totalWrong,
        accuracy: totalCorrect + totalWrong > 0 ? ((totalCorrect / (totalCorrect + totalWrong)) * 100).toFixed(1) : 0,
        rank, rankIcon
      }
    });
  } catch (error) {
    console.error('Error fetching battle stats:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải thống kê' });
  }
});

// Create a new battle room
router.post('/create', async (req, res) => {
  try {
    const { firebaseUid, displayName, avatar, gameType, gameMode, grade, topic, difficulty, totalQuestions, timePerQuestion } = req.body;

    const roomId = Battle.generateRoomId();

    const battle = await Battle.create({
      room_id: roomId,
      game_type: gameType || 'physics',
      game_mode: gameMode || 'quiz',
      grade: grade || 'all',
      topic: topic || 'all',
      difficulty: difficulty || 'mixed',
      total_questions: totalQuestions || 10,
      time_per_question: timePerQuestion || 30,
      players: [{ firebaseUid, displayName, avatar, isHost: true, isReady: false, score: 0, correctAnswers: 0, wrongAnswers: 0, avgResponseTime: 0 }]
    });

    res.json({ success: true, roomId, battle });
  } catch (error) {
    console.error('Error creating battle room:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tạo phòng' });
  }
});

// Join battle room
router.post('/join/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { firebaseUid, displayName, avatar } = req.body;

    const battle = await Battle.findByRoomId(roomId);
    if (!battle || battle.status !== 'waiting') {
      return res.status(404).json({ success: false, error: 'Phòng không tồn tại hoặc đã bắt đầu' });
    }
    if (battle.players.length >= 2) {
      return res.status(400).json({ success: false, error: 'Phòng đã đầy' });
    }
    if (battle.players.some(p => p.firebaseUid === firebaseUid)) {
      return res.status(400).json({ success: false, error: 'Bạn đã trong phòng này' });
    }

    battle.players.push({ firebaseUid, displayName, avatar, isHost: false, isReady: false, score: 0, correctAnswers: 0, wrongAnswers: 0, avgResponseTime: 0 });
    const updated = await Battle.update(battle.id, { players: battle.players });

    res.json({ success: true, battle: updated });
  } catch (error) {
    console.error('Error joining battle room:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi vào phòng' });
  }
});

// Get battle room info
router.get('/room/:roomId', async (req, res) => {
  try {
    const battle = await Battle.findByRoomId(req.params.roomId);
    if (!battle) {
      return res.status(404).json({ success: false, error: 'Phòng không tồn tại' });
    }
    res.json({ success: true, battle });
  } catch (error) {
    console.error('Error fetching battle room:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải thông tin phòng' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await Battle.getLeaderboard(parseInt(limit));
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải bảng xếp hạng' });
  }
});

// Save battle result
router.post('/save-result', async (req, res) => {
  try {
    const { roomId, firebaseUid, playerName, myScore, opponentScore, opponentName, opponentFirebaseUid, winner, correctAnswers, totalQuestions, avgResponseTime, rewards } = req.body;

    console.log('📝 Saving battle result:', { roomId, firebaseUid, winner });

    let battle = await Battle.findByRoomId(roomId);

    if (!battle) {
      battle = await Battle.create({
        room_id: roomId || `RESULT-${Date.now()}`,
        status: 'finished',
        finished_at: new Date().toISOString(),
        players: []
      });
    }

    const players = battle.players || [];

    // Update or add player
    const playerIndex = players.findIndex(p => p.firebaseUid === firebaseUid);
    if (playerIndex >= 0) {
      players[playerIndex].score = myScore;
      players[playerIndex].correctAnswers = correctAnswers;
      players[playerIndex].avgResponseTime = avgResponseTime;
    } else {
      players.push({
        firebaseUid, displayName: playerName, score: myScore,
        correctAnswers, wrongAnswers: totalQuestions - correctAnswers, avgResponseTime
      });
    }

    // Add opponent
    if (opponentFirebaseUid && !players.find(p => p.firebaseUid === opponentFirebaseUid)) {
      players.push({ firebaseUid: opponentFirebaseUid, displayName: opponentName, score: opponentScore });
    }

    const updates = {
      status: 'finished',
      finished_at: new Date().toISOString(),
      players,
      total_questions: totalQuestions,
      rewards: rewards || battle.rewards
    };

    if (winner === 'me') {
      updates.winner = { firebaseUid, displayName: playerName };
    } else if (winner === 'opponent' && opponentFirebaseUid) {
      updates.winner = { firebaseUid: opponentFirebaseUid, displayName: opponentName };
    }

    await Battle.update(battle.id, updates);

    // Update user XP & add recent activity
    const user = await User.findByAnyId(firebaseUid);
    if (user) {
      const xpGained = rewards?.xp || (winner === 'me' ? 100 : 25);

      // Update profile recent activity
      User.addRecentActivity(user, {
        type: 'pk',
        title: winner === 'me' ? 'Chiến thắng PK' : 'Hoàn thành trận PK',
        detail: `Đối đầu với ${opponentName || 'Người chơi ẩn danh'} (Phòng ${roomId})`,
        xp: xpGained
      });

      await User.update(user.id, { profile: user.profile });

      // Increment XP via RPC
      await supabase.rpc('increment_user_xp', { user_uuid: user.id, xp_amount: xpGained });
    }

    console.log('✅ Battle result saved successfully');
    res.json({ success: true, message: 'Battle result saved', battleId: battle.id });
  } catch (error) {
    console.error('Error saving battle result:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi lưu kết quả' });
  }
});

module.exports = router;
