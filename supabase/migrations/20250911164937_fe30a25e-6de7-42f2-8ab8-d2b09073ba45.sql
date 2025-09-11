-- Fix Security Definer View issue
-- The dish_analyses_demo view was potentially bypassing RLS policies
-- We'll recreate it to ensure proper security

-- Drop the existing view
DROP VIEW IF EXISTS public.dish_analyses_demo;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
-- This ensures the view respects RLS policies and uses the querying user's permissions
CREATE VIEW public.dish_analyses_demo AS
SELECT 
  id,
  dish_name,
  CASE
    WHEN profit_margin < 15::numeric THEN 'Low (10-15%)'::text
    WHEN profit_margin < 25::numeric THEN 'Medium (15-25%)'::text
    WHEN profit_margin >= 25::numeric THEN 'High (25%+)'::text
    ELSE 'Not Available'::text
  END AS profit_range,
  CASE
    WHEN analysis_result IS NOT NULL THEN jsonb_build_object(
      'category', COALESCE(analysis_result ->> 'category', 'General'),
      'difficulty', COALESCE(analysis_result ->> 'difficulty', 'Medium'), 
      'cuisine_type', COALESCE(analysis_result ->> 'cuisine_type', 'International'),
      'popularity_score', COALESCE((analysis_result ->> 'popularity_score')::integer, 5)
    )
    ELSE jsonb_build_object('category', 'General', 'difficulty', 'Medium')
  END AS public_analysis,
  created_at,
  true AS is_demo
FROM dish_analyses
WHERE id IN (
  SELECT id 
  FROM dish_analyses 
  ORDER BY created_at DESC 
  LIMIT 10
)
ORDER BY created_at DESC;

-- Enable RLS on the view to ensure security
ALTER VIEW public.dish_analyses_demo SET (security_invoker = true);

-- Add RLS policy to allow public access to demo data (matching existing functionality)
-- Note: Views inherit RLS from their underlying tables by default with SECURITY INVOKER