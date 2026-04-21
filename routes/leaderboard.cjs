const express = require('express');
const router = express.Router();
const User = require('../models/User.cjs');
const { supabase } = require('../src/config/supabase.cjs');

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const { type = 'xp', userId, limit = 50 } = req.query;

    let sortField = 'xp';
    if (type === 'streak') sortField = 'xp'; // Streak stored in JSONB, sort by XP as fallback
    if (type === 'pk') sortField = 'xp';

    const { data: users, error } = await supabase
      .from('users').select('id,username,display_name,email,xp,level,profile,avatar')
      .order(sortField, { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    const leaderboard = (users || []).map((user, index) => ({
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

    const { count: total } = await supabase
      .from('users').select('id', { count: 'exact', head: true });

    res.json({ success: true, leaderboard, userRank, total: total || 0 });
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
