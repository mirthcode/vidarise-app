-- Migration: Add ready_for_matching field to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ready_for_matching BOOLEAN DEFAULT false;

-- Create index for better performance when querying ready users
CREATE INDEX IF NOT EXISTS idx_profiles_ready_for_matching ON profiles(ready_for_matching);

-- Add comment for documentation
COMMENT ON COLUMN profiles.ready_for_matching IS 'Indicates whether the user has marked themselves as ready to be matched with mentors/students';
