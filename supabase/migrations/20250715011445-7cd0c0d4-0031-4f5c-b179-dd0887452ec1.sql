-- Update RLS policy to allow newly registered users to insert their own collections
-- This policy allows users to insert collections where they provide their own user_id
-- even if auth.uid() is temporarily null (which happens right after signup)

DROP POLICY IF EXISTS "Users can create their own collections" ON public.card_collections;

CREATE POLICY "Users can create their own collections" 
ON public.card_collections 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if the user_id matches auth.uid() (normal case)
  auth.uid() = user_id 
  OR 
  -- Allow if user is authenticated but auth.uid() might be null (right after signup)
  -- and the user_id matches a valid user in auth.users
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  ))
);