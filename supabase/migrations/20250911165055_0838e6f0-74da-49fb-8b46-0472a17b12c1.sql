-- Fix critical security vulnerability in report_requests table
-- Currently anyone can view all email addresses and data

-- The current SELECT policy allows public access to all customer emails
-- This is a major privacy and security violation

-- Option 1: If this table is for authenticated users only
-- Add user_id column and proper RLS policies

-- First, let's see if we can add user_id safely
ALTER TABLE public.report_requests 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the SELECT policy to only allow users to see their own requests
DROP POLICY IF EXISTS "Users can view their own report requests" ON public.report_requests;

CREATE POLICY "Users can view their own authenticated report requests" 
ON public.report_requests 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Update INSERT policy to require authentication and set user_id
DROP POLICY IF EXISTS "Anyone can create report requests" ON public.report_requests;

CREATE POLICY "Authenticated users can create their own report requests" 
ON public.report_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id AND email = auth.email());

-- Create a secure function for creating report requests that ensures data integrity
CREATE OR REPLACE FUNCTION public.create_report_request(
  p_dishes_data jsonb,
  p_purpose text DEFAULT 'download-report'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id uuid;
  user_email text;
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found';
  END IF;
  
  -- Insert the request
  INSERT INTO public.report_requests (user_id, email, dishes_data, purpose)
  VALUES (auth.uid(), user_email::citext, p_dishes_data, p_purpose)
  RETURNING id INTO request_id;
  
  -- Log the event
  PERFORM log_security_event('report_request_created', jsonb_build_object(
    'request_id', request_id,
    'purpose', p_purpose,
    'user_id', auth.uid()
  ));
  
  RETURN request_id;
END;
$$;