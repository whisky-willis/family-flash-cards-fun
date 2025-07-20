-- Migration: Add cards table for high-resolution image storage and printing
-- This enhances the existing card_collections approach with individual card storage

-- Create cards table for individual card storage with high-res images
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id TEXT, -- Track user session for cart management before auth
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to authenticated user
  name TEXT NOT NULL,
  relationship TEXT, -- Changed from whereTheyLive to relationship for clarity
  date_of_birth DATE,
  favorite_color TEXT,
  hobbies TEXT,
  fun_fact TEXT,
  photo_url TEXT, -- URL to high-res image in Supabase Storage
  photo_storage_path TEXT, -- Storage path for management
  image_position JSONB, -- Store positioning data {x, y, scale}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, -- Link to order when purchased
  is_draft BOOLEAN DEFAULT true -- Track if card is still in draft/editing state
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_user_session_id ON public.cards(user_session_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_order_id ON public.cards(order_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON public.cards(created_at);
CREATE INDEX IF NOT EXISTS idx_cards_is_draft ON public.cards(is_draft);

-- Enable Row Level Security
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cards
-- Users can view their own cards or cards from their session
CREATE POLICY "users_can_view_own_cards" ON public.cards
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (user_session_id IS NOT NULL AND user_id IS NULL) -- Allow viewing session cards
  );

-- Users can insert cards (both authenticated and session-based)
CREATE POLICY "users_can_insert_cards" ON public.cards
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
    (auth.uid() IS NULL AND user_session_id IS NOT NULL) -- Allow session-based cards
  );

-- Users can update their own cards
CREATE POLICY "users_can_update_own_cards" ON public.cards
  FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    (user_session_id IS NOT NULL AND user_id IS NULL)
  );

-- Users can delete their own cards
CREATE POLICY "users_can_delete_own_cards" ON public.cards
  FOR DELETE
  USING (
    user_id = auth.uid() OR 
    (user_session_id IS NOT NULL AND user_id IS NULL)
  );

-- Create updated_at trigger for cards
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for card images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-images',
  'card-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for card images
CREATE POLICY "Anyone can view card images" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

CREATE POLICY "Authenticated users can upload card images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'card-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own card images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'card-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own card images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'card-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to migrate session cards to authenticated user
CREATE OR REPLACE FUNCTION public.migrate_session_cards_to_user(
  session_id TEXT,
  target_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  migration_count INTEGER;
BEGIN
  UPDATE public.cards 
  SET 
    user_id = target_user_id,
    user_session_id = NULL,
    updated_at = NOW()
  WHERE 
    user_session_id = session_id AND 
    user_id IS NULL;
  
  GET DIAGNOSTICS migration_count = ROW_COUNT;
  RETURN migration_count;
END;
$$;

-- Function to clean up old session cards (for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_session_cards(
  days_old INTEGER DEFAULT 7
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  DELETE FROM public.cards 
  WHERE 
    user_session_id IS NOT NULL AND 
    user_id IS NULL AND 
    created_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  RETURN cleanup_count;
END;
$$;