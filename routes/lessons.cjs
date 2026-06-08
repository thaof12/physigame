const express = require('express');
const router = express.Router();
const path = require('path');

// Note: Lessons are primarily loaded from filesystem (areas/Vatly/classX/index.cjs)
// The Supabase lessons table is used as a secondary source

// Get all lessons
router.get('/', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson.cjs');
    const lessons = await Lesson.findAll();
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
  try {
    const Lesson = require('../models/Lesson.cjs');
    await Lesson.delete(req.params.id);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
