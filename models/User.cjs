// User model - Supabase version
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'users';

const User = {
  // ============ QUERY METHODS ============

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByEmail(email) {
    const { data, error } = await supabase  
      .from(TABLE).select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByUsername(username) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('username', username).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByEmailOrUsername(email, username) {
    const { data, error } = await supabase
      .from(TABLE).select('*').or(`email.eq.${email},username.eq.${username}`).limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  async findOne(filters) {
    let query = supabase.from(TABLE).select('*');
    
    if (filters.email) query = query.eq('email', filters.email);
    if (filters.id) query = query.eq('id', filters.id);
    if (filters.username) query = query.eq('username', filters.username);
    
    const { data, error } = await query.limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Find by email, id, or firebaseUid (old) - flexible lookup
  async findByAnyId(idValue) {
    // Try by email first
    let { data, error } = await supabase
      .from(TABLE).select('*').eq('email', idValue).single();
    if (data) return data;

    // Try by ID (UUID format)
    if (idValue && idValue.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      ({ data, error } = await supabase
        .from(TABLE).select('*').eq('id', idValue).single());
      if (data) return data;
    }

    return null;
  },

  async find(filters = {}, options = {}) {
    let query = supabase.from(TABLE).select(options.select || '*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    // Apply sorting
    if (options.sort) {
      Object.entries(options.sort).forEach(([field, dir]) => {
        query = query.order(field, { ascending: dir === 1 || dir === 'asc' });
      });
    }

    // Apply limit
    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // ============ MUTATION METHODS ============

  async create(userData) {
    const { data, error } = await supabase
      .from(TABLE).insert(userData).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async upsert(userData) {
    const { data, error } = await supabase
      .from(TABLE).upsert(userData).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async countDocuments(filters = {}) {
    let query = supabase.from(TABLE).select('id', { count: 'exact', head: true });
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  // ============ BUSINESS LOGIC METHODS ============

  addXP(user, amount) {
    user.xp = (user.xp || 0) + amount;
    const newLevel = Math.floor(user.xp / 100) + 1;
    const leveledUp = newLevel > (user.level || 1);
    user.level = newLevel;
    return { xp: user.xp, level: user.level, leveledUp };
  },

  enrollProgram(user, programId, programName, currentClass = null) {
    const programs = user.programs || [];
    const existing = programs.find(p => p.programId === programId);
    if (existing) return existing;

    const newProgram = {
      programId,
      programName,
      currentClass,
      enrolledAt: new Date().toISOString(),
      isActive: true,
      placementTestCompleted: false,
      progress: {
        completedLessons: [],
        lessonStars: {},
        totalScore: 0,
        lastStudyDate: null
      }
    };

    programs.push(newProgram);
    user.programs = programs;
    return newProgram;
  },

  updateProgramProgress(user, programId, classId, lessonId, score) {
    const programs = user.programs || [];
    let program = programs.find(p => p.programId === programId);

    if (!program) {
      const programNames = {
        chemistry: 'Hóa học',
        physics: 'Vật lý',
        biology: 'Sinh học',
        math: 'Toán học'
      };
      program = {
        programId,
        programName: programNames[programId] || programId,
        currentClass: parseInt(classId),
        isActive: true,
        placementTestCompleted: false,
        enrolledAt: new Date().toISOString(),
        progress: {
          completedLessons: [],
          lessonStars: {},
          totalScore: 0,
          lastStudyDate: null
        }
      };
      programs.push(program);
      user.programs = programs;
      console.log('✅ Auto-created program:', programId);
    }

    program.currentClass = parseInt(classId);

    const uniqueLessonId = parseInt(classId) * 1000 + parseInt(lessonId);

    if (!program.progress) {
      program.progress = { completedLessons: [], lessonStars: {}, totalScore: 0, lastStudyDate: null };
    }

    if (!program.progress.completedLessons) {
      program.progress.completedLessons = [];
    }

    if (lessonId && !program.progress.completedLessons.includes(uniqueLessonId)) {
      program.progress.completedLessons.push(uniqueLessonId);
      console.log('✅ Added completed lesson:', uniqueLessonId);
    }

    if (score) {
      program.progress.totalScore = (program.progress.totalScore || 0) + score;
    }

    program.progress.lastStudyDate = new Date().toISOString();
    user.programs = programs;
    return program;
  },

  updateLessonStars(user, programId, classId, lessonId, percentage) {
    const programs = user.programs || [];
    const program = programs.find(p => p.programId === programId);
    if (!program) return null;

    const uniqueLessonId = parseInt(classId) * 1000 + parseInt(lessonId);

    if (!program.progress.lessonStars) {
      program.progress.lessonStars = {};
    }

    let stars = 0;
    if (percentage >= 100) stars = 3;
    else if (percentage >= 80) stars = 2;
    else if (percentage >= 50) stars = 1;

    const currentStars = program.progress.lessonStars[uniqueLessonId.toString()] || 0;
    if (stars > currentStars) {
      program.progress.lessonStars[uniqueLessonId.toString()] = stars;
      console.log(`⭐ Updated lesson ${uniqueLessonId} stars: ${currentStars} → ${stars}`);
    }

    user.programs = programs;
    return stars;
  },

  getProgram(user, programId) {
    return (user.programs || []).find(p => p.programId === programId);
  },

  savePhysicsGameProgress(user, grade, completed, current) {
    const pgp = user.physics_game_progress || {};
    pgp[grade.toString()] = {
      completed: completed || [],
      current: current || null,
      lastUpdated: new Date().toISOString()
    };
    user.physics_game_progress = pgp;
    return pgp[grade.toString()];
  },

  getPhysicsGameProgress(user, grade) {
    const pgp = user.physics_game_progress || {};
    return pgp[grade.toString()] || { completed: [], current: null };
  },

  getAllPhysicsGameProgress(user) {
    return user.physics_game_progress || {};
  },

  addRecentActivity(user, activityData) {
    if (!user) return user;
    
    const profile = user.profile || {};
    let recentActivity = profile.recentActivity || [];
    
    // Add new activity at the beginning
    recentActivity.unshift({
      ...activityData,
      time: new Date().toISOString()
    });
    
    // Limit to 50 items
    if (recentActivity.length > 50) {
      recentActivity = recentActivity.slice(0, 50);
    }
    
    profile.recentActivity = recentActivity;
    user.profile = profile;
    return user;
  }
};

module.exports = User;
