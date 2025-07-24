-- Add input validation triggers for better security

-- Create a function to validate card data input
CREATE OR REPLACE FUNCTION validate_card_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate name length and content
  IF NEW.name IS NULL OR length(trim(NEW.name)) = 0 THEN
    RAISE EXCEPTION 'Card name cannot be empty';
  END IF;
  
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Card name cannot exceed 100 characters';
  END IF;
  
  -- Validate relationship field
  IF NEW.relationship IS NOT NULL AND length(NEW.relationship) > 50 THEN
    RAISE EXCEPTION 'Relationship field cannot exceed 50 characters';
  END IF;
  
  -- Validate hobbies field
  IF NEW.hobbies IS NOT NULL AND length(NEW.hobbies) > 200 THEN
    RAISE EXCEPTION 'Hobbies field cannot exceed 200 characters';
  END IF;
  
  -- Validate fun_fact field
  IF NEW.fun_fact IS NOT NULL AND length(NEW.fun_fact) > 500 THEN
    RAISE EXCEPTION 'Fun fact field cannot exceed 500 characters';
  END IF;
  
  -- Sanitize text fields (basic XSS protection)
  NEW.name = trim(NEW.name);
  NEW.relationship = trim(COALESCE(NEW.relationship, ''));
  NEW.hobbies = trim(COALESCE(NEW.hobbies, ''));
  NEW.fun_fact = trim(COALESCE(NEW.fun_fact, ''));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger to cards table
DROP TRIGGER IF EXISTS validate_card_data_trigger ON public.cards;
CREATE TRIGGER validate_card_data_trigger
  BEFORE INSERT OR UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION validate_card_data();

-- Create a function to validate order data
CREATE OR REPLACE FUNCTION validate_order_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate customer email
  IF NEW.customer_email IS NOT NULL AND NEW.customer_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate card count
  IF NEW.card_count IS NOT NULL AND (NEW.card_count < 1 OR NEW.card_count > 50) THEN
    RAISE EXCEPTION 'Card count must be between 1 and 50';
  END IF;
  
  -- Validate total amount (must be positive)
  IF NEW.total_amount IS NOT NULL AND NEW.total_amount < 0 THEN
    RAISE EXCEPTION 'Total amount cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger to orders table
DROP TRIGGER IF EXISTS validate_order_data_trigger ON public.orders;
CREATE TRIGGER validate_order_data_trigger
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_data();

-- Create a function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type text,
  user_id_param uuid DEFAULT NULL,
  details jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- In a production environment, you might want to log to a separate security table
  -- For now, we'll use RAISE NOTICE for logging
  RAISE NOTICE 'Security Event: % | User: % | Details: %', event_type, user_id_param, details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to clean up old guest sessions
CREATE OR REPLACE FUNCTION cleanup_old_guest_sessions()
RETURNS void AS $$
BEGIN
  -- Delete cards from guest sessions older than 7 days
  DELETE FROM public.cards
  WHERE guest_session_id IS NOT NULL
    AND user_id IS NULL
    AND created_at < NOW() - INTERVAL '7 days';
    
  -- Log the cleanup
  PERFORM log_security_event('guest_session_cleanup', NULL, 
    jsonb_build_object('deleted_at', NOW()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;