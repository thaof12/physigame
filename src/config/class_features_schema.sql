-- =====================================================
-- Class Features Database Schema Update for PhysiGame
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Create CLASS_ANNOUNCEMENTS table
CREATE TABLE IF NOT EXISTS public.class_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for class_announcements
ALTER TABLE public.class_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read announcements" ON public.class_announcements;
DROP POLICY IF EXISTS "Teachers can manage announcements" ON public.class_announcements;

CREATE POLICY "Everyone can read announcements" ON public.class_announcements FOR SELECT USING (true);
CREATE POLICY "Teachers can manage announcements" ON public.class_announcements FOR ALL USING (
  auth.uid() IN (SELECT teacher_id FROM public.classes WHERE id = class_id)
);

-- 2. Create CLASS_ASSIGNMENTS table
CREATE TABLE IF NOT EXISTS public.class_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('lesson', 'challenge', 'custom')),
  resource_id TEXT, -- lesson_id or challenge_id
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for class_assignments
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read assignments" ON public.class_assignments;
DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.class_assignments;

CREATE POLICY "Everyone can read assignments" ON public.class_assignments FOR SELECT USING (true);
CREATE POLICY "Teachers can manage assignments" ON public.class_assignments FOR ALL USING (
  auth.uid() IN (SELECT teacher_id FROM public.classes WHERE id = class_id)
);

-- 3. Create CLASS_DISCUSSIONS table
CREATE TABLE IF NOT EXISTS public.class_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for class_discussions
ALTER TABLE public.class_discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read discussions" ON public.class_discussions;
DROP POLICY IF EXISTS "Users can post discussions" ON public.class_discussions;

CREATE POLICY "Everyone can read discussions" ON public.class_discussions FOR SELECT USING (true);
CREATE POLICY "Users can post discussions" ON public.class_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create CLASS_MEETINGS table
CREATE TABLE IF NOT EXISTS public.class_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_link TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for class_meetings
ALTER TABLE public.class_meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read meetings" ON public.class_meetings;
DROP POLICY IF EXISTS "Teachers can manage meetings" ON public.class_meetings;

CREATE POLICY "Everyone can read meetings" ON public.class_meetings FOR SELECT USING (true);
CREATE POLICY "Teachers can manage meetings" ON public.class_meetings FOR ALL USING (
  auth.uid() IN (SELECT teacher_id FROM public.classes WHERE id = class_id)
);

-- 5. Create TEACHER_NOTIFICATIONS table
CREATE TABLE IF NOT EXISTS public.teacher_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL, -- references users(id)
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for teacher_notifications
ALTER TABLE public.teacher_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read/manage notifications" ON public.teacher_notifications;
CREATE POLICY "Everyone can read/manage notifications" ON public.teacher_notifications FOR ALL USING (true);
