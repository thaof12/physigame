const express = require('express');
const router = express.Router();
const path = require('path');

// Note: Lessons are primarily loaded from filesystem (areas/Vatly/classX/index.cjs)
// The Supabase lessons table is used as a secondary source

// Get all lessons
router.get('/', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson.cjs');
    const { teacherId } = req.query;
    
    let lessons;
    if (teacherId === 'all') {
      const { data, error } = await require('../src/config/supabase.cjs').supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      lessons = data || [];
    } else if (teacherId === 'system' || teacherId === 'null') {
      const { data, error } = await require('../src/config/supabase.cjs').supabase
        .from('lessons')
        .select('*')
        .is('teacher_id', null)
        .order('class_id', { ascending: true })
        .order('chapter_id', { ascending: true })
        .order('sort_order', { ascending: true });
      if (error) throw error;
      lessons = data || [];
    } else if (teacherId) {
      const { data, error } = await require('../src/config/supabase.cjs').supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      lessons = data || [];
    } else {
      const { data, error } = await require('../src/config/supabase.cjs').supabase
        .from('lessons')
        .select('*')
        .is('teacher_id', null)
        .order('class_id', { ascending: true })
        .order('chapter_id', { ascending: true })
        .order('sort_order', { ascending: true });
      if (error) throw error;
      lessons = data || [];
    }
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lessons grouped by classId -> chapterId -> lessons
router.get('/grouped', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson.cjs');
    const lessons = await Lesson.findAll();

    const grouped = {};
    lessons.forEach((l) => {
      const cId = l.class_id || 0;
      const chId = l.chapter_id || 0;
      if (!grouped[cId]) grouped[cId] = {};
      if (!grouped[cId][chId]) grouped[cId][chId] = [];
      grouped[cId][chId].push(l);
    });

    const result = Object.keys(grouped).map((c) => ({
      classId: parseInt(c, 10),
      chapters: Object.keys(grouped[c]).map((ch) => ({
        chapterId: parseInt(ch, 10),
        lessons: grouped[c][ch]
      }))
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get class statistics summary
router.get('/statistics', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson.cjs');
    const lessons = await Lesson.findAll();

    const classStats = {};
    lessons.forEach(lesson => {
      const classId = lesson.class_id;
      if (!classStats[classId]) {
        classStats[classId] = { classId, chapters: new Set(), lessons: 0 };
      }
      classStats[classId].lessons++;
      if (lesson.chapter_id) classStats[classId].chapters.add(lesson.chapter_id);
    });

    const result = Object.values(classStats).map(stat => ({
      grade: stat.classId, chapters: stat.chapters.size, lessons: stat.lessons, topics: []
    })).sort((a, b) => a.grade - b.grade);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lessons by class and chapter
router.get('/class/:classId/chapter/:chapterId', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson.cjs');
    const lessons = await Lesson.findByClassAndChapter(
      parseInt(req.params.classId),
      parseInt(req.params.chapterId)
    );
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific lesson - Enhanced with DB primary and clean fallback
router.get('/class/:classId/chapter/:chapterId/lesson/:lessonId', async (req, res) => {
  try {
    const { classId, chapterId, lessonId } = req.params;
    const subject = req.query.subject || 'physics';
    const Lesson = require('../models/Lesson.cjs');

    console.log(`📂 Fetching lesson: subject=${subject}, class=${classId}, chapter=${chapterId}, lesson=${lessonId}`);

    // Try DB first
    const lessonData = await Lesson.findByClassChapterLesson(
      parseInt(classId),
      parseInt(chapterId),
      parseInt(lessonId)
    );

    if (lessonData) {
      console.log('✅ Found lesson in database');
      return res.json(lessonData);
    }

    // Attempt filesystem only if legacy mode might be relevant (optional, but keep it clean)
    // Currently, it's safer to return 404 if not in DB to let frontend fallback trigger
    console.log('⚠️ Lesson not found in DB, returning 404 for frontend fallback');
    return res.status(404).json({ message: 'Lesson data not yet available in database.' });

  } catch (error) {
    console.error('❌ Error in lesson route:', error);
    res.status(500).json({ message: 'Internal server error processing lesson request.' });
  }
});

// Get specific lesson (legacy route)
router.get('/:pathId/:lessonId', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson.cjs');
    const { data, error } = await require('../src/config/supabase.cjs').supabase
      .from('lessons').select('*')
      .eq('class_id', parseInt(req.params.pathId))
      .eq('lesson_id', parseInt(req.params.lessonId))
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new lesson
router.post('/', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson.cjs');
    const lesson = await Lesson.create(req.body);
    res.status(201).json(lesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update lesson
router.patch('/:id', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson.cjs');
    const lesson = await Lesson.update(req.params.id, req.body);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete lesson
router.delete('/:id', async (req, res) => {
  const { supabase } = require('../src/config/supabase.cjs');
  const lessonId = req.params.id;

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_REGEX.test(lessonId);

  console.log(`🗑️ DELETE /api/lessons/${lessonId} (isUuid: ${isUuid})`);

  try {
    if (isUuid) {
      // UUID-based lesson (teacher-created content stored in Supabase)
      const { data, error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)
        .select('id');

      if (error) {
        console.error(`❌ Supabase delete lesson error for id=${lessonId}:`, error);
        return res.status(500).json({ message: 'Error deleting lesson from database', error: error.message });
      }

      if (!data || data.length === 0) {
        console.warn(`⚠️ Lesson ${lessonId} not found in Supabase (may already be deleted)`);
        // Still return success so frontend can clean up its state
      }
    } else {
      // Integer-based legacy lesson
      const Lesson = require('../models/Lesson.cjs');
      const parsedId = parseInt(lessonId, 10);
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: `Invalid lesson ID: "${lessonId}"` });
      }
      await Lesson.delete(parsedId);
    }

    // Always clean up related data — use Promise.allSettled so one failure doesn't abort others
    // Note: Do NOT call .catch() on Supabase query builders directly; always await them
    await Promise.allSettled([
      supabase.from('reports').delete().eq('content_id', lessonId),
      supabase.from('class_assignments').delete().eq('content_id', lessonId),
      supabase.from('assigned_content').delete().eq('content_id', lessonId)
    ]);

    console.log(`✅ Lesson ${lessonId} deleted successfully`);
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error(`❌ Unexpected error deleting lesson ${lessonId}:`, error);
    res.status(500).json({ message: 'Error deleting lesson', error: error.message });
  }
});

module.exports = router;
