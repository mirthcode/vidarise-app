-- Migration: Add detailed profile fields based on requirements
-- Run this in Supabase SQL Editor

-- First, add all new columns to profiles table

-- General Info additions
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS school_email TEXT,
ADD COLUMN IF NOT EXISTS work_email TEXT,
ADD COLUMN IF NOT EXISTS personal_email TEXT,
ADD COLUMN IF NOT EXISTS primary_email TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS hometown TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS has_kids BOOLEAN,
ADD COLUMN IF NOT EXISTS hobbies TEXT,
ADD COLUMN IF NOT EXISTS interesting_fact TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Education Info
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS undergrad_school TEXT,
ADD COLUMN IF NOT EXISTS undergrad_major TEXT,
ADD COLUMN IF NOT EXISTS masters_school TEXT,
ADD COLUMN IF NOT EXISTS masters_degree TEXT,
ADD COLUMN IF NOT EXISTS additional_degrees JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS professional_certifications TEXT[];

-- Enhanced Military Service
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS military_status TEXT,
ADD COLUMN IF NOT EXISTS mos TEXT,
ADD COLUMN IF NOT EXISTS mos_description TEXT,
ADD COLUMN IF NOT EXISTS ets_eas_date DATE,
ADD COLUMN IF NOT EXISTS duty_stations TEXT[],
ADD COLUMN IF NOT EXISTS units TEXT[],
ADD COLUMN IF NOT EXISTS deployments TEXT[];

-- Current Employment (already have current_company and job_title)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS years_professional_experience INTEGER;

-- Student-specific fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS statement_of_purpose TEXT,
ADD COLUMN IF NOT EXISTS looking_to_change_careers TEXT,
ADD COLUMN IF NOT EXISTS desired_industries_ranked TEXT[],
ADD COLUMN IF NOT EXISTS example_companies TEXT[],
ADD COLUMN IF NOT EXISTS example_roles TEXT[];

-- Mentor-specific fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mbv_cohort_i_mentor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mbv_cohort_i_students_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mbv_cohort_ii_mentor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mbv_cohort_ii_students_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cities_with_experience TEXT[],
ADD COLUMN IF NOT EXISTS industry_experience_ranked TEXT[],
ADD COLUMN IF NOT EXISTS executive_roles TEXT[],
ADD COLUMN IF NOT EXISTS companies_founded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS companies_acquired INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS companies_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_side_consulting BOOLEAN DEFAULT false;

-- Program tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS program TEXT,
ADD COLUMN IF NOT EXISTS program_status TEXT,
ADD COLUMN IF NOT EXISTS program_status_updated_at TIMESTAMPTZ;

-- Create a programs table for managing cohorts
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert MBV Cohort II program
INSERT INTO programs (name, description, start_date, end_date, active)
VALUES (
  'MBV Cohort II',
  'MBV Mentorship Program for Fall 2025 cohort, continuing through graduation in May 2026',
  '2025-08-01',
  '2026-05-31',
  true
)
ON CONFLICT (name) DO NOTHING;

-- Create program_enrollments table
CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_program ON profiles(program);
CREATE INDEX IF NOT EXISTS idx_profiles_program_status ON profiles(program_status);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program ON program_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_user ON program_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_status ON program_enrollments(status);

-- Update the profile completion check to use full_name or first_name + last_name
DROP TRIGGER IF EXISTS check_profile_completion_trigger ON profiles;

CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'mentor' THEN
    NEW.profile_completed := (
      (NEW.full_name IS NOT NULL OR (NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL)) AND
      NEW.military_branch IS NOT NULL AND
      NEW.job_title IS NOT NULL AND
      NEW.statement_of_purpose IS NOT NULL AND
      length(NEW.statement_of_purpose) >= 100
    );
  ELSIF NEW.role = 'student' THEN
    NEW.profile_completed := (
      (NEW.full_name IS NOT NULL OR (NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL)) AND
      NEW.military_branch IS NOT NULL AND
      NEW.career_goals IS NOT NULL AND
      NEW.statement_of_purpose IS NOT NULL AND
      length(NEW.statement_of_purpose) >= 200
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completion();

-- Enable RLS on new tables
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for programs (all authenticated users can view)
CREATE POLICY "All users can view programs"
  ON programs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS policies for program_enrollments
CREATE POLICY "Users can view own enrollments"
  ON program_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON program_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage enrollments"
  ON program_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Add trigger for program_enrollments updated_at
CREATE TRIGGER update_program_enrollments_updated_at BEFORE UPDATE ON program_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
