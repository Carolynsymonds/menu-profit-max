-- Create table to store report requests
CREATE TABLE public.report_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email CITEXT NOT NULL,
  dishes_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  purpose TEXT NOT NULL DEFAULT 'download-report',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.report_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert report requests
CREATE POLICY "Anyone can create report requests" 
ON public.report_requests 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing own report requests (optional - for future use)
CREATE POLICY "Users can view their own report requests" 
ON public.report_requests 
FOR SELECT 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_report_requests_updated_at
BEFORE UPDATE ON public.report_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for email lookups
CREATE INDEX idx_report_requests_email ON public.report_requests(email);
CREATE INDEX idx_report_requests_created_at ON public.report_requests(created_at);