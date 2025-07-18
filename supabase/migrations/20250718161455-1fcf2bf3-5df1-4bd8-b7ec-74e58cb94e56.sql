-- Create orders table to temporarily store order data for email processing
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  cards_data JSONB NOT NULL,
  order_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies to allow the edge functions to insert and update orders
CREATE POLICY "allow_insert_orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_update_orders" ON public.orders
  FOR UPDATE
  USING (true);

CREATE POLICY "allow_select_orders" ON public.orders
  FOR SELECT
  USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();