-- =====================================================
-- PhysiGame Database Schema Update for Teacher Portal
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Create CLASSES table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  lessons_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplicate errors
DROP POLICY IF EXISTS "Everyone can view classes" ON public.classes;
DROP POLICY IF EXISTS "Everyone can read classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage own classes" ON public.classes;

-- Create policies
CREATE POLICY "Everyone can read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Teachers can manage own classes" ON public.classes FOR ALL USING (auth.uid() = teacher_id);

-- Trigger for classes updated_at
DROP TRIGGER IF EXISTS classes_updated_at ON public.classes;
CREATE TRIGGER classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 2. Create CLASS_MEMBERS table
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Enable RLS for class_members
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read class_members" ON public.class_members;
DROP POLICY IF EXISTS "Students can join/leave classes" ON public.class_members;

CREATE POLICY "Everyone can read class_members" ON public.class_members FOR SELECT USING (true);
CREATE POLICY "Students can join/leave classes" ON public.class_members FOR ALL USING (auth.uid() = student_id);


-- 3. Add columns to LESSONS table if they do not exist
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft'));
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0;


-- 4. Add columns to CHALLENGES table if they do not exist
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS completions_count INTEGER DEFAULT 0;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS avg_score INTEGER DEFAULT 0;
