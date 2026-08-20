const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge.cjs');
const User = require('../models/User.cjs');

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const { teacherId, category } = req.query;
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

    res.json(challenges || []);
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
  try {
    const id = req.params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const { supabase } = require('../src/config/supabase.cjs');
    
    if (isUuid) {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      await Challenge.delete(parseInt(id));
    }

    // Clean up related reports, assignments and locks
    await Promise.all([
      supabase.from('reports').delete().eq('content_id', id).catch(() => {}),
      supabase.from('class_assignments').delete().eq('content_id', id).catch(() => {}),
      supabase.from('assigned_content').delete().eq('content_id', id).catch(() => {})
    ]).catch(() => {});

    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting challenge', error: error.message });
  }
});

module.exports = router;
