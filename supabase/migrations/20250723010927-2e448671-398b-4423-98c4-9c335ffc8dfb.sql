
-- Add processing_status field to orders table to track card processing
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';

-- Add constraint to ensure valid processing statuses
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'orders_processing_status_check'
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_processing_status_check 
        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_processing_status ON public.orders(processing_status);
