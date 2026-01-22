import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  section: string;
  scanned_at: string;
  status: string;
  parent_notified: boolean;
}

interface GroupedAttendance {
  [studentName: string]: AttendanceRecord[];
}

interface SectionGroupedAttendance {
  [section: string]: GroupedAttendance;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'present':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'late':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'half_day':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'absent':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const AdminAttendance = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionGroupedAttendance, setSectionGroupedAttendance] = useState<SectionGroupedAttendance>({});

  if (userRole !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  useEffect(() => {
    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(500);

      if (!error && data) {
        setAttendance(data);
        // Group by section, then by student name
        const grouped = data.reduce((acc: SectionGroupedAttendance, record) => {
          if (!acc[record.section]) {
            acc[record.section] = {};
          }
          if (!acc[record.section][record.student_name]) {
            acc[record.section][record.student_name] = [];
          }
          acc[record.section][record.student_name].push(record);
          return acc;
        }, {});
        setSectionGroupedAttendance(grouped);
      }
      setLoading(false);
    };

    fetchAttendance();

    // Set up real-time subscription
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          const newRecord = payload.new as AttendanceRecord;
          setAttendance((prev) => [newRecord, ...prev]);
          setSectionGroupedAttendance((prev) => {
            const updated = { ...prev };
            if (!updated[newRecord.section]) {
              updated[newRecord.section] = {};
            }
            if (!updated[newRecord.section][newRecord.student_name]) {
              updated[newRecord.section][newRecord.student_name] = [];
            }
            updated[newRecord.section][newRecord.student_name] = [newRecord, ...updated[newRecord.section][newRecord.student_name]];
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CrossLogo size={80} />
            </div>
            <CardTitle className="text-2xl">Attendance Records</CardTitle>
            <CardDescription>
              Student attendance organized by name
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading records...</p>
              </div>
            ) : Object.keys(sectionGroupedAttendance).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No attendance records yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Records will appear here once students scan their QR codes
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(sectionGroupedAttendance)
                  .sort(([sectionA], [sectionB]) => sectionA.localeCompare(sectionB))
                  .map(([section, studentRecords]) => {
                    const totalRecords = Object.values(studentRecords).reduce((sum, records) => sum + records.length, 0);
                    const totalStudents = Object.keys(studentRecords).length;
                    
                    return (
                      <AccordionItem key={section} value={section} className="border rounded-lg mb-3 px-4 bg-muted/30">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="text-left">
                              <p className="font-bold text-xl text-primary">{section}</p>
                              <p className="text-sm text-muted-foreground">
                                {totalStudents} student{totalStudents !== 1 ? 's' : ''} • {totalRecords} record{totalRecords !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Accordion type="single" collapsible className="w-full pl-2">
                            {Object.entries(studentRecords)
                              .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                              .map(([studentName, records]) => (
                                <AccordionItem key={`${section}-${studentName}`} value={studentName} className="border rounded-lg mb-2 px-3">
                                  <AccordionTrigger className="hover:no-underline py-3">
                                    <div className="flex items-center justify-between w-full pr-4">
                                      <div className="text-left">
                                        <p className="font-semibold text-base">{studentName}</p>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {records.length} record{records.length !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-3 pt-2">
                                      {records.map((record) => (
                                        <Card key={record.id} className="border-l-4 border-l-primary/50">
                                          <CardContent className="py-3">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                  {format(new Date(record.scanned_at), 'EEEE, MMM d, yyyy')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  {format(new Date(record.scanned_at), 'h:mm a')}
                                                </p>
                                              </div>
                                              <div className="flex-1 text-left md:text-right">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                                                  {record.status === 'half_day' ? 'Half Day' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                                {record.parent_notified && (
                                                  <p className="text-xs text-muted-foreground mt-1">Parent notified</p>
                                                )}
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAttendance;
