
-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a comprehensive research questionnaire table
CREATE TABLE public.research_questionnaire (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Part I: Respondent Profile
  grade_level TEXT NOT NULL,
  track TEXT,
  sex TEXT NOT NULL,
  career_path TEXT NOT NULL,
  career_path_other TEXT,
  
  -- Part II: Development of IoT-Based Monitoring App (1-5 scale)
  dev_meets_needs INTEGER,
  dev_design_suitable INTEGER,
  dev_dependable_tools INTEGER,
  dev_properly_tested INTEGER,
  dev_fulfills_purpose INTEGER,
  
  -- Part III: Perceived Effectiveness - Security
  eff_security_protects_data INTEGER,
  eff_security_feels_safe INTEGER,
  eff_security_auth_prevents_unauthorized INTEGER,
  eff_security_confidentiality INTEGER,
  eff_security_tamper_proof INTEGER,
  
  -- Part III: Perceived Effectiveness - Connectivity
  eff_conn_minimal_interruptions INTEGER,
  eff_conn_realtime_functions INTEGER,
  eff_conn_syncs_devices INTEGER,
  eff_conn_stable_performance INTEGER,
  eff_conn_notifications_timely INTEGER,
  
  -- Part III: Perceived Effectiveness - Scalability
  eff_scale_supports_users INTEGER,
  eff_scale_handles_data INTEGER,
  eff_scale_features_remain INTEGER,
  eff_scale_adapts_upgrades INTEGER,
  eff_scale_performs_any_usage INTEGER,
  
  -- Part IV: Perceived Improvements - Security
  imp_security_better_protection INTEGER,
  imp_security_stronger_measures INTEGER,
  imp_security_less_breach_concern INTEGER,
  imp_security_more_trust INTEGER,
  imp_security_stronger_auth INTEGER,
  
  -- Part IV: Perceived Improvements - Scalability
  imp_scale_increased_capacity INTEGER,
  imp_scale_improved_performance INTEGER,
  imp_scale_enhanced_data_mgmt INTEGER,
  imp_scale_expanded_features INTEGER,
  imp_scale_strengthened_stability INTEGER,
  
  -- Part IV: Perceived Improvements - Connectivity
  imp_conn_improved_stability INTEGER,
  imp_conn_enhanced_communication INTEGER,
  imp_conn_weak_signal_support INTEGER,
  imp_conn_improved_sync INTEGER,
  imp_conn_enhanced_reliability INTEGER,
  
  -- Part V: Accessibility
  acc_device_access INTEGER,
  acc_loads_quickly INTEGER,
  acc_easy_info_access INTEGER,
  acc_accommodates_needs INTEGER,
  acc_no_interruptions INTEGER,
  
  -- Part V: Usability
  usb_user_friendly INTEGER,
  usb_well_organized INTEGER,
  usb_intuitive_interface INTEGER,
  usb_clear_instructions INTEGER,
  usb_efficient_tasks INTEGER,
  
  -- Part V: Overall User Satisfaction
  sat_meets_expectations INTEGER,
  sat_satisfying_experience INTEGER,
  sat_reliable_performance INTEGER,
  sat_addresses_needs INTEGER,
  sat_positive_impression INTEGER,
  
  -- Part VI: Feedback
  feedback TEXT
);

-- Enable Row Level Security
ALTER TABLE public.research_questionnaire ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own questionnaire" 
ON public.research_questionnaire 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire" 
ON public.research_questionnaire 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire" 
ON public.research_questionnaire 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow admins to view all questionnaires
CREATE POLICY "Admins can view all questionnaires" 
ON public.research_questionnaire 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_research_questionnaire_updated_at
BEFORE UPDATE ON public.research_questionnaire
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
