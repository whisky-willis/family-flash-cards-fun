-- Create storage bucket for card images
INSERT INTO storage.buckets (id, name, public) VALUES ('card-images', 'card-images', true);

-- Create storage policies for card images
CREATE POLICY "Anyone can upload card images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'card-images');

CREATE POLICY "Anyone can view card images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'card-images');

CREATE POLICY "Anyone can update card images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'card-images');

CREATE POLICY "Anyone can delete card images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'card-images');

-- Create cards table for individual card storage
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  date_of_birth DATE,
  favorite_color TEXT,
  hobbies TEXT,
  fun_fact TEXT,
  photo_url TEXT,
  image_position JSONB DEFAULT '{"x": 0, "y": 0, "scale": 1}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  order_id UUID REFERENCES public.orders(id)
);

-- Enable RLS on cards table
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Create policies for cards table (session-based until order creation)
CREATE POLICY "Users can manage their session cards" 
ON public.cards 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_cards_user_session_id ON public.cards(user_session_id);
CREATE INDEX idx_cards_order_id ON public.cards(order_id);