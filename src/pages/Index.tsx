import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CrossLogo } from '@/components/CrossLogo';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

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
};

export default Index;
