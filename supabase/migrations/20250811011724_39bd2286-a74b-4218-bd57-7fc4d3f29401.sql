-- Phase 1 security hardening: orders RLS and validation/updated_at triggers

-- Ensure RLS is enabled on affected tables
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.card_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Orders RLS: restrict INSERT/UPDATE to service role and SELECT to owner only
DROP POLICY IF EXISTS "edge_functions_can_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "edge_functions_can_update_orders" ON public.orders;
DROP POLICY IF EXISTS "users_can_view_own_orders" ON public.orders;
DROP POLICY IF EXISTS "service_role_can_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "service_role_can_update_orders" ON public.orders;

CREATE POLICY "service_role_can_insert_orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_role_can_update_orders"
ON public.orders
FOR UPDATE
TO public
USING (auth.role() = 'service_role');

CREATE POLICY "users_can_view_own_orders"
ON public.orders
FOR SELECT
TO public
USING (user_id = auth.uid());

-- Attach validation triggers and updated_at triggers
-- Orders
DROP TRIGGER IF EXISTS trg_validate_order_data ON public.orders;
CREATE TRIGGER trg_validate_order_data
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_data();

DROP TRIGGER IF EXISTS trg_update_orders_updated_at ON public.orders;
CREATE TRIGGER trg_update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Cards
DROP TRIGGER IF EXISTS trg_validate_card_data ON public.cards;
CREATE TRIGGER trg_validate_card_data
BEFORE INSERT OR UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.validate_card_data();

DROP TRIGGER IF EXISTS trg_update_cards_updated_at ON public.cards;
CREATE TRIGGER trg_update_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Card collections
DROP TRIGGER IF EXISTS trg_update_card_collections_updated_at ON public.card_collections;
CREATE TRIGGER trg_update_card_collections_updated_at
BEFORE UPDATE ON public.card_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles
DROP TRIGGER IF EXISTS trg_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();