import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, LogOut, ScanLine, ClipboardList, Clock, Star, Users, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    setIsThemeTransitioning(true);
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
    
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setIsThemeTransitioning(false);
    }, 300);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = [
    {
      icon: ScanLine,
      label: 'Scan QR',
      description: 'Record attendance',
      path: '/admin/scanner',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: ClipboardList,
      label: 'Attendance',
      description: 'View all records',
      path: '/admin/attendance',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      icon: Clock,
      label: 'Late Comers',
      description: 'View late arrivals',
      path: '/admin/late-comers',
      color: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
    {
      icon: Users,
      label: 'Students',
      description: 'View profiles',
      path: '/admin/students',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Star,
      label: 'Ratings',
      description: 'View feedback',
      path: '/admin/ratings',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  const bottomNavItems = [
    { icon: Home, label: 'Home', path: '/admin' },
    { icon: ScanLine, label: 'Scan', path: '/admin/scanner' },
    { icon: ClipboardList, label: 'Logs', path: '/admin/attendance' },
    { icon: Users, label: 'Students', path: '/admin/students' },
  ];

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <CrossLogo size={40} />
            <div>
              <h1 className="text-lg font-bold text-primary">CathoLink</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode} 
              className="h-9 w-9"
            >
              {darkMode ? (
                <Sun className={`h-4 w-4 ${isThemeTransitioning ? 'animate-spin-once' : ''}`} />
              ) : (
                <Moon className={`h-4 w-4 ${isThemeTransitioning ? 'animate-spin-once' : ''}`} />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-5 mb-6 text-primary-foreground animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary-foreground/20 animate-fade-in-scale">
              <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.name} />
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-lg font-semibold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-primary-foreground/80">Welcome back,</p>
              <h2 className="text-xl font-bold">Admin {profile.name}</h2>
              <p className="text-sm text-primary-foreground/80">Manage attendance & records</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Title */}
        <div className="mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Manage your school</p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 active:scale-95 opacity-0 animate-fade-in-scale group"
              style={{ animationDelay: `${0.15 + index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mb-3 group-hover:animate-bounce-subtle transition-transform`}>
                <item.icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground text-center mt-1">{item.description}</span>
            </button>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <p className="text-xs text-muted-foreground">CathoLink — Faith. Attendance. Connection.</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 animate-slide-in-bottom">
        <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-primary bg-primary/10 scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'text-primary animate-bounce-subtle' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
