import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CrossLogo } from '@/components/CrossLogo';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import HolidayPopup from '@/components/HolidayPopup';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, profile, loading, profileChecked, signOut } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (profileChecked && (!userRole || !profile)) {
        // User exists in auth but profile/role is missing (common after DB data was cleared)
        console.log('[Dashboard] User missing profile/role, signing out');
        signOut().then(() => navigate('/auth'));
      }
    }
  }, [user, userRole, profile, loading, profileChecked, navigate, signOut]);

  if (loading || (user && !profileChecked)) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="relative">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 100 100" 
            className="animate-pulse"
          >
            <defs>
              <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="[stop-color:hsl(var(--primary))]" />
                <stop offset="100%" className="[stop-color:hsl(var(--primary))]" style={{ stopOpacity: 0.6 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect 
              x="40" 
              y="10" 
              width="20" 
              height="80" 
              rx="4" 
              fill="url(#crossGradient)"
              filter="url(#glow)"
              className="animate-pulse"
            />
            <rect 
              x="20" 
              y="30" 
              width="60" 
              height="20" 
              rx="4" 
              fill="url(#crossGradient)"
              filter="url(#glow)"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      <HolidayPopup />
      {userRole === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </>
  );
};

export default Dashboard;