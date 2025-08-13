-- Strengthen orders table RLS for sensitive data protection
-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Explicitly allow service role to SELECT orders (edge functions), without broadening access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'service_role_can_select_orders'
  ) THEN
    CREATE POLICY "service_role_can_select_orders"
    ON public.orders
    FOR SELECT
    USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Reaffirm existing owner-only SELECT policy (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'users_can_view_own_orders'
  ) THEN
    CREATE POLICY "users_can_view_own_orders"
    ON public.orders
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Keep insert/update restricted to service_role (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'service_role_can_insert_orders'
  ) THEN
    CREATE POLICY "service_role_can_insert_orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'service_role_can_update_orders'
  ) THEN
    CREATE POLICY "service_role_can_update_orders"
    ON public.orders
    FOR UPDATE
    USING (auth.role() = 'service_role');
  END IF;
END $$;
