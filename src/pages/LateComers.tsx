import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, Sun, Sunset, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface LateRecord {
  id: string;
  student_name: string;
  section: string;
  scanned_at: string;
  period: "morning" | "afternoon";
}

interface SectionStats {
  section: string;
  morningCount: number;
  afternoonCount: number;
  total: number;
}

const LateComers = () => {
  const navigate = useNavigate();
  const { userRole, loading } = useAuth();
  const [lateRecords, setLateRecords] = useState<LateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && userRole !== "admin") {
      navigate("/dashboard");
    }
  }, [loading, userRole, navigate]);

  useEffect(() => {
    const fetchLateComers = async () => {
      setIsLoading(true);
      
      // Fetch attendance records with late status
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("id, scanned_at, status, student_id")
        .eq("status", "late")
        .order("scanned_at", { ascending: false });

      if (attendanceError) {
        console.error("Error fetching late comers:", attendanceError);
        setIsLoading(false);
        return;
      }

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name, section");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setIsLoading(false);
        return;
      }

      // Create a map of profiles by user_id (not id)
      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.user_id, { name: p.name, section: p.section }])
      );

      const processedRecords: LateRecord[] = (attendanceData || []).map((record: any) => {
        const scannedDate = new Date(record.scanned_at);
        const hours = scannedDate.getHours();
        const minutes = scannedDate.getMinutes();
        const timeInMinutes = hours * 60 + minutes;

        // Morning: 8:30 AM (510) - 12:00 PM (720)
        // Afternoon: 1:30 PM (810) - 4:00 PM (960)
        const isMorning = timeInMinutes >= 510 && timeInMinutes < 720;
        const period: "morning" | "afternoon" = isMorning ? "morning" : "afternoon";

        const profile = profilesMap.get(record.student_id);

        return {
          id: record.id,
          student_name: profile?.name || "Unknown",
          section: profile?.section || "N/A",
          scanned_at: record.scanned_at,
          period,
        };
      });

      setLateRecords(processedRecords);
      setIsLoading(false);
    };

    fetchLateComers();

    const channel = supabase
      .channel("late-comers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance" },
        () => fetchLateComers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const morningRecords = lateRecords.filter((r) => r.period === "morning");
  const afternoonRecords = lateRecords.filter((r) => r.period === "afternoon");

  // Calculate section statistics
  const sectionStats = useMemo((): SectionStats[] => {
    const statsMap = new Map<string, SectionStats>();
    
    lateRecords.forEach((record) => {
      const existing = statsMap.get(record.section) || {
        section: record.section,
        morningCount: 0,
        afternoonCount: 0,
        total: 0,
      };
      
      if (record.period === "morning") {
        existing.morningCount++;
      } else {
        existing.afternoonCount++;
      }
      existing.total++;
      
      statsMap.set(record.section, existing);
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
  }, [lateRecords]);

  const renderTable = (records: LateRecord[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Time Arrived</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No late comers recorded
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.student_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{record.section}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="destructive" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(record.scanned_at), "hh:mm a")}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(record.scanned_at), "MMM dd, yyyy")}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-destructive/10 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{lateRecords.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Sun className="h-4 w-4" /> Morning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{morningRecords.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Sunset className="h-4 w-4" /> Afternoon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{afternoonRecords.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Section Breakdown */}
        {sectionStats.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Late Count by Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-center">Morning</TableHead>
                    <TableHead className="text-center">Afternoon</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionStats.map((stat) => (
                    <TableRow key={stat.section}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{stat.section}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{stat.morningCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{stat.afternoonCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive">{stat.total}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Detailed Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              Late Comers Details
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Morning: 8:30 AM - 12:00 PM | Afternoon: 1:30 PM - 4:00 PM
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="morning" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="morning" className="gap-2">
                  <Sun className="h-4 w-4" />
                  Morning ({morningRecords.length})
                </TabsTrigger>
                <TabsTrigger value="afternoon" className="gap-2">
                  <Sunset className="h-4 w-4" />
                  Afternoon ({afternoonRecords.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="morning">
                {renderTable(morningRecords)}
              </TabsContent>
              <TabsContent value="afternoon">
                {renderTable(afternoonRecords)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LateComers;
