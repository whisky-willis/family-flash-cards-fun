-- Add deck_design column to card_collections table to store theme, font, and recipient name
ALTER TABLE public.card_collections 
ADD COLUMN deck_design JSONB DEFAULT NULL;