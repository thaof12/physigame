const express = require('express');
const router = express.Router();
const Battle = require('../models/Battle.cjs');

// Get user's battle history
router.get('/history/:odbaseUId', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const battles = await Battle.find({
      'players.firebaseUid': firebaseUid,
      status: 'finished'
    })
      .sort({ finishedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Battle.countDocuments({
      'players.firebaseUid': firebaseUid,
      status: 'finished'
    });

    res.json({
      success: true,
      battles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching battle history:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải lịch sử đấu' });
  }
});

// Get user's battle stats
router.get('/stats/:odbaseUId', async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const battles = await Battle.find({
      'players.firebaseUid': firebaseUid,
      status: 'finished'
    });

    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalScore = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    battles.forEach(battle => {
      const player = battle.players.find(p => p.firebaseUid === firebaseUid);
      if (player) {
        totalScore += player.score;
        totalCorrect += player.correctAnswers;
        totalWrong += player.wrongAnswers;
      }

      if (battle.winner?.firebaseUid === firebaseUid) {
        wins++;
      } else if (battle.winner?.firebaseUid) {
        losses++;
      } else {
        draws++;
      }
    });

    const totalGames = battles.length;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

    // Calculate rank based on wins
    let rank = 'Bronze';
    let rankIcon = '🥉';
    if (wins >= 100) {
      rank = 'Grandmaster';
      rankIcon = '👑';
    } else if (wins >= 50) {
      rank = 'Diamond';
      rankIcon = '💎';
    } else if (wins >= 25) {
      rank = 'Platinum';
      rankIcon = '🏆';
    } else if (wins >= 10) {
      rank = 'Gold';
      rankIcon = '🥇';
    } else if (wins >= 5) {
      rank = 'Silver';
      rankIcon = '🥈';
    }

    res.json({
      success: true,
      stats: {
        totalGames,
        wins,
        losses,
        draws,
        winRate: parseFloat(winRate),
        totalScore,
        totalCorrect,
        totalWrong,
        accuracy: totalCorrect + totalWrong > 0 
          ? ((totalCorrect / (totalCorrect + totalWrong)) * 100).toFixed(1) 
          : 0,
        rank,
        rankIcon
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
    const { 
      firebaseUid, 
      displayName, 
      avatar, 
      gameType, 
      gameMode, // NEW: 'quiz', 'challenge', 'mixed'
      grade,    // NEW: 'all', '6', '7'...'12'
      topic,    // NEW: 'all' or specific topic
      difficulty, 
      totalQuestions, 
      timePerQuestion 
    } = req.body;

    const roomId = await Battle.generateRoomId();

    const battle = new Battle({
      roomId,
      gameType: gameType || 'physics',
      gameMode: gameMode || 'mixed',
      grade: grade || 'all',
      topic: topic || 'all',
      difficulty: difficulty || 'mixed',
      totalQuestions: totalQuestions || 10,
      timePerQuestion: timePerQuestion || 30,
      players: [{
        firebaseUid,
        displayName,
        avatar,
        isHost: true,
        isReady: false
      }]
    });

    await battle.save();

    res.json({
      success: true,
      roomId,
      battle
    });
  } catch (error) {
    console.error('Error creating battle room:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tạo phòng' });
  }
});

// Join battle room by ID
router.post('/join/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { odbaseUId, displayName, avatar } = req.body;

    const battle = await Battle.findOne({ roomId, status: 'waiting' });

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Phòng không tồn tại hoặc đã bắt đầu' });
    }

    if (battle.players.length >= 2) {
      return res.status(400).json({ success: false, error: 'Phòng đã đầy' });
    }

    if (battle.players.some(p => p.firebaseUid === firebaseUid)) {
      return res.status(400).json({ success: false, error: 'Bạn đã trong phòng này' });
    }

    battle.players.push({
      firebaseUid,
      displayName,
      avatar,
      isHost: false,
      isReady: false
    });

    await battle.save();

    res.json({
      success: true,
      battle
    });
  } catch (error) {
    console.error('Error joining battle room:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi vào phòng' });
  }
});

// Get battle room info
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const battle = await Battle.findOne({ roomId });

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Phòng không tồn tại' });
    }

    res.json({
      success: true,
      battle
    });
  } catch (error) {
    console.error('Error fetching battle room:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải thông tin phòng' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Aggregate to get top players
    const leaderboard = await Battle.aggregate([
      { $match: { status: 'finished' } },
      { $unwind: '$players' },
      {
        $group: {
          _id: '$players.firebaseUid',
          displayName: { $last: '$players.displayName' },
          avatar: { $last: '$players.avatar' },
          totalGames: { $sum: 1 },
          totalScore: { $sum: '$players.score' },
          totalCorrect: { $sum: '$players.correctAnswers' }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Add wins count
    for (let player of leaderboard) {
      const wins = await Battle.countDocuments({
        'winner.firebaseUid': player._id,
        status: 'finished'
      });
      player.wins = wins;
    }

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải bảng xếp hạng' });
  }
});

// Save battle result
router.post('/save-result', async (req, res) => {
  try {
    const {
      roomId,
      firebaseUid,
      playerName,
      myScore,
      opponentScore,
      opponentName,
      opponentFirebaseUid,
      winner, // 'me', 'opponent', 'draw'
      correctAnswers,
      totalQuestions,
      avgResponseTime,
      rewards
    } = req.body;

    console.log('📝 Saving battle result:', { roomId, firebaseUid, winner });

    // Find or create battle record
    let battle = await Battle.findOne({ roomId });
    
    if (!battle) {
      // Create new battle record if not exists
      battle = new Battle({
        roomId: roomId || `RESULT-${Date.now()}`,
        status: 'finished',
        finishedAt: new Date()
      });
    }

    // Update battle with result
    battle.status = 'finished';
    battle.finishedAt = new Date();
    
    // Find or add player in battle
    const playerIndex = battle.players.findIndex(p => p.firebaseUid === firebaseUid);
    if (playerIndex >= 0) {
      battle.players[playerIndex].score = myScore;
      battle.players[playerIndex].correctAnswers = correctAnswers;
      battle.players[playerIndex].avgResponseTime = avgResponseTime;
    } else {
      battle.players.push({
        firebaseUid,
        displayName: playerName,
        score: myScore,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        avgResponseTime
      });
    }

    // Add opponent if provided
    if (opponentFirebaseUid && !battle.players.find(p => p.firebaseUid === opponentFirebaseUid)) {
      battle.players.push({
        firebaseUid: opponentFirebaseUid,
        displayName: opponentName,
        score: opponentScore
      });
    }

    // Set winner
    if (winner === 'me') {
      battle.winner = { firebaseUid, displayName: playerName };
    } else if (winner === 'opponent' && opponentFirebaseUid) {
      battle.winner = { firebaseUid: opponentFirebaseUid, displayName: opponentName };
    }

    battle.totalQuestions = totalQuestions;
    battle.rewards = rewards;

    await battle.save();

    // Update user stats
    const User = require('../models/User.cjs');
    const userUpdate = {
      $inc: {
        'stats.pkBattles': 1,
        'stats.pkWins': winner === 'me' ? 1 : 0,
        'stats.pkLosses': winner === 'opponent' ? 1 : 0,
        xp: rewards?.xp || 0,
        coins: rewards?.coins || 0
      }
    };

    await User.findOneAndUpdate(
      { $or: [{ firebaseUid }, { _id: firebaseUid }] },
      userUpdate
    );

    console.log('✅ Battle result saved successfully');

    res.json({
      success: true,
      message: 'Battle result saved',
      battleId: battle._id
    });
  } catch (error) {
    console.error('Error saving battle result:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi lưu kết quả' });
  }
});

module.exports = router;
