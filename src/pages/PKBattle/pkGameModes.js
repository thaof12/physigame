/**
 * pkGameModes.js - Cấu hình các chế độ game cho PK Battle
 * 
 * Bao gồm:
 * 1. Quiz Mode - Trắc nghiệm truyền thống
 * 2. Challenge Mode - Game thao tác từ folder challenges
 * 3. Mixed Mode - Kết hợp cả hai
 */

// ==================== DANH SÁCH GAME CHALLENGES PHÙ HỢP CHO PK ====================
// Chỉ chọn các game có thể chơi nhanh, có điểm số rõ ràng
export const pkChallengeGames = {
  // Lớp 6
  grade6: [
    {
      id: 'water-lab',
      name: 'Thí Nghiệm Nước',
      component: 'WaterLab',
      icon: '💧',
      duration: 60,
      description: 'Khám phá áp suất và tính chất của nước',
      difficulty: 'easy',
      topic: 'nhiet-hoc'
    },
    {
      id: 'force-world',
      name: 'Thế Giới Lực',
      component: 'ForceWorldGame',
      icon: '🌍',
      duration: 90,
      description: 'Khám phá các loại lực trong tự nhiên',
      difficulty: 'easy',
      topic: 'co-hoc'
    }
  ],

  // Lớp 7
  grade7: [
    {
      id: 'light-reflection',
      name: 'Phản Xạ Ánh Sáng',
      component: 'LightReflectionGame',
      icon: '💡',
      duration: 60,
      description: 'Điều hướng tia sáng đến đích',
      difficulty: 'medium',
      topic: 'quang-hoc'
    },
    {
      id: 'mirror-lab',
      name: 'Phòng Gương',
      component: 'MirrorLabGame',
      icon: '🪞',
      duration: 90,
      description: 'Xác định ảnh qua gương phẳng',
      difficulty: 'medium',
      topic: 'quang-hoc'
    },
    {
      id: 'light-path',
      name: 'Đường Đi Ánh Sáng',
      component: 'LightPathGame',
      icon: '✨',
      duration: 60,
      description: 'Khám phá sự truyền sáng',
      difficulty: 'easy',
      topic: 'quang-hoc'
    },
    {
      id: 'circuit-builder',
      name: 'Xây Dựng Mạch Điện',
      component: 'CircuitBuilderGame',
      icon: '🔌',
      duration: 120,
      description: 'Lắp ráp mạch điện cơ bản',
      difficulty: 'hard',
      topic: 'dien-hoc'
    }
  ],

  // Lớp 8
  grade8: [
    {
      id: 'race-tracker',
      name: 'Đua Tốc Độ',
      component: 'RaceTracker',
      icon: '🏎️',
      duration: 60,
      description: 'So sánh vận tốc các vật',
      difficulty: 'easy',
      topic: 'co-hoc'
    },
    {
      id: 'force-arena',
      name: 'Võ Đài Lực',
      component: 'ForceArena',
      icon: '💪',
      duration: 90,
      description: 'Cân bằng các lực tác dụng',
      difficulty: 'medium',
      topic: 'co-hoc'
    },
    {
      id: 'boiling-game',
      name: 'Sự Sôi',
      component: 'BoilingGame',
      icon: '🌡️',
      duration: 60,
      description: 'Tìm hiểu về nhiệt độ và sự sôi',
      difficulty: 'medium',
      topic: 'nhiet-hoc'
    },
    {
      id: 'thermal-energy',
      name: 'Năng Lượng Nhiệt',
      component: 'ThermalEnergyGame',
      icon: '🔥',
      duration: 60,
      description: 'Sự truyền nhiệt và nội năng',
      difficulty: 'medium',
      topic: 'nhiet-hoc'
    }
  ],

  // Lớp 9 - 12 (Simplified)
  grade9: [
    {
      id: 'projectile-motion',
      name: 'Chuyển Động Ném',
      component: 'ProjectileMotion',
      icon: '🎯',
      duration: 90,
      description: 'Dự đoán quỹ đạo ném xiên',
      difficulty: 'hard',
      topic: 'co-hoc'
    }
  ],

  grade10: [
    {
      id: 'balance-challenge',
      name: 'Thử Thách Cân Bằng',
      component: 'BalanceChallenge',
      icon: '⚖️',
      duration: 90,
      description: 'Trạng thái cân bằng của vật thể',
      difficulty: 'hard',
      topic: 'co-hoc'
    }
  ],

  grade11: [],
  grade12: []
};


// ==================== CHẾ ĐỘ GAME ====================
export const pkGameModeConfig = {
  quiz: {
    id: 'quiz',
    name: 'Trắc Nghiệm',
    icon: '📝',
    description: 'Trả lời câu hỏi trắc nghiệm nhanh',
    color: 'from-blue-500 to-cyan-500'
  },
  challenge: {
    id: 'challenge',
    name: 'Thao Tác',
    icon: '🎮',
    description: 'Thi đấu qua các game tương tác',
    color: 'from-purple-500 to-pink-500'
  },
  mixed: {
    id: 'mixed',
    name: 'Hỗn Hợp',
    icon: '🎲',
    description: 'Kết hợp trắc nghiệm và game thao tác',
    color: 'from-orange-500 to-red-500'
  }
};

// ==================== CẤU HÌNH ĐỘ KHÓ ====================
export const difficultyConfig = {
  easy: {
    id: 'easy',
    name: 'Dễ',
    icon: '🌱',
    color: 'text-green-500',
    pointMultiplier: 1,
    timeBonus: 1.2 // +20% thời gian
  },
  medium: {
    id: 'medium',
    name: 'Trung Bình',
    icon: '🌿',
    color: 'text-yellow-500',
    pointMultiplier: 1.5,
    timeBonus: 1
  },
  hard: {
    id: 'hard',
    name: 'Khó',
    icon: '🌳',
    color: 'text-orange-500',
    pointMultiplier: 2,
    timeBonus: 0.8 // -20% thời gian
  },
  expert: {
    id: 'expert',
    name: 'Chuyên Gia',
    icon: '🔥',
    color: 'text-red-500',
    pointMultiplier: 3,
    timeBonus: 0.6 // -40% thời gian
  }
};

// ==================== CẤU HÌNH XẾP HẠNG ====================
export const rankConfig = {
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    icon: '🥉',
    minPoints: 0,
    color: 'from-amber-600 to-amber-800'
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    icon: '🥈',
    minPoints: 500,
    color: 'from-gray-300 to-gray-500'
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    icon: '🥇',
    minPoints: 1500,
    color: 'from-yellow-400 to-yellow-600'
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    icon: '💎',
    minPoints: 3000,
    color: 'from-cyan-400 to-blue-500'
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    icon: '💠',
    minPoints: 5000,
    color: 'from-blue-400 to-purple-500'
  },
  master: {
    id: 'master',
    name: 'Master',
    icon: '👑',
    minPoints: 10000,
    color: 'from-purple-500 to-pink-500'
  },
  legend: {
    id: 'legend',
    name: 'Legend',
    icon: '🏆',
    minPoints: 20000,
    color: 'from-red-500 to-orange-500'
  }
};

// ==================== CHỦ ĐỀ VẬT LÝ ====================
export const physicsTopics = {
  'co-hoc': { name: 'Cơ học', icon: '⚙️' },
  'nhiet-hoc': { name: 'Nhiệt học', icon: '🔥' },
  'dien-hoc': { name: 'Điện học', icon: '⚡' },
  'quang-hoc': { name: 'Quang học', icon: '💡' },
  'am-hoc': { name: 'Âm học', icon: '🔊' },
  'dien-tu': { name: 'Điện từ', icon: '🧲' },
  'dao-dong': { name: 'Dao động', icon: '🔄' },
  'song': { name: 'Sóng', icon: '🌊' },
  'luong-tu': { name: 'Lượng tử', icon: '⚛️' },
  'do-luong': { name: 'Đo lường', icon: '📏' },
  'khoi-luong': { name: 'Khối lượng', icon: '⚖️' }
};

// ==================== HÀM TIỆN ÍCH ====================

/**
 * Lấy danh sách game theo lớp và độ khó
 */
export const getGamesByGradeAndDifficulty = (grade, difficulty = null) => {
  const gradeKey = `grade${grade}`;
  const games = pkChallengeGames[gradeKey] || [];
  
  if (difficulty) {
    return games.filter(g => g.difficulty === difficulty);
  }
  return games;
};

/**
 * Lấy danh sách game theo chủ đề
 */
export const getGamesByTopic = (topic) => {
  const allGames = [];
  Object.values(pkChallengeGames).forEach(gradeGames => {
    allGames.push(...gradeGames.filter(g => g.topic === topic));
  });
  return allGames;
};

/**
 * Random game cho PK Battle
 */
export const getRandomGames = (count, options = {}) => {
  const { grade, difficulty, topic } = options;
  
  console.log('getRandomGames called with:', { count, grade, difficulty, topic });
  console.log('pkChallengeGames keys:', Object.keys(pkChallengeGames));
  
  let availableGames = [];
  
  // Always get all games first, then filter
  Object.entries(pkChallengeGames).forEach(([gradeKey, gradeGames]) => {
    const gradeNum = gradeKey.replace('grade', '');
    const gamesWithGrade = gradeGames.map(g => ({ ...g, grade: gradeNum }));
    availableGames.push(...gamesWithGrade);
  });
  
  console.log('Total games from all grades:', availableGames.length);
  
  // Filter by grade if specified
  if (grade && grade !== 'all' && grade !== '') {
    const gradeStr = String(grade);
    const filteredByGrade = availableGames.filter(g => String(g.grade) === gradeStr);
    // Only use filtered if we have games, otherwise keep all
    if (filteredByGrade.length > 0) {
      availableGames = filteredByGrade;
      console.log('After grade filter:', availableGames.length);
    } else {
      console.log('No games for grade', grade, ', using all grades');
    }
  }
  
  // Filter by difficulty if specified
  if (difficulty && difficulty !== 'mixed' && difficulty !== 'all' && difficulty !== '') {
    const filteredByDiff = availableGames.filter(g => g.difficulty === difficulty);
    // Only use filtered if we have games
    if (filteredByDiff.length > 0) {
      availableGames = filteredByDiff;
      console.log('After difficulty filter:', availableGames.length);
    } else {
      console.log('No games for difficulty', difficulty, ', using all difficulties');
    }
  }
  
  if (topic) {
    const filteredByTopic = availableGames.filter(g => g.topic === topic);
    if (filteredByTopic.length > 0) {
      availableGames = filteredByTopic;
    }
  }
  
  console.log('getRandomGames - Final available games:', availableGames.length, 'Requested:', count);
  console.log('getRandomGames - Sample game:', availableGames[0]);
  
  // Shuffle và lấy số lượng cần
  const shuffled = [...availableGames].sort(() => Math.random() - 0.5);
  
  // If not enough games, repeat them
  let result = [];
  while (result.length < count && shuffled.length > 0) {
    result = [...result, ...shuffled];
  }
  
  return result.slice(0, count).map((g, i) => ({
    ...g,
    points: g.points || 100, // Ensure points field exists
    category: g.topic || 'physics'
  }));
};

/**
 * Tính điểm cho một round
 */
export const calculateRoundScore = (baseScore, difficulty, timeRemaining, maxTime) => {
  const diffConfig = difficultyConfig[difficulty] || difficultyConfig.medium;
  const timeBonus = Math.round((timeRemaining / maxTime) * 50); // Max 50 điểm bonus thời gian
  
  return Math.round((baseScore + timeBonus) * diffConfig.pointMultiplier);
};

/**
 * Xác định rank dựa trên tổng điểm
 */
export const getRankByPoints = (totalPoints) => {
  const ranks = Object.values(rankConfig).sort((a, b) => b.minPoints - a.minPoints);
  
  for (const rank of ranks) {
    if (totalPoints >= rank.minPoints) {
      return rank;
    }
  }
  
  return rankConfig.bronze;
};

/**
 * Tính điểm cần để lên rank tiếp theo
 */
export const getPointsToNextRank = (currentPoints) => {
  const currentRank = getRankByPoints(currentPoints);
  const ranks = Object.values(rankConfig).sort((a, b) => a.minPoints - b.minPoints);
  
  const currentIndex = ranks.findIndex(r => r.id === currentRank.id);
  if (currentIndex < ranks.length - 1) {
    const nextRank = ranks[currentIndex + 1];
    return {
      nextRank,
      pointsNeeded: nextRank.minPoints - currentPoints
    };
  }
  
  return { nextRank: null, pointsNeeded: 0 };
};

export default {
  pkChallengeGames,
  pkGameModeConfig,
  difficultyConfig,
  rankConfig,
  physicsTopics,
  getGamesByGradeAndDifficulty,
  getGamesByTopic,
  getRandomGames,
  calculateRoundScore,
  getRankByPoints,
  getPointsToNextRank
};
