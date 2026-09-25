const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs');
const { supabase } = require('../src/config/supabase.cjs');

// In-memory cache for leaderboard
let cachedLeaderboardData = null;
let cachedLeaderboardTime = 0;
const LEADERBOARD_CACHE_TTL = 15000; // 15 seconds

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const { type = 'xp', userId, limit = 50 } = req.query;

    let sortField = 'xp';
    if (type === 'streak') sortField = 'xp'; // Streak stored in JSONB, sort by XP as fallback
    if (type === 'pk') sortField = 'xp';

    let leaderboard = null;
    let total = 0;
    const now = Date.now();

    // Use cached list if available and default params
    if (!userId && type === 'xp' && cachedLeaderboardData && (now - cachedLeaderboardTime < LEADERBOARD_CACHE_TTL)) {
      leaderboard = cachedLeaderboardData.leaderboard.slice(0, parseInt(limit));
      total = cachedLeaderboardData.total;
      return res.json({ success: true, leaderboard, userRank: null, total });
    }

    const { data: users, error } = await supabase
      .from('users').select('id,username,display_name,email,xp,level,profile,avatar')
      .order(sortField, { ascending: false })
      .limit(Math.max(parseInt(limit), 50));

    if (error) throw error;

    leaderboard = (users || []).map((user, index) => ({
      rank: index + 1,
      username: user.username || user.email?.split('@')[0] || 'Anonymous',
      displayName: user.display_name || user.username || user.email?.split('@')[0],
      avatar: user.avatar || null,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: 0,
      pkRating: 1000,
      pkWins: 0,
      pkLosses: 0
    }));

    const { count: totalCount } = await supabase
      .from('users').select('id', { count: 'exact', head: true });
    total = totalCount || 0;

    if (type === 'xp') {
      cachedLeaderboardData = { leaderboard, total };
      cachedLeaderboardTime = now;
    }

    let userRank = null;
    if (userId) {
      const currentUser = await User.findByAnyId(userId);
      if (currentUser) {
        const { count } = await supabase
          .from('users').select('id', { count: 'exact', head: true })
          .gt(sortField, currentUser[sortField] || 0);

        userRank = {
          rank: (count || 0) + 1,
          username: currentUser.username || currentUser.email?.split('@')[0],
          displayName: currentUser.display_name || currentUser.username,
          avatar: currentUser.avatar || null,
          xp: currentUser.xp || 0
        };
      }
    }

    res.json({ success: true, leaderboard: leaderboard.slice(0, parseInt(limit)), userRank, total });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard', message: error.message });
  }
});

// GET /api/leaderboard/top
router.get('/top', async (req, res) => {
  try {
    const { type = 'xp' } = req.query;

    const { data: topUsers, error } = await supabase
      .from('users').select('username,display_name,xp,avatar')
      .order('xp', { ascending: false })
      .limit(3);

    if (error) throw error;

    res.json({
      success: true,
      top: (topUsers || []).map((user, index) => ({
        rank: index + 1,
        displayName: user.display_name || user.username,
        avatar: user.avatar,
        value: user.xp
      }))
    });
  } catch (error) {
    console.error('Error fetching top leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top users' });
  }
});

module.exports = router;
