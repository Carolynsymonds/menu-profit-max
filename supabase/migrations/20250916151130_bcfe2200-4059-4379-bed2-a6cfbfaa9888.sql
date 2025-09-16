-- Allow anonymous users to create report requests
CREATE POLICY "Anonymous users can create report requests" 
ON public.report_requests 
FOR INSERT 
TO anon 
WITH CHECK (user_id IS NULL);