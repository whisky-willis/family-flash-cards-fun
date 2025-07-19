-- Security fix: Update database functions to prevent search path manipulation attacks

-- Update update_order_status function with secure search path
CREATE OR REPLACE FUNCTION public.update_order_status(order_id uuid, new_payment_status text DEFAULT NULL::text, new_fulfillment_status text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update update_updated_at_column function with secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'name',
    NEW.email
  );
  RETURN NEW;
END;
$function$;