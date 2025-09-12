-- Allow public access to dish_analyses table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can create dish analyses secure" ON public.dish_analyses;
DROP POLICY IF EXISTS "Authenticated users can view all dish analyses" ON public.dish_analyses;

-- Create new public policies that allow anyone to insert and view
CREATE POLICY "Anyone can create dish analyses" 
ON public.dish_analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view dish analyses" 
ON public.dish_analyses 
FOR SELECT 
USING (true);

-- Also ensure the analyze-dish function is public by updating config
-- Note: This will be handled in the config.toml file separately