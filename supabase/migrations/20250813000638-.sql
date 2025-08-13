-- 1) Tighten RLS for card_collections INSERT to require authenticated user match
ALTER TABLE public.card_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own collections" ON public.card_collections;
CREATE POLICY "Users can create their own collections"
ON public.card_collections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2) Validation functions (create or replace)
CREATE OR REPLACE FUNCTION public.validate_card_collection_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.name IS NULL OR length(trim(NEW.name)) = 0 THEN
    RAISE EXCEPTION 'Collection name cannot be empty';
  END IF;
  IF length(NEW.name) > 120 THEN
    RAISE EXCEPTION 'Collection name cannot exceed 120 characters';
  END IF;

  NEW.name = trim(NEW.name);
  IF NEW.description IS NOT NULL THEN
    NEW.description = trim(NEW.description);
    IF length(NEW.description) > 1000 THEN
      RAISE EXCEPTION 'Description cannot exceed 1000 characters';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  IF NEW.name IS NOT NULL THEN
    NEW.name = trim(NEW.name);
    IF length(NEW.name) > 120 THEN
      RAISE EXCEPTION 'Name cannot exceed 120 characters';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Triggers: Drop existing if any, then create fresh ones
-- cards
DROP TRIGGER IF EXISTS validate_cards ON public.cards;
CREATE TRIGGER validate_cards
BEFORE INSERT OR UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.validate_card_data();

DROP TRIGGER IF EXISTS set_timestamp_on_cards ON public.cards;
CREATE TRIGGER set_timestamp_on_cards
BEFORE UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- orders
DROP TRIGGER IF EXISTS validate_orders ON public.orders;
CREATE TRIGGER validate_orders
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_data();

DROP TRIGGER IF EXISTS set_timestamp_on_orders ON public.orders;
CREATE TRIGGER set_timestamp_on_orders
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- card_collections
DROP TRIGGER IF EXISTS validate_card_collections ON public.card_collections;
CREATE TRIGGER validate_card_collections
BEFORE INSERT OR UPDATE ON public.card_collections
FOR EACH ROW
EXECUTE FUNCTION public.validate_card_collection_data();

DROP TRIGGER IF EXISTS set_timestamp_on_card_collections ON public.card_collections;
CREATE TRIGGER set_timestamp_on_card_collections
BEFORE UPDATE ON public.card_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- profiles
DROP TRIGGER IF EXISTS validate_profiles ON public.profiles;
CREATE TRIGGER validate_profiles
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_data();

DROP TRIGGER IF EXISTS set_timestamp_on_profiles ON public.profiles;
CREATE TRIGGER set_timestamp_on_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();