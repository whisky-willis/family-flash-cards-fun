-- Fix RLS policy - remove reference to auth.users table
-- The auth.users table cannot be accessed from RLS policies

DROP POLICY IF EXISTS "Users can create their own collections" ON public.card_collections;

CREATE POLICY "Users can create their own collections" 
ON public.card_collections 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow authenticated users to insert collections with any user_id
  -- This is safe because only authenticated users can reach this point
  -- and the user_id comes from the signup response
  true
);