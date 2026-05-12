-- Run this in the Supabase SQL Editor

-- 1. Update exam_results table
ALTER TABLE public.exam_results
ADD COLUMN internal_marks integer,
ADD COLUMN external_marks integer,
ADD COLUMN total_marks integer;

-- 2. Create semester_results table
CREATE TABLE public.semester_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    semester integer NOT NULL,
    sgpa numeric(4,2),
    cgpa numeric(4,2),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, semester)
);

-- 3. Create study_logs table
CREATE TABLE public.study_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    date date NOT NULL,
    hours_logged numeric(4,2) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, date)
);
