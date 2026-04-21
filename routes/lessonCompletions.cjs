const express = require('express');
const router = express.Router();
const LessonCompletion = require('../models/LessonCompletion.cjs');
const User = require('../models/User.cjs');

// Get lesson completion status
router.get('/', async (req, res) => {
  try {
    const { userId, lessonId } = req.query;
    const user = await User.findByAnyId(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const completion = await LessonCompletion.findOne(user.id, lessonId);
    res.json(completion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all completed lessons for a user in a class
router.get('/class/:classId', async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findByAnyId(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const completions = await LessonCompletion.findByClass(user.id, parseInt(req.params.classId));
    res.json(completions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit lesson completion
router.post('/', async (req, res) => {
  try {
    const { userId, lessonId, classId, chapterId, lessonNumber, completed, score, totalQuestions, quizAnswers } = req.body;

    const user = await User.findByAnyId(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const completion = await LessonCompletion.upsert({
      user_id: user.id, lesson_id: lessonId,
      class_id: classId, chapter_id: chapterId,
      lesson_number: lessonNumber, completed,
      score, total_questions: totalQuestions,
      quiz_answers: quizAnswers
    });

    res.status(201).json(completion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
