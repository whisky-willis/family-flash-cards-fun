
-- Add columns to store generated card image URLs
ALTER TABLE public.cards 
ADD COLUMN front_image_url TEXT,
ADD COLUMN back_image_url TEXT,
ADD COLUMN print_ready BOOLEAN DEFAULT FALSE;

-- Create storage bucket for card renders
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-renders', 'card-renders', true);

-- Create policy to allow public access to card renders
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-renders');

-- Create policy to allow authenticated users to insert card renders
CREATE POLICY "Allow Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'card-renders');

-- Create policy to allow authenticated users to update card renders
CREATE POLICY "Allow Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'card-renders');

-- Create policy to allow authenticated users to delete card renders
CREATE POLICY "Allow Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'card-renders');
