const express = require('express');
const Lesson = require('../models/Lesson.cjs');
const User = require('../models/User.cjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authMiddleware = require('../middleware/auth.js');
const path = require('path');
const fs = require('fs');

const parseAdminEmails = () => {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const getUserFromToken = async (req) => {
  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : '';

  if (!token) {
    return null;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  const potentialId = decoded?.userId;

  if (!potentialId) {
    return null;
  }

  if (String(potentialId).match(/^[0-9a-fA-F]{24}$/)) {
    return User.findById(potentialId).select('-password');
  }

  return User.findOne({
    $or: [
      { email: potentialId },
      { firebaseUid: potentialId }
    ]
  }).select('-password');
};

const isAdminUser = (user) => {
  if (!user) {
    return false;
  }

  if (user.isAdmin || user.role === 'admin') {
    return true;
  }

  const adminEmails = parseAdminEmails();
  return adminEmails.includes(String(user.email || '').toLowerCase());
};
// Get all lessons
router.get('/', async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ pathId: 1, order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lessons grouped by classId -> chapterId -> lessons
router.get('/grouped', async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ classId: 1, chapterId: 1, order: 1 });

    const grouped = {};
    lessons.forEach((l) => {
      const cId = l.classId || 0;
      const chId = l.chapterId || 0;
      if (!grouped[cId]) grouped[cId] = {};
      if (!grouped[cId][chId]) grouped[cId][chId] = [];
      grouped[cId][chId].push(l);
    });

    // convert to array structure
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
    const lessons = await Lesson.find();
    
    // Group lessons by classId
    const classStats = {};
    
    lessons.forEach(lesson => {
      const classId = lesson.classId;
      if (!classStats[classId]) {
        classStats[classId] = {
          classId,
          chapters: new Set(),
          lessons: 0,
          topics: new Set()
        };
      }
      
      classStats[classId].lessons++;
      if (lesson.chapterId) {
        classStats[classId].chapters.add(lesson.chapterId);
      }
    });
    
    // Convert to array and format
    const result = Object.values(classStats).map(stat => ({
      grade: stat.classId,
      chapters: stat.chapters.size,
      lessons: stat.lessons,
      topics: [] // Topics will need to be defined separately or extracted from chapter names
    })).sort((a, b) => a.grade - b.grade);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lessons by path
router.get('/class/:classId/chapter/:chapterId', async (req, res) => {
  try {
    const lessons = await Lesson.find({
      classId: parseInt(req.params.classId),
      chapterId: parseInt(req.params.chapterId)
    }).sort({ order: 1 });
    
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific lesson by classId, chapterId, lessonId (per-chapter)
router.get('/class/:classId/chapter/:chapterId/lesson/:lessonId', async (req, res) => {
  try {
    const { classId, chapterId, lessonId } = req.params;
    const subject = req.query.subject || 'physics'; // Default to physics

    console.log(`📂 Attempting to load lesson: subject=${subject}, class=${classId}, chapter=${chapterId}, lesson=${lessonId} (in-chapter index)`);

    try {
      // Sử dụng path.resolve để đảm bảo đường dẫn chính xác từ root của project
      const basePath = subject === 'physics' ? 'Vatly' : 'Hoahoc';
      const lessonFilePath = path.resolve(__dirname, '..', 'areas', basePath, `class${classId}`, 'index.cjs');
      
      console.log(`📁 Loading from: ${lessonFilePath}`);
      
      // Xóa cache để đảm bảo load file mới nhất
      delete require.cache[require.resolve(lessonFilePath)];
      
      const allLessonsForClass = require(lessonFilePath);

      const lessonsInChapter = allLessonsForClass.filter(lesson => lesson.chapterId == chapterId);

      // lessonId from URL is 1-based, array is 0-based.
      const lessonData = lessonsInChapter[parseInt(lessonId, 10) - 1];

      if (lessonData) {
        console.log('✅ Loaded lesson from file system using chapter-based index');
        return res.json(lessonData);
      } else {
        console.log(`⚠️ Lesson not found for in-chapter index: ${lessonId}`);
        return res.status(404).json({ message: 'Lesson not found' });
      }
    } catch (fileError) {
      console.log(`⚠️ Could not load lessons for class ${classId} from file system:`, fileError.message);
      // Fallback to DB if file system fails for the whole class
      // For now, we just return an error as the user is focused on file-based data.
      return res.status(500).json({ message: `Could not load lesson data for class ${classId}.` });
    }
  } catch (error) {
    console.error('❌ Error fetching lesson:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update physics lesson theory content in file system
router.put('/class/:classId/chapter/:chapterId/lesson/:lessonId/content', async (req, res) => {
  try {
    const requestUser = await getUserFromToken(req);
    if (!isAdminUser(requestUser)) {
      return res.status(403).json({ message: 'Only admin users can update lesson theory content.' });
    }

    const { classId, chapterId, lessonId } = req.params;
    const subject = req.body?.subject || 'physics';

    if (subject !== 'physics') {
      return res.status(400).json({ message: 'Only physics subject is supported for file updates.' });
    }

    const classFolder = path.resolve(__dirname, '..', 'areas', 'Vatly', `class${classId}`);
    if (!fs.existsSync(classFolder)) {
      return res.status(404).json({ message: `Class folder not found: class${classId}` });
    }

    const lessonFiles = fs
      .readdirSync(classFolder)
      .filter((fileName) => /^lesson\d+\.cjs$/i.test(fileName))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const bNum = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return aNum - bNum;
      });

    const loadedLessons = lessonFiles.map((fileName) => {
      const fullPath = path.join(classFolder, fileName);
      delete require.cache[require.resolve(fullPath)];
      const data = require(fullPath);
      return { fileName, fullPath, data };
    });

    const lessonsInChapter = loadedLessons.filter((entry) => String(entry.data?.chapterId) === String(chapterId));
    const targetLesson = lessonsInChapter[parseInt(lessonId, 10) - 1];

    if (!targetLesson) {
      return res.status(404).json({ message: 'Lesson not found for given chapter lesson index.' });
    }

    const payload = req.body || {};
    const theory = typeof payload.theory === 'string' ? payload.theory : targetLesson.data?.content?.theory;
    const topics = Array.isArray(payload.topics)
      ? payload.topics.map((item) => String(item).trim()).filter(Boolean)
      : (targetLesson.data?.content?.topics || []);
    const theoryQuestions = Array.isArray(payload.theoryQuestions)
      ? payload.theoryQuestions.map((item) => String(item).trim()).filter(Boolean)
      : (targetLesson.data?.content?.theoryQuestions || []);
    const videos = Array.isArray(payload.videos)
      ? payload.videos
          .map((item) => {
            if (typeof item === 'string') {
              const url = item.trim();
              return url ? { title: '', url } : null;
            }

            if (!item || typeof item !== 'object') {
              return null;
            }

            const title = String(item.title || '').trim();
            const url = String(item.url || '').trim();

            return url ? { title, url } : null;
          })
          .filter(Boolean)
      : (targetLesson.data?.content?.videos || []);

    const updatedLesson = {
      ...targetLesson.data,
      content: {
        ...(targetLesson.data?.content || {}),
        theory,
        topics,
        theoryQuestions,
        videos
      }
    };

    const serialized = `module.exports = ${JSON.stringify(updatedLesson, null, 2)};\n`;
    fs.writeFileSync(targetLesson.fullPath, serialized, 'utf8');

    delete require.cache[require.resolve(targetLesson.fullPath)];

    return res.json({
      message: 'Lesson content updated successfully.',
      lesson: updatedLesson,
      file: targetLesson.fileName
    });
  } catch (error) {
    console.error('❌ Error updating lesson content:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Get specific lesson (legacy route - kept for backward compatibility)
router.get('/:pathId/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ 
      pathId: parseInt(req.params.pathId),
      lessonId: parseInt(req.params.lessonId)
    });
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new lesson (admin only)
router.post('/', async (req, res) => {
  const lesson = new Lesson(req.body);
  
  try {
    const newLesson = await lesson.save();
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update lesson (admin only)
router.patch('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    Object.assign(lesson, req.body);
    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete lesson (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    await lesson.deleteOne();
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
