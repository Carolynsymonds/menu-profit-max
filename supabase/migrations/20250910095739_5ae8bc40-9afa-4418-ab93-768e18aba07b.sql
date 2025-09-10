-- Create menu_uploads table
CREATE TABLE public.menu_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  menu_data JSONB NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processed_dishes JSONB DEFAULT '[]'::jsonb,
  analysis_results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own menu uploads" 
ON public.menu_uploads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own menu uploads" 
ON public.menu_uploads 
FOR SELECT 
USING (user_email = auth.email() OR auth.role() = 'anon');

CREATE POLICY "Users can update their own menu uploads" 
ON public.menu_uploads 
FOR UPDATE 
USING (user_email = auth.email() OR auth.role() = 'anon');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_menu_uploads_updated_at
BEFORE UPDATE ON public.menu_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();