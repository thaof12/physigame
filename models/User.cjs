const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Thông tin tài khoản
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String // Để trống nếu đăng nhập bằng Google
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true // Cho phép null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Cho phép null
  },
  displayName: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  
  // Profile information
  profile: {
    grade: Number, // Lớp học hiện tại sau khi làm placement test
    bio: String,
    avatar: String
  },
  
  // XP và Level
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Chương trình học
  programs: [{
    programId: {
      type: String,
      required: true,
      enum: ['chemistry', 'physics', 'biology', 'math']
    },
    programName: String,
    currentClass: Number, // Lớp đang học (8, 9, 10, 11, 12)
    // currentLesson: Number, // Bài đang học (removed - progress tracked in progress.completedLessons)
    isActive: {
      type: Boolean,
      default: true
    },
    placementTestCompleted: {
      type: Boolean,
      default: false
    },
    placementTestScore: Number,
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      completedLessons: [Number], // Danh sách ID các bài đã hoàn thành
      lessonStars: {
        type: Map,
        of: Number,
        default: new Map() // Key: uniqueLessonId, Value: số sao (1-3)
      },
      totalScore: {
        type: Number,
        default: 0
      },
      lastStudyDate: Date
    }
  }],
  
  // Physics Games Progress - Tiến độ hành trình game Vật lý theo lớp
  physicsGameProgress: {
    type: Map,
    of: {
      type: Object,
      default: () => ({
        completed: [],  // Danh sách ID game đã hoàn thành
        current: null   // Game đang chơi
      })
    },
    default: new Map() // Key: grade (6, 7, 8, 9, 10, 11, 12), Value: { completed, current }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware tự động cập nhật updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods - Authentication
userSchema.methods.setPassword = async function(password) {
  this.password = await bcrypt.hash(password, 10);
};

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getProgram = function(programId) {
  return this.programs.find(p => p.programId === programId);
};

// Methods - Physics Games Progress
userSchema.methods.savePhysicsGameProgress = function(grade, completed, current) {
  if (!this.physicsGameProgress) {
    this.physicsGameProgress = new Map();
  }
  
  const gradeStr = grade.toString();
  this.physicsGameProgress.set(gradeStr, {
    completed: completed || [],
    current: current || null,
    lastUpdated: new Date()
  });
  
  this.markModified('physicsGameProgress');
  return this.physicsGameProgress.get(gradeStr);
};

userSchema.methods.getPhysicsGameProgress = function(grade) {
  if (!this.physicsGameProgress) {
    return { completed: [], current: null };
  }
  
  const gradeStr = grade.toString();
  return this.physicsGameProgress.get(gradeStr) || { completed: [], current: null };
};

userSchema.methods.getAllPhysicsGameProgress = function() {
  if (!this.physicsGameProgress) {
    return {};
  }
  
  const result = {};
  this.physicsGameProgress.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

module.exports = mongoose.model('User', userSchema);
