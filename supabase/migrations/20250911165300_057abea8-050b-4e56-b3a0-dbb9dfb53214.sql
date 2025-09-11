-- Fix critical security vulnerability in dish_analyses tables
-- Current policies expose real business analytics data to competitors

-- 1. Remove the problematic public demo policy that exposes real business data
DROP POLICY IF EXISTS "Demo dishes viewable by everyone limited" ON public.dish_analyses;

-- 2. Ensure only authenticated users can access dish_analyses
DROP POLICY IF EXISTS "Authenticated users can view all dish analyses secure" ON public.dish_analyses;

CREATE POLICY "Authenticated users can view all dish analyses" 
ON public.dish_analyses 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL);

-- 3. Secure the dish_analyses_demo view by dropping and recreating with mock data
DROP VIEW IF EXISTS public.dish_analyses_demo;

-- 4. Create a secure demo view with sanitized mock data instead of real business data
CREATE VIEW public.dish_analyses_demo AS
SELECT 
  gen_random_uuid() as id,
  demo_dish.dish_name,
  demo_dish.profit_range,
  demo_dish.public_analysis,
  demo_dish.created_at,
  true as is_demo
FROM (
  VALUES 
    (
      'Margherita Pizza',
      'Medium (15-25%)',
      '{"category": "Pizza", "difficulty": "Easy", "cuisine_type": "Italian", "popularity_score": 9}',
      now() - interval '1 day'
    ),
    (
      'Classic Burger',
      'High (25%+)',
      '{"category": "American", "difficulty": "Medium", "cuisine_type": "American", "popularity_score": 8}',
      now() - interval '2 days'
    ),
    (
      'Caesar Salad',
      'Low (10-15%)',
      '{"category": "Salad", "difficulty": "Easy", "cuisine_type": "Mediterranean", "popularity_score": 7}',
      now() - interval '3 days'
    ),
    (
      'Grilled Salmon',
      'High (25%+)',
      '{"category": "Seafood", "difficulty": "Hard", "cuisine_type": "Contemporary", "popularity_score": 8}',
      now() - interval '4 days'
    ),
    (
      'Chicken Tikka Masala',
      'Medium (15-25%)',
      '{"category": "Indian", "difficulty": "Medium", "cuisine_type": "Indian", "popularity_score": 9}',
      now() - interval '5 days'
    )
) AS demo_dish(dish_name, profit_range, public_analysis, created_at);

-- 5. Enable RLS on the demo view
ALTER VIEW public.dish_analyses_demo SET (security_invoker = true);

-- 6. Create RLS policy for demo view - allow public access to MOCK data only
CREATE POLICY "Public can view demo mock data" 
ON public.dish_analyses_demo 
FOR SELECT 
TO public 
USING (is_demo = true);

-- 7. Log the security fix
SELECT log_security_event('dish_analyses_secured', jsonb_build_object(
  'action', 'removed_public_business_data_access',
  'tables', ARRAY['dish_analyses', 'dish_analyses_demo'],
  'description', 'Secured business analytics from competitor access'
));