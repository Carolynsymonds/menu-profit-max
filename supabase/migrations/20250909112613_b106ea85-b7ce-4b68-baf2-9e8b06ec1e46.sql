-- Create table for dish analysis email verifications
CREATE TABLE public.dish_analysis_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  verification_token TEXT NOT NULL UNIQUE,
  dishes_data JSONB NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dish_analysis_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for verification access
CREATE POLICY "Anyone can create verifications"
ON public.dish_analysis_verifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view verifications by token"
ON public.dish_analysis_verifications
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update verifications by token"
ON public.dish_analysis_verifications
FOR UPDATE
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_dish_analysis_verifications_updated_at
BEFORE UPDATE ON public.dish_analysis_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_dish_analysis_verifications_token ON public.dish_analysis_verifications(verification_token);
CREATE INDEX idx_dish_analysis_verifications_email ON public.dish_analysis_verifications(email);
CREATE INDEX idx_dish_analysis_verifications_expires_at ON public.dish_analysis_verifications(expires_at);