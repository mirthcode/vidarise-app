-- Migration: Add can_browse_mentors field to profiles table
-- This is controlled by admins, separate from ready_for_matching

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS can_browse_mentors BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_can_browse_mentors ON profiles(can_browse_mentors);

-- Add comment for documentation
COMMENT ON COLUMN profiles.can_browse_mentors IS 'Admin-controlled field that determines if a student can browse and view mentor profiles';
