/**
 * PK Battle Round Generator
 * Generates rounds for PK battles based on game mode, grade, and difficulty
 */

// No challenge mode imports needed as PK is quiz-only now

// Sample quiz questions organized by grade
const quizQuestions = {
  '6': [
    {
      id: 'q6-1',
      question: "Đơn vị đo chiều dài trong hệ SI là gì?",
      options: ["cm", "m", "km", "mm"],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "measurement"
    },
    {
      id: 'q6-2',
      question: "1 kg bằng bao nhiêu gram?",
      options: ["10 g", "100 g", "1000 g", "10000 g"],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "measurement"
    },
    {
      id: 'q6-3',
      question: "Nhiệt kế đo nhiệt độ dựa trên hiện tượng gì?",
      options: ["Nóng chảy", "Dãn nở vì nhiệt", "Bay hơi", "Ngưng tụ"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 150,
      category: "thermal"
    }
  ],
  '7': [
    {
      id: 'q7-1',
      question: "Ánh sáng truyền theo đường thẳng trong môi trường:",
      options: ["Không đồng nhất", "Trong suốt đồng nhất", "Mờ đục", "Bất kỳ"],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "optics"
    },
    {
      id: 'q7-2',
      question: "Góc tới bằng góc phản xạ là định luật:",
      options: ["Khúc xạ", "Phản xạ ánh sáng", "Truyền thẳng", "Tổng hợp"],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "optics"
    },
    {
      id: 'q7-3',
      question: "Âm thanh không truyền được trong:",
      options: ["Nước", "Không khí", "Sắt", "Chân không"],
      correctAnswer: 3,
      difficulty: "medium",
      points: 150,
      category: "sound"
    }
  ],
  '8': [
    {
      id: 'q8-1',
      question: "Công thức tính vận tốc là:",
      options: ["v = s × t", "v = s / t", "v = t / s", "v = s + t"],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "motion"
    },
    {
      id: 'q8-2',
      question: "Đơn vị của lực trong hệ SI là:",
      options: ["kg", "m/s", "N", "J"],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "force"
    },
    {
      id: 'q8-3',
      question: "Áp suất được tính bằng công thức:",
      options: ["P = F × S", "P = F / S", "P = S / F", "P = F - S"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 150,
      category: "pressure"
    },
    {
      id: 'q8-4',
      question: "Lực đẩy Ác-si-mét phụ thuộc vào:",
      options: ["Khối lượng vật", "Thể tích vật chìm", "Hình dạng vật", "Vật liệu làm vật"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 150,
      category: "pressure"
    }
  ],
  '9': [
    {
      id: 'q9-1',
      question: "Định luật Ôm phát biểu: I = ?",
      options: ["U × R", "U / R", "R / U", "U + R"],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "electricity"
    },
    {
      id: 'q9-2',
      question: "Đơn vị của điện trở là:",
      options: ["Volt (V)", "Ampe (A)", "Ohm (Ω)", "Watt (W)"],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "electricity"
    },
    {
      id: 'q9-3',
      question: "Công thức tính công suất điện là:",
      options: ["P = U × I", "P = U / I", "P = I / U", "P = U + I"],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "electricity"
    },
    {
      id: 'q9-4',
      question: "Thấu kính hội tụ có tiêu cự:",
      options: ["Âm", "Dương", "Bằng 0", "Vô cực"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 150,
      category: "optics"
    }
  ],
  '10': [
    {
      id: 'q10-1',
      question: "Công thức chuyển động thẳng đều là:",
      options: ["s = v × t", "s = v / t", "s = a × t²", "s = v₀ + at"],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "kinematics"
    },
    {
      id: 'q10-2',
      question: "Gia tốc rơi tự do xấp xỉ bằng:",
      options: ["10 m/s", "9.8 m/s²", "10 m/s²", "9.8 m/s"],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "kinematics"
    },
    {
      id: 'q10-3',
      question: "Định luật II Newton: F = ?",
      options: ["m / a", "m × a", "a / m", "m + a"],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "dynamics"
    },
    {
      id: 'q10-4',
      question: "Công thức tính động năng là:",
      options: ["E = mgh", "E = ½mv²", "E = Fs", "E = Pt"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 150,
      category: "energy"
    }
  ],
  '11': [
    {
      id: 'q11-1',
      question: "Định luật Coulomb về lực tương tác giữa hai điện tích tỉ lệ:",
      options: ["Thuận với khoảng cách", "Nghịch với bình phương khoảng cách", "Thuận với bình phương khoảng cách", "Không phụ thuộc khoảng cách"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 150,
      category: "electrostatics"
    },
    {
      id: 'q11-2',
      question: "Công thức tính điện dung của tụ điện phẳng là:",
      options: ["C = εS/d", "C = d/εS", "C = εd/S", "C = S/εd"],
      correctAnswer: 0,
      difficulty: "medium",
      points: 150,
      category: "capacitor"
    },
    {
      id: 'q11-3',
      question: "Chu kỳ dao động của con lắc đơn phụ thuộc vào:",
      options: ["Khối lượng quả nặng", "Chiều dài dây", "Biên độ dao động", "Vật liệu làm quả nặng"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 150,
      category: "oscillation"
    }
  ],
  '12': [
    {
      id: 'q12-1',
      question: "Công thức liên hệ giữa T và ω trong dao động điều hòa:",
      options: ["T = 2πω", "T = ω/2π", "T = 2π/ω", "T = π/ω"],
      correctAnswer: 2,
      difficulty: "medium",
      points: 150,
      category: "oscillation"
    },
    {
      id: 'q12-2',
      question: "Hiện tượng quang điện xảy ra khi:",
      options: ["λ < λ₀", "λ > λ₀", "λ = λ₀", "Không phụ thuộc λ"],
      correctAnswer: 0,
      difficulty: "hard",
      points: 200,
      category: "quantum"
    },
    {
      id: 'q12-3',
      question: "Công thức Einstein về hiệu ứng quang điện:",
      options: ["hf = A + ½mv²max", "hf = A - ½mv²max", "hf = ½mv²max - A", "hf = A × ½mv²max"],
      correctAnswer: 0,
      difficulty: "hard",
      points: 200,
      category: "quantum"
    },
    {
      id: 'q12-4',
      question: "Chu kỳ bán rã của đồng vị phóng xạ là thời gian để:",
      options: ["Phân rã hoàn toàn", "Còn lại ½ số hạt nhân", "Còn lại ¼ số hạt nhân", "Phát ra ½ năng lượng"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 150,
      category: "nuclear"
    }
  ]
};

/**
 * Get quiz questions filtered by grade and difficulty
 */
export const getQuizQuestions = (grade = 'all', difficulty = 'mixed', count = 10) => {
  let allQuestions = [];
  
  if (grade === 'all') {
    // Get questions from all grades
    Object.values(quizQuestions).forEach(gradeQuestions => {
      allQuestions = [...allQuestions, ...gradeQuestions];
    });
  } else {
    // Get questions from specific grade
    allQuestions = quizQuestions[grade] || [];
  }
  
  // Filter by difficulty
  if (difficulty !== 'mixed') {
    allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
  }
  
  // Shuffle and take required count
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Generate battle rounds based on game mode
 */
export const generateBattleRounds = (settings) => {
  const {
    grade = 'all',
    difficulty = 'mixed',
    totalQuestions = 10,
    timePerQuestion = 30
  } = settings;

  const rounds = [];

  // Only quiz questions
  const questions = getQuizQuestions(grade, difficulty, totalQuestions);
  questions.forEach((q, index) => {
    rounds.push({
      index,
      type: 'quiz',
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      category: q.category,
      points: q.points,
      timeLimit: timePerQuestion
    });
  });

  return rounds;
};

/**
 * Calculate score for a round
 */
export const calculateRoundScore = (round, result) => {
  const basePoints = round.points || 100;
  
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 2.5
  }[round.difficulty] || 1;
  
  if (result.isCorrect) {
    // Time bonus for quick answers
    const maxTimeBonus = 50;
    const timeBonus = Math.floor((result.timeRemaining / round.timeLimit) * maxTimeBonus);
    return Math.floor((basePoints + timeBonus) * difficultyMultiplier);
  }
  return 0;
};

export default {
  generateBattleRounds,
  getQuizQuestions,
  calculateRoundScore
};
