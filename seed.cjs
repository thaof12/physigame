// Seed database - PhysiGame Supabase version
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed for PhysiGame...');

    // Load data dynamically (ESM data files)
    // We use dynamic import because these are .js files in a "type": "module" project
    const lessonsModule = await import('./src/areas/Vatly/data/physicsLessons.js');
    const gamesModule = await import('./src/areas/Vatly/data/physicsGames.js');
    
    const physicsLessons = lessonsModule.physicsLessons;
    const physicsGames = gamesModule.physicsGames;

    // ===== SEED LESSONS =====
    console.log('--- Seeding Lessons ---');
    // Delete old lessons
    const { error: deleteError } = await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) console.warn('⚠️ Error deleting old lessons:', deleteError.message);
    else console.log('✓ Cleared old lessons');

    const transformedLessons = [];
    Object.keys(physicsLessons).forEach(grade => {
      const gradeData = physicsLessons[grade];
      gradeData.chapters.forEach(chapter => {
        chapter.lessons.forEach(lesson => {
          transformedLessons.push({
            class_id: parseInt(grade),
            chapter_id: chapter.id,
            lesson_id: lesson.id,
            title: lesson.title,
            description: `Bài học ${lesson.id}: ${lesson.title} - ${chapter.title}`,
            level: 'Beginner',
            theory: '',
            content: '',
            game: {},
            sort_order: (parseInt(grade) * 1000) + (chapter.id * 100) + lesson.id
          });
        });
      });
    });

    // Batch insert Lessons
    for (let i = 0; i < transformedLessons.length; i += 50) {
      const batch = transformedLessons.slice(i, i + 50);
      const { error: insertError } = await supabase.from('lessons').insert(batch);
      if (insertError) {
        console.error(`❌ Error inserting lessons batch ${i}:`, insertError.message);
      }
    }
    console.log(`✓ Seeded ${transformedLessons.length} lessons.`);

    // ===== SEED CHALLENGES =====
    console.log('--- Seeding Challenges ---');
    const { error: deleteChallengeError } = await supabase.from('challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteChallengeError) console.warn('⚠️ Error deleting old challenges:', deleteChallengeError.message);
    else console.log('✓ Cleared old challenges');

    const transformedChallenges = physicsGames.map((game, index) => {
      // Map difficulty
      let difficultyText = 'Dễ';
      if (game.difficulty === 'medium') difficultyText = 'Trung bình';
      if (game.difficulty === 'hard') difficultyText = 'Khó';

      // Create a unique numeric ID for challenge_id
      const idMatch = game.id.match(/\d+/);
      const gradeNum = game.grade || (idMatch ? idMatch[0] : 0);
      const challengeId = (parseInt(gradeNum) * 100) + (index + 1);

      return {
        challenge_id: challengeId,
        name: game.title,
        description: game.description,
        icon: game.icon || '🎯',
        difficulty: difficultyText,
        difficulty_level: game.difficulty || 'easy',
        difficulty_color: game.color ? `bg-gradient-to-r ${game.color}` : 'bg-blue-500',
        category: 'game',
        grade: game.grade || 8,
        time: game.estimatedTime || '15-20 phút',
        points: 200,
        status: 'available',
        link: `/game/${game.slug}`,
        features: game.topics || [],
        prerequisite: {}
      };
    });

    const { error: insertChallengeError } = await supabase.from('challenges').insert(transformedChallenges);
    if (insertChallengeError) {
      console.error('❌ Error inserting challenges:', insertChallengeError.message);
    } else {
      console.log(`✓ Seeded ${transformedChallenges.length} challenges.`);
    }

    console.log('🚀 Seed database thành công!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Lỗi seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
