-- Fix the search path for the migration function
CREATE OR REPLACE FUNCTION public.migrate_guest_cards_to_user(
  guest_session_id_param TEXT,
  user_id_param UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  cards_migrated INTEGER;
BEGIN
  -- Update all guest cards to be owned by the user
  UPDATE public.cards 
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