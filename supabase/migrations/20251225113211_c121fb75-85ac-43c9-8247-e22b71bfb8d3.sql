-- Create table for app ratings/feedback questionnaire
CREATE TABLE public.app_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_section TEXT,
  
  -- Questionnaire responses (1-5 scale: 1=Strongly Disagree, 5=Strongly Agree)
  ease_of_use INTEGER CHECK (ease_of_use >= 1 AND ease_of_use <= 5),
  interface_design INTEGER CHECK (interface_design >= 1 AND interface_design <= 5),
  qr_code_functionality INTEGER CHECK (qr_code_functionality >= 1 AND qr_code_functionality <= 5),
  attendance_tracking INTEGER CHECK (attendance_tracking >= 1 AND attendance_tracking <= 5),
  response_speed INTEGER CHECK (response_speed >= 1 AND response_speed <= 5),
  reliability INTEGER CHECK (reliability >= 1 AND reliability <= 5),
  overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
  would_recommend INTEGER CHECK (would_recommend >= 1 AND would_recommend <= 5),
  
  -- Open-ended feedback
  suggestions TEXT,
  additional_comments TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_ratings ENABLE ROW LEVEL SECURITY;

-- Users can insert their own rating
CREATE POLICY "Users can insert their own rating"
ON public.app_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own rating
CREATE POLICY "Users can view their own rating"
ON public.app_ratings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own rating
CREATE POLICY "Users can update their own rating"
ON public.app_ratings
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings"
ON public.app_ratings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));