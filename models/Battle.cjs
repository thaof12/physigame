const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['waiting', 'ready', 'playing', 'finished', 'cancelled'],
    default: 'waiting'
  },
  gameType: {
    type: String,
    enum: ['random', 'physics', 'chemistry'],
    default: 'physics'
  },
  // NEW FIELDS for game mode support
  gameMode: {
    type: String,
    enum: ['quiz', 'challenge', 'mixed'],
    default: 'mixed'
  },
  grade: {
    type: String,
    enum: ['all', '6', '7', '8', '9', '10', '11', '12'],
    default: 'all'
  },
  topic: {
    type: String,
    default: 'all'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  players: [{
    odId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firebaseUid: String,
    displayName: String,
    avatar: String,
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    isReady: { type: Boolean, default: false },
    isHost: { type: Boolean, default: false }
  }],
  // Support both quiz questions and challenge games
  rounds: [{
    type: {
      type: String,
      enum: ['quiz', 'challenge'],
      default: 'quiz'
    },
    // For quiz type
    questionId: String,
    question: String,
    options: [String],
    correctAnswer: Number,
    difficulty: String,
    category: String,
    points: Number,
    timeLimit: Number,
    // For challenge type
    gameId: String,
    gameName: String,
    gameComponent: String,
    gameGrade: String,
    gameCategory: String,
    // Common fields
    answers: [{
      firebaseUid: String,
      // For quiz
      selectedAnswer: Number,
      isCorrect: Boolean,
      // For challenge
      gameScore: Number,
      gameCompleted: Boolean,
      // Common
      responseTime: Number,
      pointsEarned: Number
    }]
  }],
  // Keep legacy questions field for compatibility
  questions: [{
    questionId: String,
    question: String,
    options: [String],
    correctAnswer: Number,
    difficulty: String,
    category: String,
    points: Number,
    timeLimit: Number,
    answers: [{
      firebaseUid: String,
      selectedAnswer: Number,
      isCorrect: Boolean,
      responseTime: Number,
      pointsEarned: Number
    }]
  }],
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  currentRoundIndex: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 10
  },
  totalRounds: {
    type: Number,
    default: 10
  },
  timePerQuestion: {
    type: Number,
    default: 30 // seconds
  },
  winner: {
    firebaseUid: String,
    displayName: String
  },
  rewards: {
    winnerXP: { type: Number, default: 100 },
    loserXP: { type: Number, default: 25 },
    winnerCoins: { type: Number, default: 50 },
    loserCoins: { type: Number, default: 10 }
  },
  startedAt: Date,
  finishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
battleSchema.index({ status: 1, createdAt: -1 });
battleSchema.index({ 'players.firebaseUid': 1 });

// Generate unique room ID
battleSchema.statics.generateRoomId = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomId = '';
  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
};

// Get active battles count
battleSchema.statics.getActiveBattlesCount = async function() {
  return await this.countDocuments({ status: { $in: ['waiting', 'playing'] } });
};

// Find waiting room for matchmaking
battleSchema.statics.findWaitingRoom = async function(gameType, difficulty) {
  return await this.findOne({
    status: 'waiting',
    gameType,
    difficulty,
    'players.1': { $exists: false } // Room has only 1 player
  }).sort({ createdAt: 1 });
};

module.exports = mongoose.model('Battle', battleSchema);
