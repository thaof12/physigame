// Achievement definitions
export const ACHIEVEMENTS = [
  { id: 1, title: '7 ngày liên tục', icon: '🔥', requirement: 'streak', value: 7 },
  { id: 2, title: 'Hoàn thành 5 bài', icon: '⭐', requirement: 'lessons', value: 5 },
  { id: 3, title: '100% một bài', icon: '🏆', requirement: 'perfect', value: 1 },
  { id: 4, title: 'Hoàn thành cấp Cơ bản', icon: '🎓', requirement: 'path', value: 1 },
  { id: 5, title: '14 ngày liên tục', icon: '💪', requirement: 'streak', value: 14 },
  { id: 6, title: '1000 điểm', icon: '💎', requirement: 'points', value: 1000 },
  { id: 7, title: 'Hoàn thành 20 bài', icon: '🌟', requirement: 'lessons', value: 20 },
  { id: 8, title: '30 ngày liên tục', icon: '🔥🔥', requirement: 'streak', value: 30 },
];

// Point values
export const POINTS = {
  QUIZ_CORRECT: 10,
  LESSON_COMPLETE: 50,
  PERFECT_SCORE: 100,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 10,
};

// Quiz types
export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  FILL_IN_BLANK: 'fill-in-blank',
};

// Pass threshold
export const PASS_THRESHOLD = 0.7; // 70%
