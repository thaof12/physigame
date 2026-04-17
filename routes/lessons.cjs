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

// Get specific lesson - loads from filesystem
router.get('/class/:classId/chapter/:chapterId/lesson/:lessonId', async (req, res) => {
  try {
    const { classId, chapterId, lessonId } = req.params;
    const subject = req.query.subject || 'physics';

    console.log(`📂 Loading lesson: subject=${subject}, class=${classId}, chapter=${chapterId}, lesson=${lessonId}`);

    try {
      const basePath = subject === 'physics' ? 'Vatly' : 'Hoahoc';
      const lessonFilePath = path.resolve(__dirname, '..', 'areas', basePath, `class${classId}`, 'index.cjs');

      console.log(`📁 Loading from: ${lessonFilePath}`);
      delete require.cache[require.resolve(lessonFilePath)];
      const allLessonsForClass = require(lessonFilePath);

      const lessonsInChapter = allLessonsForClass.filter(lesson => lesson.chapterId == chapterId);
      const lessonData = lessonsInChapter[parseInt(lessonId, 10) - 1];

      if (lessonData) {
        console.log('✅ Loaded lesson from file system');
        return res.json(lessonData);
      } else {
        return res.status(404).json({ message: 'Lesson not found' });
      }
    } catch (fileError) {
      console.log(`⚠️ Could not load lessons for class ${classId}:`, fileError.message);
      return res.status(500).json({ message: `Could not load lesson data for class ${classId}.` });
    }
  } catch (error) {
    console.error('❌ Error fetching lesson:', error);
    res.status(500).json({ message: error.message });
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
