-- BIT Sindri ERP Upgrade: Migration V2
-- This script adds batch/year/semester tracking and sets up relational attendance records.

-- 1. Expand sclasses table
ALTER TABLE sclasses 
ADD COLUMN IF NOT EXISTS batch TEXT,
ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1;

-- 2. Create Relational Attendance Records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    sclass_id UUID NOT NULL REFERENCES sclasses(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    session_index INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add Indexes for Heatmap Performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_sclass_date ON attendance_records(sclass_id, date);

-- 4. Enable RLS (Row Level Security) - Optional but recommended
-- ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
