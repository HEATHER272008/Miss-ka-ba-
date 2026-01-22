-- Add new fields to profiles table (excluding profile_picture_url which already exists)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS parent_guardian_name text,
ADD COLUMN IF NOT EXISTS birthday date,
ADD COLUMN IF NOT EXISTS adviser_name text,
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false;

-- Add attendance status enum
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'half_day');

-- Add status column to attendance table
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS status attendance_status DEFAULT 'present';

-- Update attendance table comment
COMMENT ON COLUMN public.attendance.status IS 'Present (Green), Late (Red: 8:45 AM - 12:00 PM), Absent (Red), Half Day (Yellow)';
