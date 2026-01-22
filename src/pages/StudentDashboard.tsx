import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, LogOut, QrCode, Calendar, User, Star, Home, HelpCircle, Sparkles, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import TutorialGuide, { useTutorial } from '@/components/TutorialGuide';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const motivationalQuotes = [
  { quote: "Education is the passport to the future.", author: "Malcolm X" },
  { quote: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { quote: "Your attitude determines your direction.", author: "Unknown" },
  { quote: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { quote: "Every day is a chance to be better.", author: "Unknown" },
  { quote: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { quote: "With God, all things are possible.", author: "Matthew 19:26" },
  { quote: "Faith is taking the first step even when you can't see the whole staircase.", author: "Martin Luther King Jr." },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const { showTutorial, openTutorial, closeTutorial } = useTutorial();
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  // Show random quote after a delay
  useEffect(() => {
    const showInitialQuote = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCurrentQuote(motivationalQuotes[randomIndex]);
      setShowQuote(true);
    }, 1500);

    return () => clearTimeout(showInitialQuote);
  }, []);

  // Auto-hide quote after 8 seconds
  useEffect(() => {
    if (showQuote) {
      const hideQuote = setTimeout(() => {
        setShowQuote(false);
      }, 8000);
      return () => clearTimeout(hideQuote);
    }
  }, [showQuote]);

  const showNewQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
    setShowQuote(true);
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
      icon: QrCode,
      label: 'QR Code',
      description: 'Generate your attendance QR',
      path: '/student/qr-code',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Calendar,
      label: 'Attendance',
      description: 'View your records',
      path: '/student/attendance',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      icon: User,
      label: 'Profile',
      description: 'Manage your info',
      path: '/student/profile',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Star,
      label: 'Rate App',
      description: 'Share feedback',
      path: '/ratings',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  const bottomNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: QrCode, label: 'QR Code', path: '/student/qr-code' },
    { icon: Calendar, label: 'Attendance', path: '/student/attendance' },
    { icon: User, label: 'Profile', path: '/student/profile' },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <CrossLogo size={120} />
          <p className="mt-4 text-lg text-muted-foreground">Loading your profile...</p>
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
      {/* Tutorial */}
      <TutorialGuide isOpen={showTutorial} onClose={closeTutorial} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <CrossLogo size={40} />
            <div>
              <h1 className="text-lg font-bold text-primary">CathoLink</h1>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={openTutorial} 
              className="h-9 w-9"
              title="View Tutorial"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
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
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-5 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20 animate-fade-in-scale">
              <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">Section: {profile.section}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Title */}
        <div className="mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">What would you like to do?</p>
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
        <div className="mt-8 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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

      {/* Peeking Priest Character with Quote */}
      {showQuote && (
        <div className="fixed bottom-20 right-0 z-40 animate-peek-in flex items-end">
          {/* Speech Bubble */}
          <div className="relative bg-card border border-border rounded-2xl rounded-br-none p-3 shadow-lg max-w-[200px] mb-16 mr-[-12px]">
            <button 
              onClick={() => setShowQuote(false)}
              className="absolute -top-2 -left-2 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="text-xs text-foreground italic leading-relaxed">"{currentQuote.quote}"</p>
            <p className="text-[10px] text-muted-foreground mt-1">— {currentQuote.author}</p>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-card"></div>
            <div className="absolute -bottom-[10px] right-6 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-border -z-10"></div>
          </div>
          
          {/* Animated Cartoon Priest */}
          <div className="relative w-20 h-32 animate-float cursor-pointer" onClick={showNewQuote}>
            <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-lg">
              {/* Cassock/Robe - Black with flowing bottom */}
              <ellipse cx="50" cy="135" rx="28" ry="8" fill="#1a1a1a" />
              <path d="M25 65 Q20 100 22 130 Q50 135 78 130 Q80 100 75 65 Z" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1">
                <animate attributeName="d" dur="2s" repeatCount="indefinite" 
                  values="M25 65 Q20 100 22 130 Q50 135 78 130 Q80 100 75 65 Z;
                          M25 65 Q18 100 20 130 Q50 137 80 130 Q82 100 75 65 Z;
                          M25 65 Q20 100 22 130 Q50 135 78 130 Q80 100 75 65 Z"/>
              </path>
              
              {/* Cassock buttons */}
              <circle cx="50" cy="75" r="2" fill="#2a2a2a"/>
              <circle cx="50" cy="85" r="2" fill="#2a2a2a"/>
              <circle cx="50" cy="95" r="2" fill="#2a2a2a"/>
              <circle cx="50" cy="105" r="2" fill="#2a2a2a"/>
              
              {/* Roman Collar - White */}
              <rect x="38" y="58" width="24" height="8" rx="2" fill="white" stroke="#e0e0e0" strokeWidth="0.5"/>
              <rect x="46" y="56" width="8" height="12" rx="1" fill="white" stroke="#e0e0e0" strokeWidth="0.5"/>
              
              {/* Head - Cartoon style with warm skin tone */}
              <ellipse cx="50" cy="38" rx="22" ry="24" fill="#fcd5b8" stroke="#e8b89a" strokeWidth="1"/>
              
              {/* Ears */}
              <ellipse cx="28" cy="40" rx="5" ry="7" fill="#fcd5b8" stroke="#e8b89a" strokeWidth="1"/>
              <ellipse cx="72" cy="40" rx="5" ry="7" fill="#fcd5b8" stroke="#e8b89a" strokeWidth="1"/>
              
              {/* Hair - Gray/white for elderly priest look */}
              <path d="M30 28 Q35 15 50 12 Q65 15 70 28 Q72 22 68 18 Q55 8 50 8 Q45 8 32 18 Q28 22 30 28" fill="#a0a0a0" stroke="#888" strokeWidth="0.5"/>
              
              {/* Eyebrows - Friendly arched */}
              <path d="M36 28 Q40 25 44 28" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              <path d="M56 28 Q60 25 64 28" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Eyes - Big cartoon Mickey style */}
              <ellipse cx="40" cy="36" rx="6" ry="7" fill="white" stroke="#333" strokeWidth="0.5"/>
              <ellipse cx="60" cy="36" rx="6" ry="7" fill="white" stroke="#333" strokeWidth="0.5"/>
              
              {/* Pupils with shine - animated */}
              <ellipse cx="42" cy="37" rx="3" ry="4" fill="#2a1810">
                <animate attributeName="cy" dur="3s" repeatCount="indefinite" values="37;37;37;35;37;37"/>
              </ellipse>
              <ellipse cx="62" cy="37" rx="3" ry="4" fill="#2a1810">
                <animate attributeName="cy" dur="3s" repeatCount="indefinite" values="37;37;37;35;37;37"/>
              </ellipse>
              
              {/* Eye shine */}
              <circle cx="44" cy="35" r="1.5" fill="white"/>
              <circle cx="64" cy="35" r="1.5" fill="white"/>
              
              {/* Eyelids for blinking */}
              <ellipse cx="40" cy="36" rx="6" ry="7" fill="#fcd5b8">
                <animate attributeName="ry" dur="4s" repeatCount="indefinite" values="0;0;0;0;7;0;0;0;0;0;0;0"/>
              </ellipse>
              <ellipse cx="60" cy="36" rx="6" ry="7" fill="#fcd5b8">
                <animate attributeName="ry" dur="4s" repeatCount="indefinite" values="0;0;0;0;7;0;0;0;0;0;0;0"/>
              </ellipse>
              
              {/* Nose - Friendly rounded */}
              <ellipse cx="50" cy="44" rx="4" ry="3" fill="#eac4a8"/>
              
              {/* Warm Smile */}
              <path d="M40 52 Q50 60 60 52" fill="none" stroke="#8b4513" strokeWidth="2" strokeLinecap="round"/>
              <path d="M42 52 Q50 57 58 52" fill="#ff9999" opacity="0.5"/>
              
              {/* Rosy Cheeks */}
              <ellipse cx="32" cy="46" rx="5" ry="3" fill="#ffb6c1" opacity="0.5"/>
              <ellipse cx="68" cy="46" rx="5" ry="3" fill="#ffb6c1" opacity="0.5"/>
              
              {/* Waving Hand/Arm */}
              <g className="origin-[25px_70px]">
                <animateTransform attributeName="transform" type="rotate" dur="0.8s" repeatCount="indefinite" values="0 25 70;15 25 70;0 25 70;-5 25 70;0 25 70"/>
                {/* Arm sleeve */}
                <path d="M25 65 Q15 60 8 50 Q5 45 10 42" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1"/>
                {/* Hand */}
                <ellipse cx="10" cy="40" rx="7" ry="8" fill="#fcd5b8" stroke="#e8b89a" strokeWidth="1"/>
                {/* Thumb */}
                <ellipse cx="4" cy="42" rx="3" ry="4" fill="#fcd5b8" stroke="#e8b89a" strokeWidth="0.5"/>
              </g>
              
              {/* Cross necklace */}
              <line x1="50" y1="66" x2="50" y2="73" stroke="#c9a227" strokeWidth="2"/>
              <line x1="47" y1="69" x2="53" y2="69" stroke="#c9a227" strokeWidth="2"/>
              
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
