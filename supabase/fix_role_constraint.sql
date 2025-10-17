-- Fix role constraint on profiles table

-- First, check if the user_role enum exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'student');
    END IF;
END $$;

-- Drop the existing check constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Update the role column to use the enum type if it isn't already
DO $$
BEGIN
    -- Check if the column type needs to be changed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'role'
        AND data_type != 'USER-DEFINED'
    ) THEN
        -- If role column is not using the enum, alter it
        ALTER TABLE profiles
        ALTER COLUMN role TYPE user_role
        USING role::text::user_role;
    END IF;
END $$;

-- Recreate the check constraint for military_branch requirement
ALTER TABLE profiles ADD CONSTRAINT profiles_military_check
CHECK (
  (role = 'admin') OR
  (role IN ('mentor', 'student') AND military_branch IS NOT NULL)
);
