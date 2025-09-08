-- Create dish_analyses table for caching analysis results
CREATE TABLE public.dish_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dish_name TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  profit_margin DECIMAL(5,2),
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dish_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since dish analyses can be viewed by anyone)
CREATE POLICY "Anyone can view dish analyses" 
ON public.dish_analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create dish analyses" 
ON public.dish_analyses 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster dish name lookups
CREATE INDEX idx_dish_analyses_dish_name ON public.dish_analyses(dish_name);
CREATE INDEX idx_dish_analyses_created_at ON public.dish_analyses(created_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dish_analyses_updated_at
BEFORE UPDATE ON public.dish_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();