-- First, let's update the existing cards table to support the new requirements
-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can manage their session cards" ON cards;

-- Update the cards table structure to match the new requirements
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS guest_session_id TEXT;

-- Update the existing user_session_id to guest_session_id for consistency
UPDATE cards SET guest_session_id = user_session_id WHERE guest_session_id IS NULL AND user_session_id IS NOT NULL;

-- Remove the old user_session_id column after migrating data
ALTER TABLE cards DROP COLUMN IF EXISTS user_session_id;

-- Ensure we have all the required columns with proper types
ALTER TABLE cards 
ALTER COLUMN date_of_birth TYPE TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS front_image_url TEXT,
ADD COLUMN IF NOT EXISTS back_image_url TEXT;

-- Rename photo_url to photo if it doesn't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'photo_url' AND table_schema = 'public') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'photo' AND table_schema = 'public') THEN
        ALTER TABLE cards RENAME COLUMN photo_url TO photo;
    END IF;
END $$;

-- Create new RLS policies for the updated schema
CREATE POLICY "Users can view their own cards" ON cards
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.uid() IS NULL AND guest_session_id IS NOT NULL)
);

CREATE POLICY "Users can insert their own cards" ON cards
FOR INSERT WITH CHECK (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND guest_session_id IS NOT NULL)
);

CREATE POLICY "Users can update their own cards" ON cards
FOR UPDATE USING (
  auth.uid() = user_id OR
  (auth.uid() IS NULL AND guest_session_id IS NOT NULL)
);

CREATE POLICY "Users can delete their own cards" ON cards
FOR DELETE USING (
  auth.uid() = user_id OR
  (auth.uid() IS NULL AND guest_session_id IS NOT NULL)
);

-- Create function to migrate guest cards to authenticated users
CREATE OR REPLACE FUNCTION public.migrate_guest_cards_to_user(
  guest_session_id_param TEXT,
  user_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cards_migrated INTEGER;
BEGIN
  -- Update all guest cards to be owned by the user
  UPDATE cards 
  SET 
    user_id = user_id_param,
    guest_session_id = NULL,
    updated_at = NOW()
  WHERE guest_session_id = guest_session_id_param 
    AND user_id IS NULL;
  
  GET DIAGNOSTICS cards_migrated = ROW_COUNT;
  
  RETURN cards_migrated;
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_guest_session_id ON cards(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);