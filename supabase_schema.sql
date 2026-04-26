-- =====================================================
-- PhysiGame Database Schema for Supabase (PostgreSQL)
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS table (public profile, linked to auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  teacher_status TEXT DEFAULT NULL CHECK (teacher_status IN ('pending', 'verified', 'rejected', NULL)),
  teacher_profile JSONB DEFAULT '{}',
  profile JSONB DEFAULT '{}',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  programs JSONB DEFAULT '[]',
  physics_game_progress JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. BATTLES table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'playing', 'finished', 'cancelled')),
  game_type TEXT DEFAULT 'physics' CHECK (game_type IN ('random', 'physics', 'chemistry')),
  game_mode TEXT DEFAULT 'mixed' CHECK (game_mode IN ('quiz', 'challenge', 'mixed')),
  grade TEXT DEFAULT 'all',
  topic TEXT DEFAULT 'all',
  difficulty TEXT DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
  players JSONB DEFAULT '[]',
  rounds JSONB DEFAULT '[]',
  questions JSONB DEFAULT '[]',
  current_question_index INTEGER DEFAULT 0,
  current_round_index INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10,
  total_rounds INTEGER DEFAULT 10,
  time_per_question INTEGER DEFAULT 30,
  winner JSONB DEFAULT NULL,
  rewards JSONB DEFAULT '{"winnerXP": 100, "loserXP": 25, "winnerCoins": 50, "loserCoins": 10}',
  started_at TIMESTAMPTZ DEFAULT NULL,
  finished_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_battles_status ON public.battles(status, created_at DESC);
CREATE INDEX idx_battles_room_id ON public.battles(room_id);

-- =====================================================
-- 3. LESSONS table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id INTEGER,
  chapter_id INTEGER,
  lesson_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  theory TEXT,
  content TEXT,
  game JSONB DEFAULT '{}',
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_class_chapter ON public.lessons(class_id, chapter_id, sort_order);

-- =====================================================
-- 4. CHALLENGES table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Dễ', 'Trung bình', 'Khó', 'Rất khó')),
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  difficulty_color TEXT NOT NULL,
  category TEXT DEFAULT 'experiment' CHECK (category IN ('molecule', 'experiment', 'electrochemistry', 'solution', 'reaction', 'structure', 'game')),
  grade INTEGER DEFAULT 8 CHECK (grade IN (8, 9, 10, 11, 12)),
  time TEXT NOT NULL,
  points INTEGER NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'coming-soon', 'locked')),
  link TEXT,
  features JSONB DEFAULT '[]',
  prerequisite JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. QUEST PROGRESS table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  daily_quests JSONB DEFAULT '[]',
  last_daily_reset TIMESTAMPTZ DEFAULT NOW(),
  weekly_quests JSONB DEFAULT '[]',
  last_weekly_reset TIMESTAMPTZ DEFAULT NOW(),
  achievements JSONB DEFAULT '[]',
  login_streak JSONB DEFAULT '{"current": 0, "longest": 0, "lastLoginDate": null}',
  stats JSONB DEFAULT '{"totalQuestsCompleted": 0, "totalRewardsClaimed": 0, "totalXPFromQuests": 0}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_quest_progress_user ON public.quest_progress(user_id);

CREATE TRIGGER quest_progress_updated_at
  BEFORE UPDATE ON public.quest_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. GAME RESULTS table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  game_id TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade IN (6, 7, 8, 9, 10, 11, 12)),
  chapter INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  stars INTEGER DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  completed BOOLEAN DEFAULT FALSE,
  play_time INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  details JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_game_results_user_game ON public.game_results(user_id, game_id);
CREATE INDEX idx_game_results_user_grade ON public.game_results(user_id, grade);
CREATE INDEX idx_game_results_email_grade ON public.game_results(user_email, grade, chapter);

CREATE TRIGGER game_results_updated_at
  BEFORE UPDATE ON public.game_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. PHYSICS GAME PROGRESS table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.physics_game_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade IN (6, 7, 8, 9, 10, 11, 12)),
  completed_games JSONB DEFAULT '[]',
  current_game TEXT DEFAULT NULL,
  total_score INTEGER DEFAULT 0,
  total_trophies INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_pgp_user_grade ON public.physics_game_progress(user_id, grade);
CREATE UNIQUE INDEX idx_pgp_email_grade ON public.physics_game_progress(user_email, grade);

CREATE TRIGGER pgp_updated_at
  BEFORE UPDATE ON public.physics_game_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. USER PROGRESS table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  learning_progress JSONB DEFAULT '[]',
  game_progress JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. LESSON COMPLETIONS table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  class_id INTEGER NOT NULL,
  chapter_id INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  quiz_answers JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_lc_user_lesson ON public.lesson_completions(user_id, lesson_id);

-- =====================================================
-- 10. CHAT HISTORY table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_chat_histories_user_conversation ON public.chat_histories(user_id, conversation_id);

ALTER TABLE public.chat_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_histories_select_own"
  ON public.chat_histories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_histories_insert_own"
  ON public.chat_histories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_histories_update_own"
  ON public.chat_histories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER chat_histories_updated_at
  BEFORE UPDATE ON public.chat_histories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RPC Functions (for complex operations)
-- =====================================================

-- Increment user XP atomically
CREATE OR REPLACE FUNCTION increment_user_xp(user_uuid UUID, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET xp = xp + xp_amount,
      level = GREATEST(1, (xp + xp_amount) / 100 + 1)
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment user stats (for battle results)
CREATE OR REPLACE FUNCTION increment_user_stats(
  user_uuid UUID,
  xp_val INTEGER DEFAULT 0,
  battles_val INTEGER DEFAULT 0,
  wins_val INTEGER DEFAULT 0,
  losses_val INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET xp = xp + xp_val,
      level = GREATEST(1, (xp + xp_val) / 100 + 1)
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Battle leaderboard aggregation
CREATE OR REPLACE FUNCTION get_battle_leaderboard(lim INTEGER DEFAULT 10)
RETURNS TABLE (
  player_id TEXT,
  display_name TEXT,
  avatar TEXT,
  total_games BIGINT,
  total_score BIGINT,
  total_correct BIGINT,
  wins BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH player_stats AS (
    SELECT
      p->>'firebaseUid' AS pid,
      p->>'displayName' AS dname,
      p->>'avatar' AS av,
      COALESCE((p->>'score')::INTEGER, 0) AS score,
      COALESCE((p->>'correctAnswers')::INTEGER, 0) AS correct
    FROM public.battles b,
    jsonb_array_elements(b.players) AS p
    WHERE b.status = 'finished'
  ),
  aggregated AS (
    SELECT
      pid,
      MAX(dname) AS display_name,
      MAX(av) AS avatar,
      COUNT(*) AS total_games,
      SUM(score)::BIGINT AS total_score,
      SUM(correct)::BIGINT AS total_correct
    FROM player_stats
    GROUP BY pid
    ORDER BY total_score DESC
    LIMIT lim
  )
  SELECT
    a.pid AS player_id,
    a.display_name,
    a.avatar,
    a.total_games,
    a.total_score,
    a.total_correct,
    (SELECT COUNT(*) FROM public.battles b2 WHERE b2.status = 'finished' AND b2.winner->>'firebaseUid' = a.pid)::BIGINT AS wins
  FROM aggregated a;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physics_game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- Users: can read all profiles, update own
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Battles: all authenticated users can read/write
CREATE POLICY "Authenticated users can manage battles" ON public.battles FOR ALL USING (auth.role() = 'authenticated');

-- Lessons: everyone can read
CREATE POLICY "Everyone can read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage lessons" ON public.lessons FOR ALL USING (auth.role() = 'authenticated');

-- Challenges: everyone can read
CREATE POLICY "Everyone can read challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage challenges" ON public.challenges FOR ALL USING (auth.role() = 'authenticated');

-- Quest progress: users can manage own
CREATE POLICY "Users can manage own quests" ON public.quest_progress FOR ALL USING (auth.uid() = user_id);

-- Game results: users can manage own
CREATE POLICY "Users can manage own game results" ON public.game_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all game results" ON public.game_results FOR SELECT USING (true);

-- Physics game progress: users can manage own
CREATE POLICY "Users can manage own physics progress" ON public.physics_game_progress FOR ALL USING (auth.uid() = user_id);

-- User progress: users can manage own
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- Lesson completions: users can manage own
CREATE POLICY "Users can manage own completions" ON public.lesson_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all completions" ON public.lesson_completions FOR SELECT USING (true);
