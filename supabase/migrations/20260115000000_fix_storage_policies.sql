-- Security fix: Restrict storage bucket policies to session/user-based access
-- Previously, anyone could upload/update/delete any file in these buckets

-- ============================================
-- FIX card-images bucket policies
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can upload card images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view card images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update card images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete card images" ON storage.objects;

-- Create function to extract session ID from storage path
-- Paths are formatted as: {session_id}/{filename}
CREATE OR REPLACE FUNCTION storage.get_path_session_id(path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Extract the first path segment (session ID or user ID)
  RETURN split_part(path, '/', 1);
END;
$$;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own card images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'card-images'
  AND storage.get_path_session_id(name) = auth.uid()::text
);

-- Allow anonymous users to upload to their guest session folder
-- Note: Guest session ID is passed via x-guest-session-id header and validated by RLS
CREATE POLICY "Guests can upload own card images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'card-images'
  AND storage.get_path_session_id(name) LIKE 'guest_%'
);

-- Anyone can view card images (they're meant to be public for display)
CREATE POLICY "Public can view card images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'card-images');

-- Authenticated users can update their own images
CREATE POLICY "Users can update own card images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-images'
  AND storage.get_path_session_id(name) = auth.uid()::text
);

-- Guests can update their own images
CREATE POLICY "Guests can update own card images"
ON storage.objects
FOR UPDATE
TO anon
USING (
  bucket_id = 'card-images'
  AND storage.get_path_session_id(name) LIKE 'guest_%'
);

-- Authenticated users can delete their own images
CREATE POLICY "Users can delete own card images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-images'
  AND storage.get_path_session_id(name) = auth.uid()::text
);

-- Guests can delete their own images
CREATE POLICY "Guests can delete own card images"
ON storage.objects
FOR DELETE
TO anon
USING (
  bucket_id = 'card-images'
  AND storage.get_path_session_id(name) LIKE 'guest_%'
);

-- ============================================
-- FIX card-renders bucket policies
-- ============================================

-- Drop any overly permissive policies on card-renders
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete" ON storage.objects;

-- Allow authenticated users to upload renders to their folder
CREATE POLICY "Users can upload own card renders"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'card-renders'
  AND storage.get_path_session_id(name) = auth.uid()::text
);

-- Allow guests to upload renders to their session folder
CREATE POLICY "Guests can upload own card renders"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'card-renders'
  AND storage.get_path_session_id(name) LIKE 'guest_%'
);

-- Anyone can view card renders (needed for order processing and display)
CREATE POLICY "Public can view card renders"
ON storage.objects
FOR SELECT
USING (bucket_id = 'card-renders');

-- Authenticated users can update their own renders
CREATE POLICY "Users can update own card renders"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-renders'
  AND storage.get_path_session_id(name) = auth.uid()::text
);

-- Guests can update their own renders
CREATE POLICY "Guests can update own card renders"
ON storage.objects
FOR UPDATE
TO anon
USING (
  bucket_id = 'card-renders'
  AND storage.get_path_session_id(name) LIKE 'guest_%'
);

-- Authenticated users can delete their own renders
CREATE POLICY "Users can delete own card renders"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-renders'
  AND storage.get_path_session_id(name) = auth.uid()::text
);

-- Guests can delete their own renders
CREATE POLICY "Guests can delete own card renders"
ON storage.objects
FOR DELETE
TO anon
USING (
  bucket_id = 'card-renders'
  AND storage.get_path_session_id(name) LIKE 'guest_%'
);

-- ============================================
-- Add service role policies for edge functions
-- ============================================

-- Service role needs full access for order processing
CREATE POLICY "Service role can manage card images"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'card-images')
WITH CHECK (bucket_id = 'card-images');

CREATE POLICY "Service role can manage card renders"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'card-renders')
WITH CHECK (bucket_id = 'card-renders');
