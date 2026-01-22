import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, BarChart3, Users, Star, TrendingUp, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Questionnaire {
  id: string;
  user_id: string;
  user_name: string;
  grade_level: string;
  track: string | null;
  sex: string;
  career_path: string;
  career_path_other: string | null;
  feedback: string | null;
  created_at: string;
  // Development
  dev_meets_needs: number | null;
  dev_design_suitable: number | null;
  dev_dependable_tools: number | null;
  dev_properly_tested: number | null;
  dev_fulfills_purpose: number | null;
  // Effectiveness - Security
  eff_security_protects_data: number | null;
  eff_security_feels_safe: number | null;
  eff_security_auth_prevents_unauthorized: number | null;
  eff_security_confidentiality: number | null;
  eff_security_tamper_proof: number | null;
  // Effectiveness - Connectivity
  eff_conn_minimal_interruptions: number | null;
  eff_conn_realtime_functions: number | null;
  eff_conn_syncs_devices: number | null;
  eff_conn_stable_performance: number | null;
  eff_conn_notifications_timely: number | null;
  // Effectiveness - Scalability
  eff_scale_supports_users: number | null;
  eff_scale_handles_data: number | null;
  eff_scale_features_remain: number | null;
  eff_scale_adapts_upgrades: number | null;
  eff_scale_performs_any_usage: number | null;
  // Improvements - Security
  imp_security_better_protection: number | null;
  imp_security_stronger_measures: number | null;
  imp_security_less_breach_concern: number | null;
  imp_security_more_trust: number | null;
  imp_security_stronger_auth: number | null;
  // Improvements - Scalability
  imp_scale_increased_capacity: number | null;
  imp_scale_improved_performance: number | null;
  imp_scale_enhanced_data_mgmt: number | null;
  imp_scale_expanded_features: number | null;
  imp_scale_strengthened_stability: number | null;
  // Improvements - Connectivity
  imp_conn_improved_stability: number | null;
  imp_conn_enhanced_communication: number | null;
  imp_conn_weak_signal_support: number | null;
  imp_conn_improved_sync: number | null;
  imp_conn_enhanced_reliability: number | null;
  // Accessibility
  acc_device_access: number | null;
  acc_loads_quickly: number | null;
  acc_easy_info_access: number | null;
  acc_accommodates_needs: number | null;
  acc_no_interruptions: number | null;
  // Usability
  usb_user_friendly: number | null;
  usb_well_organized: number | null;
  usb_intuitive_interface: number | null;
  usb_clear_instructions: number | null;
  usb_efficient_tasks: number | null;
  // Satisfaction
  sat_meets_expectations: number | null;
  sat_satisfying_experience: number | null;
  sat_reliable_performance: number | null;
  sat_addresses_needs: number | null;
  sat_positive_impression: number | null;
}

const sectionLabels: Record<string, Record<string, string>> = {
  development: {
    dev_meets_needs: 'Meets specific needs',
    dev_design_suitable: 'Design suitable',
    dev_dependable_tools: 'Dependable tools',
    dev_properly_tested: 'Properly tested',
    dev_fulfills_purpose: 'Fulfills purpose',
  },
  eff_security: {
    eff_security_protects_data: 'Protects data',
    eff_security_feels_safe: 'Feels safe',
    eff_security_auth_prevents_unauthorized: 'Auth prevents unauthorized',
    eff_security_confidentiality: 'Maintains confidentiality',
    eff_security_tamper_proof: 'Tamper proof',
  },
  eff_connectivity: {
    eff_conn_minimal_interruptions: 'Minimal interruptions',
    eff_conn_realtime_functions: 'Real-time functions',
    eff_conn_syncs_devices: 'Syncs devices',
    eff_conn_stable_performance: 'Stable performance',
    eff_conn_notifications_timely: 'Timely notifications',
  },
  eff_scalability: {
    eff_scale_supports_users: 'Supports users',
    eff_scale_handles_data: 'Handles data',
    eff_scale_features_remain: 'Features remain effective',
    eff_scale_adapts_upgrades: 'Adapts to upgrades',
    eff_scale_performs_any_usage: 'Performs any usage',
  },
  imp_security: {
    imp_security_better_protection: 'Better protection',
    imp_security_stronger_measures: 'Stronger measures',
    imp_security_less_breach_concern: 'Less breach concern',
    imp_security_more_trust: 'More trust',
    imp_security_stronger_auth: 'Stronger auth',
  },
  imp_scalability: {
    imp_scale_increased_capacity: 'Increased capacity',
    imp_scale_improved_performance: 'Improved performance',
    imp_scale_enhanced_data_mgmt: 'Enhanced data mgmt',
    imp_scale_expanded_features: 'Expanded features',
    imp_scale_strengthened_stability: 'Strengthened stability',
  },
  imp_connectivity: {
    imp_conn_improved_stability: 'Improved stability',
    imp_conn_enhanced_communication: 'Enhanced communication',
    imp_conn_weak_signal_support: 'Weak signal support',
    imp_conn_improved_sync: 'Improved sync',
    imp_conn_enhanced_reliability: 'Enhanced reliability',
  },
  accessibility: {
    acc_device_access: 'Device access',
    acc_loads_quickly: 'Loads quickly',
    acc_easy_info_access: 'Easy info access',
    acc_accommodates_needs: 'Accommodates needs',
    acc_no_interruptions: 'No interruptions',
  },
  usability: {
    usb_user_friendly: 'User friendly',
    usb_well_organized: 'Well organized',
    usb_intuitive_interface: 'Intuitive interface',
    usb_clear_instructions: 'Clear instructions',
    usb_efficient_tasks: 'Efficient tasks',
  },
  satisfaction: {
    sat_meets_expectations: 'Meets expectations',
    sat_satisfying_experience: 'Satisfying experience',
    sat_reliable_performance: 'Reliable performance',
    sat_addresses_needs: 'Addresses needs',
    sat_positive_impression: 'Positive impression',
  },
};

const sectionTitles: Record<string, string> = {
  development: 'Development',
  eff_security: 'Effectiveness - Security',
  eff_connectivity: 'Effectiveness - Connectivity',
  eff_scalability: 'Effectiveness - Scalability',
  imp_security: 'Improvements - Security',
  imp_scalability: 'Improvements - Scalability',
  imp_connectivity: 'Improvements - Connectivity',
  accessibility: 'Accessibility',
  usability: 'Usability',
  satisfaction: 'User Satisfaction',
};

const AdminRatings = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Questionnaire | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('research_questionnaire')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questionnaires:', error);
      toast({
        title: "Error",
        description: "Failed to load questionnaire data.",
        variant: "destructive"
      });
    } else {
      setQuestionnaires(data || []);
    }
    setIsLoading(false);
  };

  const calculateSectionAverage = (section: string, data: Questionnaire[]) => {
    const keys = Object.keys(sectionLabels[section]);
    let sum = 0;
    let count = 0;

    data.forEach(q => {
      keys.forEach(key => {
        const value = q[key as keyof Questionnaire];
        if (typeof value === 'number') {
          sum += value;
          count++;
        }
      });
    });

    return count > 0 ? sum / count : 0;
  };

  const statistics = useMemo(() => {
    if (questionnaires.length === 0) return null;

    const sectionAverages: Record<string, number> = {};
    Object.keys(sectionLabels).forEach(section => {
      sectionAverages[section] = calculateSectionAverage(section, questionnaires);
    });

    const overallAvg = Object.values(sectionAverages).reduce((a, b) => a + b, 0) / Object.keys(sectionAverages).length;

    const highestSection = Object.entries(sectionAverages).sort((a, b) => b[1] - a[1])[0];

    return {
      sectionAverages,
      overallAvg,
      totalResponses: questionnaires.length,
      highestSection: highestSection ? { name: sectionTitles[highestSection[0]], avg: highestSection[1] } : null,
    };
  }, [questionnaires]);

  const demographicStats = useMemo(() => {
    const grades: Record<string, number> = {};
    const sexes: Record<string, number> = {};
    const tracks: Record<string, number> = {};
    const careers: Record<string, number> = {};

    questionnaires.forEach(q => {
      grades[q.grade_level] = (grades[q.grade_level] || 0) + 1;
      sexes[q.sex] = (sexes[q.sex] || 0) + 1;
      if (q.track) tracks[q.track] = (tracks[q.track] || 0) + 1;
      careers[q.career_path] = (careers[q.career_path] || 0) + 1;
    });

    return { grades, sexes, tracks, careers };
  }, [questionnaires]);

  const exportToCSV = () => {
    if (questionnaires.length === 0) {
      toast({
        title: "No Data",
        description: "There are no questionnaires to export.",
        variant: "destructive"
      });
      return;
    }

    const allKeys = Object.values(sectionLabels).flatMap(s => Object.keys(s));
    
    const headers = [
      'Respondent Name',
      'Grade Level',
      'Track',
      'Sex',
      'Career Path',
      'Career Path Other',
      ...allKeys,
      'Feedback',
      'Submitted At'
    ];

    const rows = questionnaires.map(q => [
      q.user_name,
      q.grade_level,
      q.track || '',
      q.sex,
      q.career_path,
      q.career_path_other || '',
      ...allKeys.map(key => q[key as keyof Questionnaire] ?? ''),
      `"${(q.feedback || '').replace(/"/g, '""')}"`,
      new Date(q.created_at).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `research_questionnaire_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Export Successful",
      description: `Exported ${questionnaires.length} questionnaires to CSV.`
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 dark:text-green-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const openResponseDetails = (response: Questionnaire) => {
    setSelectedResponse(response);
    setResponseDialogOpen(true);
  };

  const navigateResponse = (direction: 'prev' | 'next') => {
    if (!selectedResponse) return;
    const currentIndex = questionnaires.findIndex(q => q.id === selectedResponse.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < questionnaires.length) {
      setSelectedResponse(questionnaires[newIndex]);
    }
  };

  const getCurrentResponseIndex = () => {
    if (!selectedResponse) return 0;
    return questionnaires.findIndex(q => q.id === selectedResponse.id) + 1;
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
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <CrossLogo size={50} />
              <div>
                <h1 className="text-2xl font-bold text-primary">Research Questionnaire Dashboard</h1>
                <p className="text-sm text-muted-foreground">IoT-Based Student Monitoring App Research</p>
              </div>
            </div>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading questionnaire data...</p>
          </div>
        ) : (
          <>
            {/* Summary Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <CardDescription>Total Responses</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    {statistics?.totalResponses || 0}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <CardDescription>Overall Average</CardDescription>
                  <CardTitle className={`text-3xl flex items-center gap-2 ${statistics ? getScoreColor(statistics.overallAvg) : ''}`}>
                    <Star className="h-6 w-6" />
                    {statistics?.overallAvg.toFixed(2) || '0.00'} / 5
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <CardDescription>Highest Rated Section</CardDescription>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    {statistics?.highestSection ? (
                      <>
                        {statistics.highestSection.name}
                        <span className="text-green-600 dark:text-green-400 ml-1">
                          ({statistics.highestSection.avg.toFixed(2)})
                        </span>
                      </>
                    ) : 'N/A'}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <CardDescription>Categories Analyzed</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    {Object.keys(sectionLabels).length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Demographics */}
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Respondent Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Grade Level</h4>
                    <div className="space-y-1">
                      {Object.entries(demographicStats.grades).map(([grade, count]) => (
                        <div key={grade} className="flex justify-between text-sm">
                          <span>{grade}</span>
                          <span className="font-bold text-primary">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Sex</h4>
                    <div className="space-y-1">
                      {Object.entries(demographicStats.sexes).map(([sex, count]) => (
                        <div key={sex} className="flex justify-between text-sm">
                          <span>{sex}</span>
                          <span className="font-bold text-primary">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Track (Grade 12)</h4>
                    <div className="space-y-1">
                      {Object.entries(demographicStats.tracks).length > 0 ? (
                        Object.entries(demographicStats.tracks).map(([track, count]) => (
                          <div key={track} className="flex justify-between text-sm">
                            <span>{track}</span>
                            <span className="font-bold text-primary">{count}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Career Path</h4>
                    <div className="space-y-1">
                      {Object.entries(demographicStats.careers).map(([career, count]) => (
                        <div key={career} className="flex justify-between text-sm">
                          <span>{career}</span>
                          <span className="font-bold text-primary">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Scores by Section */}
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Average Scores by Section
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics && Object.entries(statistics.sectionAverages).map(([key, avg]) => (
                    <div key={key} className="flex items-center gap-4">
                      <div className="w-56 text-sm font-medium">{sectionTitles[key]}</div>
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            avg >= 4 ? 'bg-green-500' : avg >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(avg / 5) * 100}%` }}
                        />
                      </div>
                      <div className={`w-16 text-right font-bold ${getScoreColor(avg)}`}>
                        {avg.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Scores by Category */}
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Detailed Scores by Category</CardTitle>
                <CardDescription>Click on each tab to see individual question averages</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="development" className="w-full">
                  <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
                    {Object.keys(sectionLabels).map(section => (
                      <TabsTrigger key={section} value={section} className="text-xs">
                        {sectionTitles[section]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(sectionLabels).map(([section, questions]) => (
                    <TabsContent key={section} value={section}>
                      <div className="space-y-3">
                        {Object.entries(questions).map(([key, label]) => {
                          let sum = 0;
                          let count = 0;
                          questionnaires.forEach(q => {
                            const val = q[key as keyof Questionnaire];
                            if (typeof val === 'number') {
                              sum += val;
                              count++;
                            }
                          });
                          const avg = count > 0 ? sum / count : 0;

                          return (
                            <div key={key} className="flex items-center gap-4">
                              <div className="w-64 text-sm">{label}</div>
                              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    avg >= 4 ? 'bg-green-500' : avg >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(avg / 5) * 100}%` }}
                                />
                              </div>
                              <div className={`w-16 text-right font-bold ${getScoreColor(avg)}`}>
                                {avg.toFixed(2)}
                              </div>
                              <div className="w-20 text-right text-sm text-muted-foreground">
                                ({count} resp.)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Individual Responses Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>All Responses ({questionnaires.length})</CardTitle>
                <CardDescription>Individual questionnaire submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {questionnaires.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No questionnaires submitted yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Track</TableHead>
                          <TableHead>Sex</TableHead>
                          <TableHead>Career Path</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-center">View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questionnaires.map((q) => (
                          <TableRow 
                            key={q.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openResponseDetails(q)}
                          >
                            <TableCell className="font-medium">{q.user_name}</TableCell>
                            <TableCell>{q.grade_level}</TableCell>
                            <TableCell>{q.track || '-'}</TableCell>
                            <TableCell>{q.sex}</TableCell>
                            <TableCell>
                              {q.career_path}
                              {q.career_path_other && ` (${q.career_path_other})`}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(q.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openResponseDetails(q); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback */}
            {questionnaires.some(q => q.feedback) && (
              <Card className="shadow-lg mt-8">
                <CardHeader>
                  <CardTitle>Feedback (Optional Responses)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questionnaires.filter(q => q.feedback).map((q) => (
                    <div key={q.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{q.user_name}</span>
                        <span className="text-sm text-muted-foreground">({q.grade_level})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{q.feedback}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Individual Response Dialog */}
            <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl">Individual Response</DialogTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateResponse('prev')}
                        disabled={getCurrentResponseIndex() <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                        {getCurrentResponseIndex()} of {questionnaires.length}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateResponse('next')}
                        disabled={getCurrentResponseIndex() >= questionnaires.length}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                
                {selectedResponse && (
                  <ScrollArea className="h-[70vh] pr-4">
                    {/* Respondent Info */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-lg mb-3">{selectedResponse.user_name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Grade Level:</span>
                          <p className="font-medium">{selectedResponse.grade_level}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sex:</span>
                          <p className="font-medium">{selectedResponse.sex}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Track:</span>
                          <p className="font-medium">{selectedResponse.track || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Career Path:</span>
                          <p className="font-medium">
                            {selectedResponse.career_path}
                            {selectedResponse.career_path_other && ` (${selectedResponse.career_path_other})`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        Submitted: {new Date(selectedResponse.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* All Ratings by Section */}
                    <div className="space-y-6">
                      {Object.entries(sectionLabels).map(([sectionKey, questions]) => (
                        <div key={sectionKey} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-primary mb-4">{sectionTitles[sectionKey]}</h4>
                          <div className="space-y-3">
                            {Object.entries(questions).map(([questionKey, questionLabel]) => {
                              const value = selectedResponse[questionKey as keyof Questionnaire];
                              const score = typeof value === 'number' ? value : null;
                              
                              return (
                                <div key={questionKey} className="flex items-center justify-between gap-4">
                                  <span className="text-sm flex-1">{questionLabel}</span>
                                  {score !== null ? (
                                    <Badge className={`${getScoreBg(score)} min-w-[50px] justify-center`}>
                                      {score} / 5
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="min-w-[50px] justify-center">
                                      N/A
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Feedback Section */}
                      {selectedResponse.feedback && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-primary mb-3">Additional Feedback</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedResponse.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>CathoLink — Research Questionnaire Analysis Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRatings;
