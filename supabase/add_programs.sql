-- Add Programs Support to VidaRise
-- This migration adds multi-program/multi-organization support

-- Programs table (cohorts, organizations, departments)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization TEXT, -- e.g., "Emory MBV"
  cohort_number TEXT, -- e.g., "Cohort II"

  -- Admin/creator
  created_by UUID REFERENCES profiles(id),

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  auto_approve_members BOOLEAN DEFAULT FALSE, -- If false, admin must approve
  max_mentors INTEGER,
  max_students INTEGER,

  -- Dates
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(name, organization)
);

-- Program memberships (links users to programs)
CREATE TABLE program_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Approval status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(program_id, user_id)
);

-- Update profiles table to remove military requirement for admins
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_military_check CHECK (
    (role = 'admin') OR
    (role IN ('mentor', 'student') AND military_branch IS NOT NULL)
  );

-- Update matches to be program-specific
ALTER TABLE matches
  ADD COLUMN program_id UUID REFERENCES programs(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_programs_active ON programs(is_active);
CREATE INDEX idx_programs_organization ON programs(organization);
CREATE INDEX idx_program_memberships_program ON program_memberships(program_id);
CREATE INDEX idx_program_memberships_user ON program_memberships(user_id);
CREATE INDEX idx_program_memberships_status ON program_memberships(status);
CREATE INDEX idx_matches_program ON matches(program_id);

-- Add updated_at trigger for new tables
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_memberships_updated_at BEFORE UPDATE ON program_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_memberships ENABLE ROW LEVEL SECURITY;

-- Programs policies
-- Anyone can view active programs
CREATE POLICY "Anyone can view active programs"
  ON programs FOR SELECT
  USING (is_active = TRUE);

-- Admins can create programs
CREATE POLICY "Admins can create programs"
  ON programs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Program creators and admins can update programs
CREATE POLICY "Admins can update programs"
  ON programs FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Program memberships policies
-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON program_memberships FOR SELECT
  USING (user_id = auth.uid());

-- Program admins can view all memberships in their programs
CREATE POLICY "Program admins can view program memberships"
  ON program_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = program_id AND (
        p.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Users can create membership requests
CREATE POLICY "Users can request program membership"
  ON program_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Program admins can approve/update memberships
CREATE POLICY "Program admins can update memberships"
  ON program_memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = program_id AND (
        p.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Update existing RLS policies to be program-aware
-- Drop old mentor/student viewing policies
DROP POLICY IF EXISTS "Students can view mentors" ON profiles;
DROP POLICY IF EXISTS "Mentors can view matched students" ON profiles;

-- New policy: Users in same program can see each other
CREATE POLICY "Program members can view each other"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_memberships pm1
      JOIN program_memberships pm2 ON pm1.program_id = pm2.program_id
      WHERE pm1.user_id = auth.uid()
        AND pm2.user_id = profiles.id
        AND pm1.status = 'approved'
        AND pm2.status = 'approved'
    )
  );

-- Helper function to check if user is program admin
CREATE OR REPLACE FUNCTION is_program_admin(user_id UUID, prog_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM programs p
    JOIN profiles prof ON prof.id = user_id
    WHERE p.id = prog_id
      AND (p.created_by = user_id OR prof.role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON TABLE programs IS 'Multi-tenant programs/cohorts (e.g., MBV Cohort II, Company X Mentorship)';
COMMENT ON TABLE program_memberships IS 'Links users to programs they belong to';
COMMENT ON COLUMN programs.auto_approve_members IS 'If true, users are automatically approved when they join';
