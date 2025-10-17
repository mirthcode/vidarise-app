-- Add undergrad_graduation_year column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS undergrad_graduation_year INTEGER;

-- Add comment to describe the column
COMMENT ON COLUMN profiles.undergrad_graduation_year IS 'Year the user graduated from undergraduate university';
