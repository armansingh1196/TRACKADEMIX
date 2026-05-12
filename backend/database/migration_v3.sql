-- BIT Sindri ERP Upgrade: Migration V3
-- This script adds subject_type to subjects table to distinguish between Theory and Practical.

ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS subject_type text DEFAULT 'Theory' CHECK (subject_type IN ('Theory', 'Practical'));
