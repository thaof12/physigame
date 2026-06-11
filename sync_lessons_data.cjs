// Sync educational resources from text file to Supabase database
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  try {
    console.log('📖 Reading ngan_hang_noi_dung.txt...');
    const filePath = path.join(__dirname, 'public', 'lessons_data', 'ngan_hang_noi_dung.txt');
    if (!fs.existsSync(filePath)) {
      console.error('❌ Error: file public/lessons_data/ngan_hang_noi_dung.txt does not exist.');
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    const parsedItems = [];
    let currentItem = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const colonIdx = trimmedLine.indexOf(':');
      if (colonIdx !== -1) {
        const key = trimmedLine.substring(0, colonIdx).trim().toLowerCase();
        const value = trimmedLine.substring(colonIdx + 1).trim();

        if (key === 'tên bài học') {
          if (currentItem && currentItem.title && currentItem.link) {
            parsedItems.push(currentItem);
          }
          currentItem = { title: value };
        } else if (currentItem) {
          if (key === 'thể loại') {
            let cat = value;
            if (value.toLowerCase().replace(/\s+/g, '') === 'inforgraphic') {
              cat = 'Infographic';
            }
            currentItem.category = cat;
          }
          else if (key === 'chương/ chủ đề') currentItem.chapter = value;
          else if (key === 'lớp') currentItem.grade = parseInt(value, 10);
          else if (key === 'link') currentItem.link = value;
        }
      }
    });

    if (currentItem && currentItem.title && currentItem.link) {
      parsedItems.push(currentItem);
    }

    console.log(`✅ Parsed ${parsedItems.length} valid items from file.`);

    // 1. CLEAR OLD SYSTEM LESSONS & CHALLENGES (where teacher_id is null)
    console.log('--- Clearing old system content ---');
    const { error: delLessonsErr } = await supabase
      .from('lessons')
      .delete()
      .is('teacher_id', null);
    if (delLessonsErr) console.warn('⚠️ Error deleting old system lessons:', delLessonsErr.message);
    else console.log('✓ Cleared old system lessons');

    const { error: delChallengesErr } = await supabase
      .from('challenges')
      .delete()
      .is('teacher_id', null);
    if (delChallengesErr) console.warn('⚠️ Error deleting old system challenges:', delChallengesErr.message);
    else console.log('✓ Cleared old system challenges');

    // 2. GROUP AND INSERT LESSONS (Bài giảng & Infographic)
    const lessonsToInsert = [];
    const lessonsData = parsedItems.filter(item => 
      item.category === 'Bài giảng' || item.category === 'Infographic'
    );

    // Group lessons by grade and then by unique chapter to assign chapter_id and lesson_id
    const gradeChapters = {}; // grade -> array of unique chapter strings
    lessonsData.forEach(item => {
      const g = item.grade || 6;
      const ch = item.chapter || 'Chung';
      if (!gradeChapters[g]) gradeChapters[g] = [];
      if (!gradeChapters[g].includes(ch)) {
        gradeChapters[g].push(ch);
      }
    });

    // We want to count lesson index within chapter
    const chapterLessonCount = {}; // "grade-chapter" -> count

    lessonsData.forEach(item => {
      const g = item.grade || 6;
      const ch = item.chapter || 'Chung';
      
      const chapterIdx = gradeChapters[g].indexOf(ch) + 1;
      const key = `${g}-${ch}`;
      if (chapterLessonCount[key] === undefined) {
        chapterLessonCount[key] = 0;
      }
      chapterLessonCount[key]++;
      const lessonIdx = chapterLessonCount[key];

      lessonsToInsert.push({
        class_id: g,
        chapter_id: chapterIdx,
        lesson_id: lessonIdx,
        title: item.title,
        description: `Chương/ chủ đề: ${ch} - Thể loại: ${item.category}`,
        level: 'Beginner',
        theory: item.link, // Store link in theory
        content: item.link, // Store link in content
        game: {},
        sort_order: (g * 1000) + (chapterIdx * 100) + lessonIdx
      });
    });

    console.log(`Inserting ${lessonsToInsert.length} system lessons...`);
    for (let i = 0; i < lessonsToInsert.length; i += 50) {
      const batch = lessonsToInsert.slice(i, i + 50);
      const { error } = await supabase.from('lessons').insert(batch);
      if (error) {
        console.error('❌ Error inserting lessons batch:', error.message);
      }
    }

    // 3. INSERT CHALLENGES (Bài tập, Đề cương, Đề thi)
    const challengesToInsert = [];
    const challengesData = parsedItems.filter(item => 
      item.category === 'Bài tập' || item.category === 'Đề cương' || item.category === 'Đề thi'
    );

    challengesData.forEach((item, index) => {
      const g = item.grade || 6;
      const ch = item.chapter || 'Chung';
      const challengeId = 2000 + index;

      let icon = '✍️';
      let difficultyColor = 'from-blue-500 to-cyan-600';
      if (item.category === 'Đề thi') {
        icon = '📝';
        difficultyColor = 'from-red-500 to-rose-600';
      } else if (item.category === 'Đề cương') {
        icon = '📋';
        difficultyColor = 'from-amber-500 to-orange-600';
      }

      challengesToInsert.push({
        challenge_id: challengeId,
        name: item.title,
        description: `Chương/ chủ đề: ${ch} - Thể loại: ${item.category}`,
        icon: icon,
        difficulty: 'Trung bình',
        difficulty_level: 'medium',
        difficulty_color: difficultyColor,
        category: 'game', // to show in "Bài tập" tab (category != experiment)
        grade: g,
        time: '45 phút',
        points: 100,
        status: 'available',
        link: item.link,
        features: []
      });
    });

    // 4. SEED SYSTEM EXPERIMENTS (keep the default virtual simulations)
    console.log('--- Seeding system experiments (simulations) ---');
    const gamesModule = await import('./src/areas/Vatly/data/physicsGames.js');
    const physicsGames = gamesModule.physicsGames;

    physicsGames.forEach((game, index) => {
      let difficultyText = 'Dễ';
      if (game.difficulty === 'medium') difficultyText = 'Trung bình';
      if (game.difficulty === 'hard') difficultyText = 'Khó';

      const idMatch = game.id.match(/\d+/);
      const gradeNum = game.grade || (idMatch ? idMatch[0] : 0);
      const challengeId = 5000 + (parseInt(gradeNum) * 100) + (index + 1);

      challengesToInsert.push({
        challenge_id: challengeId,
        name: game.title,
        description: game.description,
        icon: game.icon || '🎯',
        difficulty: difficultyText,
        difficulty_level: game.difficulty || 'easy',
        difficulty_color: `from-violet-500 to-purple-600`, // Matching system theme
        category: 'experiment', // Classified as Thí nghiệm (experiments count will now be > 0!)
        grade: game.grade || 8,
        time: game.estimatedTime || '15-20 phút',
        points: 200,
        status: 'available',
        link: `/game/${game.slug}`,
        features: game.topics || []
      });
    });

    console.log(`Inserting ${challengesToInsert.length} system challenges (Exercises & Experiments)...`);
    const { error: insChallengesErr } = await supabase.from('challenges').insert(challengesToInsert);
    if (insChallengesErr) {
      console.error('❌ Error inserting challenges:', insChallengesErr.message);
    } else {
      console.log(`✓ Inserted ${challengesToInsert.length} challenges successfully.`);
    }

    console.log('🚀 Synchronized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Sync failed:', err);
    process.exit(1);
  }
}

sync();
