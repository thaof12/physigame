const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge.cjs');
const User = require('../models/User.cjs');

// In-memory cache for challenges
const challengesCache = new Map();
const CHALLENGES_CACHE_TTL = 30000; // 30 seconds

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const { teacherId, category } = req.query;
    const cacheKey = `c_${teacherId || 'none'}_${category || 'all'}`;
    const now = Date.now();
    const cached = challengesCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return res.json(cached.data);
    }

    let query = require('../src/config/supabase.cjs').supabase
      .from('challenges')
      .select('*');

    if (teacherId === 'all') {
      // Return all challenges regardless of teacher_id
    } else if (teacherId === 'system' || teacherId === 'null') {
      query = query.is('teacher_id', null);
    } else if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    if (category === 'experiment') {
      query = query.eq('category', 'experiment');
    } else if (category === 'exercise') {
      query = query.neq('category', 'experiment');
    }

    const { data: challenges, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const result = challenges || [];
    challengesCache.set(cacheKey, { data: result, expiresAt: now + CHALLENGES_CACHE_TTL });
    res.json(result);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Error fetching challenges', error: error.message });
  }
});

// Get challenges with unlock status for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const challenges = await Challenge.findAll();

    const completedLessons = (user.programs || []).reduce((acc, program) => {
      if (program.progress && program.progress.completedLessons) {
        return acc.concat(program.progress.completedLessons);
      }
      return acc;
    }, []);

    const challengesWithStatus = challenges.map(challenge => {
      const challengeObj = { ...challenge };

      if (!challenge.prerequisite || !challenge.prerequisite.classId || !challenge.prerequisite.lessonId) {
        challengeObj.isUnlocked = true;
        return challengeObj;
      }

      const requiredLessonId = challenge.prerequisite.classId * 1000 + challenge.prerequisite.lessonId;
      const isUnlocked = completedLessons.some(lessonId => Number(lessonId) === Number(requiredLessonId));
      challengeObj.isUnlocked = isUnlocked;
      return challengeObj;
    });

    res.json(challengesWithStatus);
  } catch (error) {
    console.error('Error fetching challenges for user:', error);
    res.status(500).json({ message: 'Error fetching challenges', error: error.message });
  }
});

// Get challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findByChallengeId(parseInt(req.params.id));
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenge', error: error.message });
  }
});

// Create new challenge
router.post('/', async (req, res) => {
  try {
    console.log('📌 POST /api/challenges payload:', req.body);
    const challenge = await Challenge.create(req.body);
    res.status(201).json(challenge);
  } catch (error) {
    console.error('❌ Error creating challenge:', error);
    res.status(500).json({ message: 'Error creating challenge', error: error.message || error, details: error.details, hint: error.hint });
  }
});

// Update challenge
router.put('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.update(parseInt(req.params.id), req.body);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error updating challenge', error: error.message });
  }
});

// Delete challenge
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const { supabase } = require('../src/config/supabase.cjs');

  // UUID v4 regex pattern
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_REGEX.test(id);

  console.log(`🗑️ DELETE /api/challenges/${id} (isUuid: ${isUuid})`);

  try {
    if (isUuid) {
      // UUID-based challenge (teacher-created content stored in Supabase)
      const { data, error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) {
        console.error(`❌ Supabase delete challenge error for id=${id}:`, error);
        return res.status(500).json({ message: 'Error deleting challenge from database', error: error.message });
      }

      if (!data || data.length === 0) {
        console.warn(`⚠️ Challenge ${id} not found in Supabase (may already be deleted)`);
        // Not found — still return success so frontend can clean up its state
      }
    } else {
      // Integer-based legacy challenge
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: `Invalid challenge ID: "${id}"` });
      }
      await Challenge.delete(parsedId);
    }

    // Always clean up related data regardless of whether delete succeeded
    await Promise.allSettled([
      supabase.from('reports').delete().eq('content_id', id),
      supabase.from('class_assignments').delete().eq('content_id', id),
      supabase.from('assigned_content').delete().eq('content_id', id)
    ]);

    console.log(`✅ Challenge ${id} deleted successfully`);
    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error(`❌ Unexpected error deleting challenge ${id}:`, error);
    res.status(500).json({ message: 'Error deleting challenge', error: error.message });
  }
});

module.exports = router;
