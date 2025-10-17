-- Clear Test Data from VidaRise
-- WARNING: This will delete ALL user data. Use with caution!

-- Delete in order to respect foreign key constraints

-- 1. Delete debriefs
DELETE FROM debriefs;

-- 2. Delete meetings
DELETE FROM meetings;

-- 3. Delete matches
DELETE FROM matches;

-- 4. Delete program memberships
DELETE FROM program_memberships;

-- 5. Delete programs
DELETE FROM programs;

-- 6. Delete admins
DELETE FROM admins;

-- 7. Delete profiles
DELETE FROM profiles;

-- 8. Delete auth users (this cascades to profiles due to FK)
-- Note: You need to be a Supabase admin to delete auth.users
-- If you get permission errors, delete users manually through the Supabase Dashboard:
-- Go to: Authentication > Users > Click the three dots on each user > Delete user

-- Optional: Reset sequences if you want IDs to start from 1 again
-- ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;

-- Confirmation message
DO $$
BEGIN
  RAISE NOTICE 'Test data cleared successfully!';
  RAISE NOTICE 'Note: Auth users must be deleted manually from Supabase Dashboard if SQL deletion fails';
END $$;
