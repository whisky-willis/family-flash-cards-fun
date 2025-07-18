-- Update orders table to be a permanent order tracking system
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount INTEGER; -- in cents
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS card_count INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Update status column to be more specific about order status
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'payment_pending';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Add constraint to ensure valid statuses
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'orders_payment_status_check'
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'orders_fulfillment_status_check'
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_fulfillment_status_check 
        CHECK (fulfillment_status IN ('pending', 'processing', 'printed', 'shipped', 'delivered', 'cancelled'));
    END IF;
END $$;

-- Update RLS policies for permanent order management
DROP POLICY IF EXISTS "allow_select_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_update_orders" ON public.orders;

-- Users can view their own orders
CREATE POLICY "users_can_view_own_orders" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid() OR auth.uid() IS NULL); -- Allow viewing for logged in users or edge functions

-- Edge functions can insert orders
CREATE POLICY "edge_functions_can_insert_orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Edge functions and admins can update orders
CREATE POLICY "edge_functions_can_update_orders" ON public.orders
  FOR UPDATE
  USING (true);

-- Add a function to update order status
CREATE OR REPLACE FUNCTION public.update_order_status(
  order_id UUID,
  new_payment_status TEXT DEFAULT NULL,
  new_fulfillment_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.orders 
  SET 
    payment_status = COALESCE(new_payment_status, payment_status),
    fulfillment_status = COALESCE(new_fulfillment_status, fulfillment_status),
    completed_at = CASE 
      WHEN new_fulfillment_status = 'delivered' THEN now()
      ELSE completed_at
    END,
    updated_at = now()
  WHERE id = order_id;
  
  RETURN FOUND;
END;
$$;