import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrossLogo } from '@/components/CrossLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Search, User, Mail, Phone, Users, Calendar, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudentProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  section: string | null;
  adviser_name: string | null;
  parent_guardian_name: string | null;
  parent_number: string | null;
  birthday: string | null;
  profile_picture_url: string | null;
}

const AdminStudentProfiles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter(
          (student) =>
            student.name.toLowerCase().includes(term) ||
            student.email.toLowerCase().includes(term) ||
            (student.section && student.section.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      // Get all student user_ids from user_roles
      const { data: studentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      if (rolesError) throw rolesError;

      if (!studentRoles || studentRoles.length === 0) {
        setStudents([]);
        setFilteredStudents([]);
        setLoading(false);
        return;
      }

      const studentUserIds = studentRoles.map((r) => r.user_id);

      // Get profiles for those students
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentUserIds)
        .order('name');

      if (profilesError) throw profilesError;

      setStudents(profiles || []);
      setFilteredStudents(profiles || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading students',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const openProfileModal = (student: StudentProfile) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <CrossLogo size={120} clickable={false} />
          <p className="mt-4 text-lg text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Student Profiles</CardTitle>
                <CardDescription>
                  View all registered student profiles ({students.length} students)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {filteredStudents.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                {searchTerm ? 'No students found matching your search.' : 'No students registered yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                className="shadow-lg hover:shadow-xl smooth-transition cursor-pointer border-2 hover:border-primary"
                onClick={() => openProfileModal(student)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {student.profile_picture_url ? (
                        <img
                          src={student.profile_picture_url}
                          alt={student.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg truncate">{student.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      {student.section && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                          {student.section}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Student Profile Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col [&>button]:hidden">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Student Profile
              </DialogTitle>
            </DialogHeader>

            {selectedStudent && (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-4">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center">
                      {selectedStudent.profile_picture_url ? (
                        <img
                          src={selectedStudent.profile_picture_url}
                          alt={selectedStudent.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-14 w-14 sm:h-16 sm:w-16 text-primary" />
                      )}
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl sm:text-2xl font-bold">{selectedStudent.name}</h2>
                      {selectedStudent.section && (
                        <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                          {selectedStudent.section}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <Label className="text-muted-foreground text-sm">Email</Label>
                        <p className="text-base sm:text-lg break-all">{selectedStudent.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <Label className="text-muted-foreground text-sm">Phone Number</Label>
                        <p className="text-base sm:text-lg">{selectedStudent.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserCheck className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <Label className="text-muted-foreground text-sm">Adviser</Label>
                        <p className="text-base sm:text-lg">{selectedStudent.adviser_name || 'Not assigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <Label className="text-muted-foreground text-sm">Parent/Guardian</Label>
                        <p className="text-base sm:text-lg">{selectedStudent.parent_guardian_name || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <Label className="text-muted-foreground text-sm">Parent Contact Number</Label>
                        <p className="text-base sm:text-lg">{selectedStudent.parent_number || 'Not provided'}</p>
                      </div>
                    </div>

                    {selectedStudent.birthday && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <Label className="text-muted-foreground text-sm">Birthday</Label>
                          <p className="text-base sm:text-lg">
                            {new Date(selectedStudent.birthday).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}

            <div className="flex-shrink-0 border-t pt-4">
              <Button onClick={closeModal} className="w-full">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminStudentProfiles;
