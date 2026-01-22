import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StudentQRCode from "./pages/StudentQRCode";
import StudentAttendance from "./pages/StudentAttendance";
import StudentProfile from "./pages/StudentProfile";
import AdminScanner from "./pages/AdminScanner";
import AdminAttendance from "./pages/AdminAttendance";
import AdminStudentProfiles from "./pages/AdminStudentProfiles";
import LateComers from "./pages/LateComers";
import AppRatings from "./pages/AppRatings";
import AdminRatings from "./pages/AdminRatings";

import Terms from "./pages/Terms";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student/qr-code" element={<StudentQRCode />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/admin/scanner" element={<AdminScanner />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/students" element={<AdminStudentProfiles />} />
            <Route path="/admin/late-comers" element={<LateComers />} />
            <Route path="/ratings" element={<AppRatings />} />
            <Route path="/admin/ratings" element={<AdminRatings />} />
            
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
