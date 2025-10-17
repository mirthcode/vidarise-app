-- VidaRise Database Schema
-- Run this in your Supabase SQL Editor

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'student');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'declined', 'active', 'completed');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,

  -- Basic info
  full_name TEXT,
  phone TEXT,
  location TEXT,
  photo_url TEXT,
  resume_url TEXT,
  bio TEXT,

  -- Military background
  military_branch TEXT,
  military_rank TEXT,
  years_of_service INTEGER,
  military_specialty TEXT,

  -- Professional info
  current_company TEXT,
  job_title TEXT,
  current_industry TEXT,
  previous_locations TEXT[], -- Array of cities/regions where they've worked
  years_of_experience INTEGER,

  -- For students
  career_goals TEXT,
  interested_industries TEXT[],
  interested_functions TEXT[],
  what_i_want_from_mentoring TEXT,

  -- For mentors
  expertise_areas TEXT[],
  mentoring_capacity INTEGER DEFAULT 3,
  can_mentor_in TEXT[], -- Topics/areas they can mentor in

  -- Metadata
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure military info is captured
  CHECK (
    (role = 'admin') OR
    (role IN ('mentor', 'student') AND military_branch IS NOT NULL)
  )
);

-- Admin users table
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  can_manage_users BOOLEAN DEFAULT TRUE,
  can_create_matches BOOLEAN DEFAULT TRUE,
  can_view_reports BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status match_status DEFAULT 'pending',

  -- Matching metadata
  matched_by UUID REFERENCES profiles(id), -- Admin who created the match
  match_reason TEXT, -- Why they were matched

  -- Acceptance
  mentor_accepted_at TIMESTAMPTZ,
  student_accepted_at TIMESTAMPTZ,

  -- Lifecycle
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (mentor_id != student_id),
  UNIQUE(mentor_id, student_id)
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,

  -- Meeting details
  title TEXT NOT NULL,
  meeting_number INTEGER NOT NULL, -- 1st, 2nd, 3rd meeting, etc.
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT, -- Could be "Zoom", "In-person at X", etc.
  meeting_link TEXT,

  -- Status
  status meeting_status DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Calendar integration (for future)
  google_event_id TEXT,
  ms_event_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Debriefs/Reflections table
CREATE TABLE debriefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Debrief content
  what_went_well TEXT,
  challenges_discussed TEXT,
  key_takeaways TEXT,
  action_items TEXT,
  topics_covered TEXT[],

  -- Ratings (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  mentor_preparedness INTEGER CHECK (mentor_preparedness BETWEEN 1 AND 5),
  conversation_depth INTEGER CHECK (conversation_depth BETWEEN 1 AND 5),

  -- Follow-up
  next_steps TEXT,
  wants_another_meeting BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One debrief per person per meeting
  UNIQUE(meeting_id, submitted_by)
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_matches_mentor ON matches(mentor_id);
CREATE INDEX idx_matches_student ON matches(student_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_meetings_match ON meetings(match_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_debriefs_meeting ON debriefs(meeting_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE debriefs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Students can see mentor profiles
CREATE POLICY "Students can view mentors"
  ON profiles FOR SELECT
  USING (
    role = 'mentor' AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'student'
    )
  );

-- Mentors can see student profiles they're matched with
CREATE POLICY "Mentors can view matched students"
  ON profiles FOR SELECT
  USING (
    role = 'student' AND
    EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.mentor_id = auth.uid() AND m.student_id = id)
    )
  );

-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
    )
  );

-- Matches policies
-- Users can view their own matches
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  USING (
    auth.uid() = mentor_id OR
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Admins can create matches
CREATE POLICY "Admins can create matches"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Admins can update matches
CREATE POLICY "Admins can update matches"
  ON matches FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Users can update their own match status (accept/decline)
CREATE POLICY "Users can update own match status"
  ON matches FOR UPDATE
  USING (
    auth.uid() = mentor_id OR auth.uid() = student_id
  );

-- Meetings policies
-- Users in a match can view meetings
CREATE POLICY "Match participants can view meetings"
  ON meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND (m.mentor_id = auth.uid() OR m.student_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Match participants can create meetings
CREATE POLICY "Match participants can create meetings"
  ON meetings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND (m.mentor_id = auth.uid() OR m.student_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Match participants can update meetings
CREATE POLICY "Match participants can update meetings"
  ON meetings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND (m.mentor_id = auth.uid() OR m.student_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Debriefs policies
-- Users can view debriefs for their meetings
CREATE POLICY "Users can view meeting debriefs"
  ON debriefs FOR SELECT
  USING (
    submitted_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM meetings mt
      JOIN matches m ON m.id = mt.match_id
      WHERE mt.id = meeting_id AND (m.mentor_id = auth.uid() OR m.student_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Users can create their own debriefs
CREATE POLICY "Users can create own debriefs"
  ON debriefs FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM meetings mt
      JOIN matches m ON m.id = mt.match_id
      WHERE mt.id = meeting_id AND (m.mentor_id = auth.uid() OR m.student_id = auth.uid())
    )
  );

-- Users can update their own debriefs
CREATE POLICY "Users can update own debriefs"
  ON debriefs FOR UPDATE
  USING (submitted_by = auth.uid());

-- Admins table policies
CREATE POLICY "Admins can view admins table"
  ON admins FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admins WHERE admins.user_id = $1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to automatically set profile_completed when all required fields are filled
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'mentor' THEN
    NEW.profile_completed := (
      NEW.full_name IS NOT NULL AND
      NEW.military_branch IS NOT NULL AND
      NEW.job_title IS NOT NULL AND
      NEW.expertise_areas IS NOT NULL AND
      array_length(NEW.expertise_areas, 1) > 0
    );
  ELSIF NEW.role = 'student' THEN
    NEW.profile_completed := (
      NEW.full_name IS NOT NULL AND
      NEW.military_branch IS NOT NULL AND
      NEW.career_goals IS NOT NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completion();

-- Insert some military branches for reference
COMMENT ON COLUMN profiles.military_branch IS 'e.g., Army, Navy, Air Force, Marines, Coast Guard, Space Force, National Guard';
COMMENT ON COLUMN profiles.military_rank IS 'e.g., E-4, O-3, etc. or full rank name';
