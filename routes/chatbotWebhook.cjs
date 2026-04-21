const express = require('express');
const router = express.Router();

const User = require('../models/User.cjs');
const PhysicsGameProgress = require('../models/PhysicsGameProgress.cjs');
const { supabase } = require('../src/config/supabase.cjs');

const TOPIC_ALIASES = {
  'co hoc': 'co_hoc',
  'cơ học': 'co_hoc',
  mechanics: 'co_hoc',
  'nhiet hoc': 'nhiet_hoc',
  'nhiệt học': 'nhiet_hoc',
  thermodynamics: 'nhiet_hoc',
  'dien hoc': 'dien_hoc',
  'điện học': 'dien_hoc',
  electricity: 'dien_hoc',
  'quang hoc': 'quang_hoc',
  'quang học': 'quang_hoc',
  optics: 'quang_hoc',
  'dao dong': 'dao_dong',
  'dao động': 'dao_dong',
  oscillations: 'dao_dong',
  song: 'song',
  waves: 'song'
};

const TOPIC_GAME_ROUTE = {
  co_hoc: '/physics-games/grade/8/race-tracker',
  nhiet_hoc: '/physics-games/grade/8/molecule-motion',
  dien_hoc: '/physics-games/grade/9/ohm-law-circuit-lab',
  quang_hoc: '/physics-games/grade/9/light-refraction-lab',
  dao_dong: '/physics-games/grade/11/simple-harmonic-motion-lab',
  song: '/physics-games/grade/11/wave-interference-studio'
};

const FORMULA_HINTS = {
  co_hoc: 'Co hoc co nhieu cong thuc nen ban hay chi ro bai toan. Mot so cong thuc co ban: v = s/t, F = m.a, p = F/S.',
  nhiet_hoc: 'Nhiet hoc co cong thuc thuong gap: Q = m.c.Δt va Q = m.L.',
  dien_hoc: 'Dien hoc co cong thuc co ban: U = I.R, P = U.I = I^2.R = U^2/R.',
  quang_hoc: 'Quang hoc thuong dung: n1.sin(i) = n2.sin(r), f = d/2 voi guong cau.',
  dao_dong: 'Dao dong dieu hoa: x = A.cos(ωt + φ), v = -ωA.sin(ωt + φ), a = -ω^2.x.',
  song: 'Song co ban: v = λ.f va T = 1/f.'
};

const normalizeText = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()
    .toLowerCase();
};

const parseGrade = (value) => {
  if (value === undefined || value === null) return null;
  const text = normalizeText(value);
  const match = text.match(/\d{1,2}/);
  if (!match) return null;
  const grade = Number(match[0]);
  if (Number.isNaN(grade) || grade < 6 || grade > 12) return null;
  return grade;
};

const normalizeTopic = (value) => {
  const text = normalizeText(value);
  return TOPIC_ALIASES[text] || text.replace(/\s+/g, '_') || null;
};

const safeFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim()) {
      return value;
    }
  }
  return null;
};

const createCxTextResponse = (text, parameters = {}) => {
  return {
    fulfillment_response: {
      messages: [
        {
          text: {
            text: [text]
          }
        }
      ]
    },
    session_info: {
      parameters
    }
  };
};

const toPercent = (score, maxScore) => {
  const safeMax = Number(maxScore) || 0;
  if (safeMax <= 0) return 0;
  return Math.round(((Number(score) || 0) / safeMax) * 100);
};

const roundOne = (value) => Math.round(Number(value || 0) * 10) / 10;

const getGameAnalytics = async (userId, grade) => {
  const { data, error } = await supabase
    .from('game_results')
    .select('chapter, score, max_score, completed, stars, attempts, updated_at')
    .eq('user_id', userId)
    .eq('grade', grade)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const rows = data || [];
  if (!rows.length) {
    return {
      playedCount: 0,
      completedCount: 0,
      avgPercent: 0,
      avgStars: 0,
      weakChapter: null,
      strongChapter: null,
      recentChapter: null
    };
  }

  const chapterStats = new Map();
  let totalPercent = 0;
  let totalStars = 0;
  let completedCount = 0;

  rows.forEach((row) => {
    const percent = toPercent(row.score, row.max_score);
    totalPercent += percent;
    totalStars += Number(row.stars || 0);
    if (row.completed) completedCount += 1;

    const chapter = Number(row.chapter) || 0;
    if (!chapterStats.has(chapter)) {
      chapterStats.set(chapter, { totalPercent: 0, attempts: 0 });
    }
    const chapterEntry = chapterStats.get(chapter);
    chapterEntry.totalPercent += percent;
    chapterEntry.attempts += 1;
  });

  let weakChapter = null;
  let strongChapter = null;
  let weakScore = Number.POSITIVE_INFINITY;
  let strongScore = Number.NEGATIVE_INFINITY;

  chapterStats.forEach((value, chapter) => {
    const avg = value.attempts ? value.totalPercent / value.attempts : 0;
    if (avg < weakScore) {
      weakScore = avg;
      weakChapter = chapter;
    }
    if (avg > strongScore) {
      strongScore = avg;
      strongChapter = chapter;
    }
  });

  return {
    playedCount: rows.length,
    completedCount,
    avgPercent: roundOne(totalPercent / rows.length),
    avgStars: roundOne(totalStars / rows.length),
    weakChapter,
    strongChapter,
    recentChapter: Number(rows[0].chapter) || null
  };
};

const getLessonAnalytics = async (userId, grade) => {
  const { data, error } = await supabase
    .from('lesson_completions')
    .select('chapter_id, score, total_questions, completed, completed_at')
    .eq('user_id', userId)
    .eq('class_id', grade)
    .order('completed_at', { ascending: false });

  if (error) throw error;

  const rows = (data || []).filter((row) => row.completed);
  if (!rows.length) {
    return {
      completedLessons: 0,
      avgQuizPercent: 0,
      weakChapter: null,
      strongChapter: null,
      latestChapter: null
    };
  }

  const chapterStats = new Map();
  let totalPercent = 0;

  rows.forEach((row) => {
    const percent = toPercent(row.score, row.total_questions);
    totalPercent += percent;

    const chapter = Number(row.chapter_id) || 0;
    if (!chapterStats.has(chapter)) {
      chapterStats.set(chapter, { totalPercent: 0, completed: 0 });
    }
    const chapterEntry = chapterStats.get(chapter);
    chapterEntry.totalPercent += percent;
    chapterEntry.completed += 1;
  });

  let weakChapter = null;
  let strongChapter = null;
  let weakScore = Number.POSITIVE_INFINITY;
  let strongScore = Number.NEGATIVE_INFINITY;

  chapterStats.forEach((value, chapter) => {
    const avg = value.completed ? value.totalPercent / value.completed : 0;
    if (avg < weakScore) {
      weakScore = avg;
      weakChapter = chapter;
    }
    if (avg > strongScore) {
      strongScore = avg;
      strongChapter = chapter;
    }
  });

  return {
    completedLessons: rows.length,
    avgQuizPercent: roundOne(totalPercent / rows.length),
    weakChapter,
    strongChapter,
    latestChapter: Number(rows[0].chapter_id) || null
  };
};

const resolveUserAndProgress = async (identifier) => {
  if (!identifier) {
    return { user: null, allProgress: {} };
  }

  const user = await User.findByAnyId(identifier);
  if (!user) {
    return { user: null, allProgress: {} };
  }

  const allProgress = await PhysicsGameProgress.getAllProgress(user.id);
  return { user, allProgress };
};

const inferGradeFromUser = (user) => {
  if (!user || !Array.isArray(user.programs)) return null;
  const physicsProgram = user.programs.find((program) => program.programId === 'physics');
  const grade = Number(physicsProgram?.currentClass);
  if (Number.isNaN(grade) || grade < 6 || grade > 12) return null;
  return grade;
};

const inferActionByTagOrText = (tag, text) => {
  const normalizedTag = normalizeText(tag);
  const normalizedText = normalizeText(text);

  if (normalizedTag.includes('formula') || normalizedTag.includes('cong_thuc')) return 'formula';
  if (normalizedTag.includes('lesson') || normalizedTag.includes('lo_trinh')) return 'lesson';
  if (normalizedTag.includes('game') || normalizedTag.includes('goi_y_game')) return 'game';

  if (/cong\s*thuc|formula/.test(normalizedText)) return 'formula';
  if (/lo\s*trinh|bai\s*hoc|on\s*tap/.test(normalizedText)) return 'lesson';
  return 'game';
};

const buildChapterLessonRoute = (grade, chapter) => {
  if (!grade || !chapter) return '/game-journey';
  return `/physics-lesson/${grade}/${chapter}/1`;
};

router.post('/webhook', async (req, res) => {
  try {
    const tokenFromEnv = process.env.DIALOGFLOW_WEBHOOK_TOKEN;
    const tokenFromHeader = req.headers['x-webhook-token'];

    if (tokenFromEnv && tokenFromHeader !== tokenFromEnv) {
      return res.status(401).json(createCxTextResponse('Webhook token khong hop le.'));
    }

    const payload = req.body || {};
    const tag = payload?.fulfillmentInfo?.tag || '';

    const sessionParameters = payload?.sessionInfo?.parameters || {};
    const intentParameters = payload?.intentInfo?.parameters || {};
    const inputText = safeFirst(payload?.text, payload?.transcript, payload?.queryText, '');

    const userIdentifier = safeFirst(
      sessionParameters.userId,
      sessionParameters.user_id,
      sessionParameters.userEmail,
      sessionParameters.user_email,
      intentParameters.userId?.resolvedValue,
      intentParameters.userEmail?.resolvedValue
    );

    const detectedGrade = parseGrade(
      safeFirst(
        sessionParameters.grade,
        sessionParameters.khoi,
        intentParameters.grade?.resolvedValue,
        intentParameters.khoi?.resolvedValue
      )
    );

    const detectedTopic = normalizeTopic(
      safeFirst(
        sessionParameters.topic,
        sessionParameters.chuDe,
        intentParameters.topic?.resolvedValue,
        intentParameters.chuDe?.resolvedValue
      )
    );

    const action = inferActionByTagOrText(tag, inputText);
    const { user, allProgress } = await resolveUserAndProgress(userIdentifier);

    const fallbackGrade = inferGradeFromUser(user) || 8;
    const grade = detectedGrade || fallbackGrade;
    const topic = detectedTopic;

    const completedGames = Array.isArray(allProgress?.[String(grade)]?.completed)
      ? allProgress[String(grade)].completed.length
      : 0;

    let gameAnalytics = null;
    let lessonAnalytics = null;
    if (user) {
      [gameAnalytics, lessonAnalytics] = await Promise.all([
        getGameAnalytics(user.id, grade),
        getLessonAnalytics(user.id, grade)
      ]);
    }

    if (action === 'formula') {
      const formulaText = FORMULA_HINTS[topic] ||
        'Ban cho minh biet chu de cu the (co hoc, nhiet hoc, dien hoc, quang hoc, dao dong, song) de minh dua cong thuc dung.';

      const responseText = user
        ? `${formulaText} Minh thay ban dang hoc lop ${grade}. Diem quiz trung binh cua ban dang la ${lessonAnalytics?.avgQuizPercent || 0}%. Minh se tao vi du sat muc do hien tai cua ban.`
        : `${formulaText} Neu muon goi y theo tien do ca nhan, hay gui them userEmail hoac userId trong session parameter.`;

      const weakChapter = lessonAnalytics?.weakChapter || gameAnalytics?.weakChapter || null;
      const reviewRoute = buildChapterLessonRoute(grade, weakChapter);

      return res.json(createCxTextResponse(responseText, {
        detected_grade: grade,
        detected_topic: topic || null,
        suggested_route: '/physics-tools/calculator',
        review_route: reviewRoute,
        weak_chapter: weakChapter,
        avg_quiz_percent: lessonAnalytics?.avgQuizPercent || 0
      }));
    }

    if (action === 'lesson') {
      const weakChapter = lessonAnalytics?.weakChapter || gameAnalytics?.weakChapter || null;
      const focusRoute = buildChapterLessonRoute(grade, weakChapter);

      const responseText = user
        ? `Ban dang hoc lop ${grade}. Da hoan thanh ${lessonAnalytics?.completedLessons || 0} bai hoc va ${gameAnalytics?.completedCount || completedGames} game. Chuong nen tap trung tiep theo la chuong ${weakChapter || (lessonAnalytics?.latestChapter || 1)}.`
        : `Goi y lo trinh cho lop ${grade}: bat dau tu ly thuyet nen tang, sau do luyen game theo tung chu de.`;

      return res.json(createCxTextResponse(responseText, {
        detected_grade: grade,
        detected_topic: topic || null,
        suggested_route: '/game-journey',
        focus_lesson_route: focusRoute,
        completed_games: gameAnalytics?.completedCount || completedGames,
        completed_lessons: lessonAnalytics?.completedLessons || 0,
        weak_chapter: weakChapter,
        avg_quiz_percent: lessonAnalytics?.avgQuizPercent || 0,
        avg_game_percent: gameAnalytics?.avgPercent || 0
      }));
    }

    const topicRoute = topic ? TOPIC_GAME_ROUTE[topic] : null;
    const weakChapter = gameAnalytics?.weakChapter || lessonAnalytics?.weakChapter || null;
    const weakChapterRoute = weakChapter ? `/physics-games/grade/${grade}` : null;
    const suggestedRoute = topicRoute || weakChapterRoute || `/physics-games/grade/${grade}`;

    const responseText = user
      ? `Minh de xuat game cho ban o lop ${grade}. Ban da hoan thanh ${gameAnalytics?.completedCount || completedGames} game, diem trung binh ${gameAnalytics?.avgPercent || 0}%. Nen luyen them chuong ${weakChapter || (gameAnalytics?.recentChapter || 1)}. Mo nhanh: ${suggestedRoute}`
      : `Minh de xuat game phu hop: ${suggestedRoute}. Neu ban cung cap userEmail, minh se goi y theo tien do hoc thuc te.`;

    return res.json(createCxTextResponse(responseText, {
      detected_grade: grade,
      detected_topic: topic || null,
      suggested_route: suggestedRoute,
      completed_games: gameAnalytics?.completedCount || completedGames,
      completed_lessons: lessonAnalytics?.completedLessons || 0,
      weak_chapter: weakChapter,
      strong_chapter: gameAnalytics?.strongChapter || lessonAnalytics?.strongChapter || null,
      avg_quiz_percent: lessonAnalytics?.avgQuizPercent || 0,
      avg_game_percent: gameAnalytics?.avgPercent || 0
    }));
  } catch (error) {
    console.error('Error in Dialogflow webhook:', error);
    return res.status(200).json(createCxTextResponse('He thong tam thoi ban. Ban thu lai sau it phut nhe.'));
  }
});

module.exports = router;
