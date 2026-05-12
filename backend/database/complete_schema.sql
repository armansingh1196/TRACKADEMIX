-- Trackademics Complete Database Schema
-- Run this in the Supabase SQL Editor to initialize the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. SClasses (Batches/Classes) Table
CREATE TABLE IF NOT EXISTS public.sclasses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sclass_name text UNIQUE NOT NULL,
    batch text,
    year integer DEFAULT 1,
    semester integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    roll_number text UNIQUE NOT NULL,
    email text UNIQUE,
    sclass_id uuid REFERENCES public.sclasses(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_name text NOT NULL,
    subject_code text UNIQUE NOT NULL,
    sclass_id uuid REFERENCES public.sclasses(id) ON DELETE CASCADE,
    teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
    subject_type text DEFAULT 'Theory' CHECK (subject_type IN ('Theory', 'Practical')),
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Exam Results Table
CREATE TABLE IF NOT EXISTS public.exam_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
    internal_marks integer,
    external_marks integer,
    total_marks integer,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(student_id, subject_id)
);

-- 7. Semester Results Table
CREATE TABLE IF NOT EXISTS public.semester_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    semester integer NOT NULL,
    sgpa numeric(4,2),
    cgpa numeric(4,2),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(student_id, semester)
);

-- 8. Study Logs Table
CREATE TABLE IF NOT EXISTS public.study_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    date date NOT NULL,
    hours_logged numeric(4,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(student_id, date)
);

-- 9. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
    sclass_id uuid REFERENCES public.sclasses(id) ON DELETE CASCADE,
    date date NOT NULL DEFAULT CURRENT_DATE,
    status text NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    session_index integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_sclass_date ON attendance_records(sclass_id, date);
