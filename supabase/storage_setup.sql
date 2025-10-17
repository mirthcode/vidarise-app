-- Storage Setup for Profile Pictures and Resumes
-- Run this in Supabase SQL Editor after running the migration

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-pictures', 'profile-pictures', true),
  ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for profile-pictures bucket (public read, authenticated users can upload their own)
CREATE POLICY "Public can view profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload own profile picture"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own profile picture"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own profile picture"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS Policies for resumes bucket (private, only owner and admins can view)
CREATE POLICY "Users can view own resume"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Users can upload own resume"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own resume"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own resume"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
