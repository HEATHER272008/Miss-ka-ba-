import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, CheckCircle, ClipboardList } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Part II Questions
const developmentQuestions = [
  { id: 'dev_meets_needs', statement: 'The app was created to meet the specific needs of the students and the school.' },
  { id: 'dev_design_suitable', statement: 'Its design is well thought out and suitable for its purpose.' },
  { id: 'dev_dependable_tools', statement: 'The developers used dependable tools and technologies to build the app.' },
  { id: 'dev_properly_tested', statement: 'The app was properly tested before being launched or used.' },
  { id: 'dev_fulfills_purpose', statement: 'It effectively fulfills its main purpose of monitoring students.' },
];

// Part III Questions - Effectiveness
const effectivenessSecurityQuestions = [
  { id: 'eff_security_protects_data', statement: 'The app effectively protects my personal data.' },
  { id: 'eff_security_feels_safe', statement: 'The app makes me feel safe from potential data breaches or unauthorized access.' },
  { id: 'eff_security_auth_prevents_unauthorized', statement: 'The login and authentication features effectively prevent unauthorized users from accessing the system.' },
  { id: 'eff_security_confidentiality', statement: 'The app effectively maintains the confidentiality of sensitive information.' },
  { id: 'eff_security_tamper_proof', statement: 'The security measures of the app effectively ensure that my data cannot be easily tampered with.' },
];

const effectivenessConnectivityQuestions = [
  { id: 'eff_conn_minimal_interruptions', statement: 'The app connects effectively to the internet or network with minimal interruptions.' },
  { id: 'eff_conn_realtime_functions', statement: 'The real-time features of the app (e.g., tracking, updates) function effectively when connected.' },
  { id: 'eff_conn_syncs_devices', statement: 'The app loads and syncs data effectively across different devices.' },
  { id: 'eff_conn_stable_performance', statement: 'The app effectively maintains stable performance even with varying network conditions.' },
  { id: 'eff_conn_notifications_timely', statement: 'Notifications and updates are delivered effectively and without delay.' },
];

const effectivenessScalabilityQuestions = [
  { id: 'eff_scale_supports_users', statement: 'The app effectively supports an increasing number of users without affecting performance.' },
  { id: 'eff_scale_handles_data', statement: 'The app can effectively handle larger amounts of data as usage grows.' },
  { id: 'eff_scale_features_remain', statement: "The app's features remain effective even as more students or stakeholders use the system." },
  { id: 'eff_scale_adapts_upgrades', statement: 'The system effectively adapts to future upgrades or added functionalities.' },
  { id: 'eff_scale_performs_any_usage', statement: 'The app performs effectively whether usage is low or high.' },
];

// Part IV Questions - Improvements
const improvementsSecurityQuestions = [
  { id: 'imp_security_better_protection', statement: 'The app will protect my personal data better if its security features are improved.' },
  { id: 'imp_security_stronger_measures', statement: 'The app will feel safer to use if stronger security measures are added.' },
  { id: 'imp_security_less_breach_concern', statement: 'The app will lessen my concerns about data breaches if its security system is enhanced.' },
  { id: 'imp_security_more_trust', statement: 'The app will earn more of my trust if its security protocols are updated.' },
  { id: 'imp_security_stronger_auth', statement: 'The app will be more secure to use if its login and authentication processes are strengthened.' },
];

const improvementsScalabilityQuestions = [
  { id: 'imp_scale_increased_capacity', statement: 'The app will function more effectively for many users if its capacity is increased.' },
  { id: 'imp_scale_improved_performance', statement: 'The app will perform more smoothly as usage grows if its system performance is improved.' },
  { id: 'imp_scale_enhanced_data_mgmt', statement: 'The app will handle more data in the future if its data management features are enhanced.' },
  { id: 'imp_scale_expanded_features', statement: 'The app will adapt better to school needs if its features are expanded.' },
  { id: 'imp_scale_strengthened_stability', statement: 'The app will become more reliable as it scales if its system stability is strengthened.' },
];

const improvementsConnectivityQuestions = [
  { id: 'imp_conn_improved_stability', statement: 'The app will be easier to use if its network stability is improved.' },
  { id: 'imp_conn_enhanced_communication', statement: 'The app will provide more accurate real-time monitoring if device-to-app communication is enhanced.' },
  { id: 'imp_conn_weak_signal_support', statement: 'The app will function more consistently even with weak signals if its internet support features are strengthened.' },
  { id: 'imp_conn_improved_sync', statement: 'The app will update faster if its sync speed is improved.' },
  { id: 'imp_conn_enhanced_reliability', statement: 'The app will work more reliably across different devices if its connectivity features are enhanced.' },
];

// Part V Questions
const accessibilityQuestions = [
  { id: 'acc_device_access', statement: "The app provides effective access to its features regardless of the user's device." },
  { id: 'acc_loads_quickly', statement: 'The app loads quickly and remains accessible even during peak usage.' },
  { id: 'acc_easy_info_access', statement: 'The app allows users to access important information without difficulty.' },
  { id: 'acc_accommodates_needs', statement: 'The app accommodates different user needs, making essential features reachable at all times.' },
  { id: 'acc_no_interruptions', statement: 'The app is effective in ensuring that users can log in and use it without repeated interruptions.' },
];

const usabilityQuestions = [
  { id: 'usb_user_friendly', statement: 'The app is user-friendly and easy to use.' },
  { id: 'usb_well_organized', statement: 'The app is well-organized and effectively considers the needs of its users.' },
  { id: 'usb_intuitive_interface', statement: "The app's interface is intuitive and easy to navigate." },
  { id: 'usb_clear_instructions', statement: 'The app provides clear instructions that make tasks easier to complete.' },
  { id: 'usb_efficient_tasks', statement: 'The app allows users to perform tasks efficiently with minimal errors or confusion.' },
];

const satisfactionQuestions = [
  { id: 'sat_meets_expectations', statement: 'The app effectively meets my expectations as a monitoring tool.' },
  { id: 'sat_satisfying_experience', statement: 'The app provides a satisfying experience whenever I use it.' },
  { id: 'sat_reliable_performance', statement: 'The app delivers reliable performance that makes me feel confident using it.' },
  { id: 'sat_addresses_needs', statement: 'The app\'s features effectively address my needs as a student or user.' },
  { id: 'sat_positive_impression', statement: 'The app gives me an overall positive impression of its usefulness and quality.' },
];

// Rating scales
const developmentScale = [
  { value: 5, label: 'Strongly Agree' },
  { value: 4, label: 'Agree' },
  { value: 3, label: 'Neutral' },
  { value: 2, label: 'Disagree' },
  { value: 1, label: 'Strongly Disagree' },
];

const effectivenessScale = [
  { value: 5, label: 'Very Effective' },
  { value: 4, label: 'Effective' },
  { value: 3, label: 'Moderately Effective' },
  { value: 2, label: 'Less Effective' },
  { value: 1, label: 'Not Effective' },
];

const satisfactionScale = [
  { value: 5, label: 'Very Satisfied' },
  { value: 4, label: 'Satisfied' },
  { value: 3, label: 'Moderately Satisfied' },
  { value: 2, label: 'Less Satisfied' },
  { value: 1, label: 'Not Satisfied' },
];

interface QuestionTableProps {
  title: string;
  subtitle?: string;
  questions: { id: string; statement: string }[];
  scale: { value: number; label: string }[];
  ratings: Record<string, number>;
  onRatingChange: (id: string, value: string) => void;
}

const QuestionTable = ({ title, subtitle, questions, scale, ratings, onRatingChange }: QuestionTableProps) => (
  <Card className="shadow-lg mb-6">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg text-primary">{title}</CardTitle>
      {subtitle && <CardDescription>{subtitle}</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-primary/20">
              <th className="text-left py-3 px-3 font-semibold text-foreground w-1/2">Statement</th>
              {scale.map((item) => (
                <th key={item.value} className="text-center py-3 px-1 font-medium text-xs text-muted-foreground min-w-[60px]">
                  <div className="text-lg font-bold text-primary">{item.value}</div>
                  <div className="text-[10px] leading-tight">{item.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((item, index) => (
              <tr 
                key={item.id} 
                className={`border-b border-border/50 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
              >
                <td className="py-3 px-3 text-foreground">{item.statement}</td>
                {scale.map((scaleItem) => (
                  <td key={scaleItem.value} className="text-center py-3 px-1">
                    <RadioGroup
                      value={ratings[item.id]?.toString() || ''}
                      onValueChange={(value) => onRatingChange(item.id, value)}
                    >
                      <div className="flex justify-center">
                        <RadioGroupItem
                          value={scaleItem.value.toString()}
                          id={`${item.id}-${scaleItem.value}`}
                          className="h-4 w-4"
                        />
                      </div>
                    </RadioGroup>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const AppRatings = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  
  // Profile data
  const [gradeLevel, setGradeLevel] = useState('');
  const [track, setTrack] = useState('');
  const [sex, setSex] = useState('');
  const [careerPath, setCareerPath] = useState('');
  const [careerPathOther, setCareerPathOther] = useState('');

  useEffect(() => {
    checkExistingQuestionnaire();
  }, [user]);

  const checkExistingQuestionnaire = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('research_questionnaire')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setHasSubmitted(true);
      // Pre-fill profile data
      setGradeLevel(data.grade_level || '');
      setTrack(data.track || '');
      setSex(data.sex || '');
      setCareerPath(data.career_path || '');
      setCareerPathOther(data.career_path_other || '');
      setFeedback(data.feedback || '');
      
      // Pre-fill ratings
      const existingRatings: Record<string, number> = {};
      const allQuestions = [
        ...developmentQuestions,
        ...effectivenessSecurityQuestions,
        ...effectivenessConnectivityQuestions,
        ...effectivenessScalabilityQuestions,
        ...improvementsSecurityQuestions,
        ...improvementsScalabilityQuestions,
        ...improvementsConnectivityQuestions,
        ...accessibilityQuestions,
        ...usabilityQuestions,
        ...satisfactionQuestions,
      ];
      
      allQuestions.forEach(q => {
        const value = data[q.id as keyof typeof data];
        if (typeof value === 'number') {
          existingRatings[q.id] = value;
        }
      });
      setRatings(existingRatings);
    }
  };

  const handleRatingChange = (questionId: string, value: string) => {
    setRatings(prev => ({ ...prev, [questionId]: parseInt(value) }));
  };

  const getAllQuestionIds = () => {
    return [
      ...developmentQuestions,
      ...effectivenessSecurityQuestions,
      ...effectivenessConnectivityQuestions,
      ...effectivenessScalabilityQuestions,
      ...improvementsSecurityQuestions,
      ...improvementsScalabilityQuestions,
      ...improvementsConnectivityQuestions,
      ...accessibilityQuestions,
      ...usabilityQuestions,
      ...satisfactionQuestions,
    ].map(q => q.id);
  };

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to submit the questionnaire.",
        variant: "destructive"
      });
      return;
    }

    // Validate profile section
    if (!gradeLevel || !sex || !careerPath) {
      toast({
        title: "Incomplete Form",
        description: "Please complete all required fields in the Respondent Profile section.",
        variant: "destructive"
      });
      return;
    }

    if (gradeLevel === 'Grade 12' && !track) {
      toast({
        title: "Incomplete Form",
        description: "Please select your track (Academic or TVL).",
        variant: "destructive"
      });
      return;
    }

    if (careerPath === 'Other' && !careerPathOther.trim()) {
      toast({
        title: "Incomplete Form",
        description: "Please specify your preferred career path.",
        variant: "destructive"
      });
      return;
    }

    // Validate all questions are answered
    const allQuestionIds = getAllQuestionIds();
    const unanswered = allQuestionIds.filter(id => !ratings[id]);
    if (unanswered.length > 0) {
      toast({
        title: "Incomplete Form",
        description: `Please answer all questions before submitting. (${unanswered.length} unanswered)`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const questionnaireData = {
      user_id: user.id,
      user_name: profile.name,
      grade_level: gradeLevel,
      track: gradeLevel === 'Grade 12' ? track : null,
      sex: sex,
      career_path: careerPath,
      career_path_other: careerPath === 'Other' ? careerPathOther.trim() : null,
      
      // Part II
      dev_meets_needs: ratings.dev_meets_needs,
      dev_design_suitable: ratings.dev_design_suitable,
      dev_dependable_tools: ratings.dev_dependable_tools,
      dev_properly_tested: ratings.dev_properly_tested,
      dev_fulfills_purpose: ratings.dev_fulfills_purpose,
      
      // Part III - Security
      eff_security_protects_data: ratings.eff_security_protects_data,
      eff_security_feels_safe: ratings.eff_security_feels_safe,
      eff_security_auth_prevents_unauthorized: ratings.eff_security_auth_prevents_unauthorized,
      eff_security_confidentiality: ratings.eff_security_confidentiality,
      eff_security_tamper_proof: ratings.eff_security_tamper_proof,
      
      // Part III - Connectivity
      eff_conn_minimal_interruptions: ratings.eff_conn_minimal_interruptions,
      eff_conn_realtime_functions: ratings.eff_conn_realtime_functions,
      eff_conn_syncs_devices: ratings.eff_conn_syncs_devices,
      eff_conn_stable_performance: ratings.eff_conn_stable_performance,
      eff_conn_notifications_timely: ratings.eff_conn_notifications_timely,
      
      // Part III - Scalability
      eff_scale_supports_users: ratings.eff_scale_supports_users,
      eff_scale_handles_data: ratings.eff_scale_handles_data,
      eff_scale_features_remain: ratings.eff_scale_features_remain,
      eff_scale_adapts_upgrades: ratings.eff_scale_adapts_upgrades,
      eff_scale_performs_any_usage: ratings.eff_scale_performs_any_usage,
      
      // Part IV - Security
      imp_security_better_protection: ratings.imp_security_better_protection,
      imp_security_stronger_measures: ratings.imp_security_stronger_measures,
      imp_security_less_breach_concern: ratings.imp_security_less_breach_concern,
      imp_security_more_trust: ratings.imp_security_more_trust,
      imp_security_stronger_auth: ratings.imp_security_stronger_auth,
      
      // Part IV - Scalability
      imp_scale_increased_capacity: ratings.imp_scale_increased_capacity,
      imp_scale_improved_performance: ratings.imp_scale_improved_performance,
      imp_scale_enhanced_data_mgmt: ratings.imp_scale_enhanced_data_mgmt,
      imp_scale_expanded_features: ratings.imp_scale_expanded_features,
      imp_scale_strengthened_stability: ratings.imp_scale_strengthened_stability,
      
      // Part IV - Connectivity
      imp_conn_improved_stability: ratings.imp_conn_improved_stability,
      imp_conn_enhanced_communication: ratings.imp_conn_enhanced_communication,
      imp_conn_weak_signal_support: ratings.imp_conn_weak_signal_support,
      imp_conn_improved_sync: ratings.imp_conn_improved_sync,
      imp_conn_enhanced_reliability: ratings.imp_conn_enhanced_reliability,
      
      // Part V - Accessibility
      acc_device_access: ratings.acc_device_access,
      acc_loads_quickly: ratings.acc_loads_quickly,
      acc_easy_info_access: ratings.acc_easy_info_access,
      acc_accommodates_needs: ratings.acc_accommodates_needs,
      acc_no_interruptions: ratings.acc_no_interruptions,
      
      // Part V - Usability
      usb_user_friendly: ratings.usb_user_friendly,
      usb_well_organized: ratings.usb_well_organized,
      usb_intuitive_interface: ratings.usb_intuitive_interface,
      usb_clear_instructions: ratings.usb_clear_instructions,
      usb_efficient_tasks: ratings.usb_efficient_tasks,
      
      // Part V - Satisfaction
      sat_meets_expectations: ratings.sat_meets_expectations,
      sat_satisfying_experience: ratings.sat_satisfying_experience,
      sat_reliable_performance: ratings.sat_reliable_performance,
      sat_addresses_needs: ratings.sat_addresses_needs,
      sat_positive_impression: ratings.sat_positive_impression,
      
      // Part VI
      feedback: feedback.trim() || null,
    };

    let error;

    if (hasSubmitted) {
      const { error: updateError } = await supabase
        .from('research_questionnaire')
        .update(questionnaireData)
        .eq('user_id', user.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('research_questionnaire')
        .insert(questionnaireData);
      error = insertError;
    }

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your questionnaire. Please try again.",
        variant: "destructive"
      });
      console.error('Questionnaire submission error:', error);
    } else {
      setHasSubmitted(true);
      toast({
        title: "Thank You!",
        description: "Your questionnaire has been submitted successfully.",
      });
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <CrossLogo size={120} />
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <CrossLogo size={50} />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">Research Questionnaire</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Data Gathering Instrument</p>
            </div>
          </div>
        </div>

        {/* Title Card */}
        <Card className="mb-6 shadow-lg border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-primary" />
              <CardTitle className="text-base md:text-lg leading-tight">
                Development of IoT-Based Student Monitoring App for Enhanced Security in the Senior High School Department of Binmaley Catholic School, Inc.
              </CardTitle>
            </div>
            <CardDescription className="text-sm mt-4">
              <strong>Instruction:</strong> Please read each statement carefully and select the option that best describes your answer. 
              Your answer will be treated with confidentiality and used only for research purposes.
            </CardDescription>
          </CardHeader>
        </Card>

        {hasSubmitted && (
          <Card className="mb-6 border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <p>You have already submitted your questionnaire. You can update your responses below.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Part I: Respondent Profile */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Part I. Respondent Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Grade Level <span className="text-destructive">*</span></Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {gradeLevel === 'Grade 12' && (
                <div className="space-y-2">
                  <Label>Track <span className="text-destructive">*</span></Label>
                  <Select value={track} onValueChange={setTrack}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="TVL">Technical Vocational Livelihood (TVL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Sex <span className="text-destructive">*</span></Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Career Path after SHS <span className="text-destructive">*</span></Label>
                <Select value={careerPath} onValueChange={setCareerPath}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select career path" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="Employment">Employment</SelectItem>
                    <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
                    <SelectItem value="Middle-level Skills Development">Middle-level Skills Development</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {careerPath === 'Other' && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Please specify <span className="text-destructive">*</span></Label>
                  <Input 
                    value={careerPathOther} 
                    onChange={(e) => setCareerPathOther(e.target.value)}
                    placeholder="Enter your preferred career path"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Part II: Development */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-primary mb-1">Part II. Development of the IoT-Based Monitoring App</h2>
          <p className="text-sm text-muted-foreground mb-4">
            5 - Strongly Agree &nbsp;|&nbsp; 4 - Agree &nbsp;|&nbsp; 3 - Neutral &nbsp;|&nbsp; 2 - Disagree &nbsp;|&nbsp; 1 - Strongly Disagree
          </p>
        </div>
        <QuestionTable
          title="Development"
          questions={developmentQuestions}
          scale={developmentScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />

        {/* Part III: Perceived Effectiveness */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-primary mb-1">Part III. Perceived Effectiveness of the IoT-Based Student Monitoring App</h2>
          <p className="text-sm text-muted-foreground mb-4">
            5 - Very Effective &nbsp;|&nbsp; 4 - Effective &nbsp;|&nbsp; 3 - Moderately Effective &nbsp;|&nbsp; 2 - Less Effective &nbsp;|&nbsp; 1 - Not Effective
          </p>
        </div>
        <QuestionTable
          title="Security"
          questions={effectivenessSecurityQuestions}
          scale={effectivenessScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />
        <QuestionTable
          title="Connectivity"
          questions={effectivenessConnectivityQuestions}
          scale={effectivenessScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />
        <QuestionTable
          title="Scalability"
          questions={effectivenessScalabilityQuestions}
          scale={effectivenessScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />

        {/* Part IV: Perceived Improvements */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-primary mb-1">Part IV. Perceived Improvements of the IoT-Based Student Monitoring App</h2>
          <p className="text-sm text-muted-foreground mb-4">
            5 - Strongly Agree &nbsp;|&nbsp; 4 - Agree &nbsp;|&nbsp; 3 - Neutral &nbsp;|&nbsp; 2 - Disagree &nbsp;|&nbsp; 1 - Strongly Disagree
          </p>
        </div>
        <QuestionTable
          title="Security"
          questions={improvementsSecurityQuestions}
          scale={developmentScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />
        <QuestionTable
          title="Scalability"
          questions={improvementsScalabilityQuestions}
          scale={developmentScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />
        <QuestionTable
          title="Connectivity"
          questions={improvementsConnectivityQuestions}
          scale={developmentScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />

        {/* Part V: Accessibility, Usability, and User Satisfaction */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-primary mb-1">Part V. Accessibility, Usability, and User Satisfaction</h2>
          <p className="text-sm text-muted-foreground mb-4">
            5 - Very Satisfied &nbsp;|&nbsp; 4 - Satisfied &nbsp;|&nbsp; 3 - Moderately Satisfied &nbsp;|&nbsp; 2 - Less Satisfied &nbsp;|&nbsp; 1 - Not Satisfied
          </p>
        </div>
        <QuestionTable
          title="A. Accessibility"
          questions={accessibilityQuestions}
          scale={satisfactionScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />
        <QuestionTable
          title="B. Usability"
          questions={usabilityQuestions}
          scale={satisfactionScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />
        <QuestionTable
          title="Overall User Satisfaction"
          questions={satisfactionQuestions}
          scale={satisfactionScale}
          ratings={ratings}
          onRatingChange={handleRatingChange}
        />

        {/* Part VI: Feedback */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Part VI. Feedback (Optional)</CardTitle>
            <CardDescription>
              Please share any comments or suggestions to further improve the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your comments or suggestions here..."
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center mb-8">
          <Button 
            size="lg" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="px-8"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                {hasSubmitted ? 'Update Questionnaire' : 'Submit Questionnaire'}
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pb-8">
          <p className="font-medium">Thank you for your honest participation.</p>
          <p>We appreciate you taking the time to complete this survey.</p>
        </div>
      </div>
    </div>
  );
};

export default AppRatings;
