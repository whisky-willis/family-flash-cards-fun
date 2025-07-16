-- Create waitlist_emails table
CREATE TABLE public.waitlist_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert emails (public waitlist)
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist_emails 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view all waitlist emails
CREATE POLICY "Admins can view all waitlist emails" 
ON public.waitlist_emails 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_waitlist_emails_updated_at
BEFORE UPDATE ON public.waitlist_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on email for faster lookups
CREATE INDEX idx_waitlist_emails_email ON public.waitlist_emails(email);
CREATE INDEX idx_waitlist_emails_created_at ON public.waitlist_emails(created_at DESC);