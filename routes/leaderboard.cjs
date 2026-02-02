const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs');
const QuestProgress = require('../models/Quest.cjs');

// GET /api/leaderboard - Lấy bảng xếp hạng
router.get('/', async (req, res) => {
  try {
    const { type = 'xp', range = 'weekly', userId, limit = 50 } = req.query;
    
    let sortField;
    let matchStage = {};
    
    // Xác định field để sort
    switch (type) {
      case 'xp':
        sortField = 'xp';
        break;
      case 'streak':
        sortField = 'progress.currentStreak';
        break;
      case 'pk':
        sortField = 'pkStats.rating';
        break;
      default:
        sortField = 'xp';
    }
    
    // Xử lý time range (có thể mở rộng sau)
    // Hiện tại lấy tất cả, có thể thêm filter theo createdAt hoặc lastActive
    
    // Lấy top users
    const users = await User.find({})
      .select('username displayName email xp level profile.avatar progress.currentStreak pkStats')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Format leaderboard data
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username || user.email?.split('@')[0] || 'Anonymous',
      displayName: user.displayName || user.username || user.email?.split('@')[0],
      avatar: user.profile?.avatar || null,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.progress?.currentStreak || 0,
      pkRating: user.pkStats?.rating || 1000,
      pkWins: user.pkStats?.wins || 0,
      pkLosses: user.pkStats?.losses || 0
    }));
    
    // Tìm rank của user hiện tại nếu có userId
    let userRank = null;
    if (userId) {
      const currentUser = await User.findOne({ 
        $or: [{ firebaseUid: userId }, { _id: userId }] 
      }).lean();
      
      if (currentUser) {
        // Đếm số user có điểm cao hơn
        let countQuery = {};
        countQuery[sortField] = { $gt: currentUser[sortField] || 0 };
        
        const higherRankedCount = await User.countDocuments(countQuery);
        
        userRank = {
          rank: higherRankedCount + 1,
          username: currentUser.username || currentUser.email?.split('@')[0],
          displayName: currentUser.displayName || currentUser.username,
          avatar: currentUser.profile?.avatar || null,
          xp: currentUser.xp || 0,
          streak: currentUser.progress?.currentStreak || 0,
          pkRating: currentUser.pkStats?.rating || 1000
        };
      }
    }
    
    res.json({
      success: true,
      leaderboard,
      userRank,
      total: await User.countDocuments({})
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leaderboard',
      message: error.message 
    });
  }
});

// GET /api/leaderboard/top - Lấy top 3 nhanh cho widget
router.get('/top', async (req, res) => {
  try {
    const { type = 'xp' } = req.query;
    
    let sortField = type === 'streak' ? 'progress.currentStreak' : 
                   type === 'pk' ? 'pkStats.rating' : 'xp';
    
    const topUsers = await User.find({})
      .select('username displayName xp profile.avatar progress.currentStreak pkStats.rating')
      .sort({ [sortField]: -1 })
      .limit(3)
      .lean();
    
    res.json({
      success: true,
      top: topUsers.map((user, index) => ({
        rank: index + 1,
        displayName: user.displayName || user.username,
        avatar: user.profile?.avatar,
        value: type === 'streak' ? user.progress?.currentStreak : 
               type === 'pk' ? user.pkStats?.rating : user.xp
      }))
    });
    
  } catch (error) {
    console.error('Error fetching top leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top users' });
  }
});

module.exports = router;
