import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Calendar, User, Star, ArrowRight, ArrowLeft, HelpCircle, CheckCircle2, Smartphone, Scan, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to CathoLink! 👋",
    description: "This quick tutorial will help you understand how to use the app.",
    icon: <Smartphone className="h-10 w-10 sm:h-12 sm:w-12" />,
    color: "from-blue-500 to-indigo-600",
    tips: [
      "CathoLink helps track your school attendance",
      "Your parents/guardians will be notified when you arrive",
      "It's simple and easy to use!"
    ]
  },
  {
    title: "Generate Your QR Code",
    description: "Your QR code is like your digital ID for attendance.",
    icon: <QrCode className="h-10 w-10 sm:h-12 sm:w-12" />,
    color: "from-violet-500 to-purple-600",
    tips: [
      "Tap 'QR Code' on the main screen",
      "Show it to the admin for scanning",
      "Keep your phone ready when entering school"
    ]
  },
  {
    title: "Getting Scanned",
    description: "An admin will scan your QR code to record attendance.",
    icon: <Scan className="h-10 w-10 sm:h-12 sm:w-12" />,
    color: "from-cyan-500 to-blue-600",
    tips: [
      "Hold your phone steady for easy scanning",
      "Make sure your screen brightness is up",
      "Wait for the confirmation message"
    ]
  },
  {
    title: "Attendance Status",
    description: "Your status is determined by when you arrive.",
    icon: <Clock className="h-10 w-10 sm:h-12 sm:w-12" />,
    color: "from-amber-500 to-orange-600",
    tips: [
      "✅ PRESENT: Arrive on time",
      "⚠️ LATE: Arrive after cutoff time",
      "❌ ABSENT: Not scanned for the day"
    ]
  },
  {
    title: "View Attendance",
    description: "Check your attendance history anytime.",
    icon: <Calendar className="h-10 w-10 sm:h-12 sm:w-12" />,
    color: "from-green-500 to-emerald-600",
    tips: [
      "See all your attendance records",
      "Filter by date range",
      "Track your performance over time"
    ]
  },
  {
    title: "Update Profile",
    description: "Keep your information up to date.",
    icon: <User className="h-10 w-10 sm:h-12 sm:w-12" />,
    color: "from-pink-500 to-rose-600",
    tips: [
      "Update parent/guardian contact details",
      "Add or change your profile picture",
      "Make sure your section is correct"
    ]
  },
  {
    title: "Rate the App",
    description: "Help us improve with your feedback!",
    icon: <Star className="h-10 w-10 sm:h-12 sm:w-12" />,
    color: "from-yellow-500 to-amber-600",
    tips: [
      "Rate different features",
      "Share suggestions for improvements",
      "Your feedback matters!"
    ]
  },
  {
    title: "You're All Set! 🎉",
    description: "You're ready to use CathoLink!",
    icon: <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />,
    color: "from-green-500 to-teal-600",
    tips: [
      "Tap the '?' button to see this again",
      "Arrive early to be marked 'Present'",
      "Contact your adviser if you have issues"
    ]
  }
];

interface TutorialGuideProps {
  isOpen: boolean;
  onClose: () => void;
  forceShow?: boolean;
}

const TutorialGuide = ({ isOpen, onClose, forceShow = false }: TutorialGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(isOpen);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setShowTutorial(isOpen);
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const animateTransition = (newStep: number, dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      animateTransition(currentStep + 1, 'next');
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      animateTransition(currentStep - 1, 'prev');
    }
  };

  const handleDotClick = (index: number) => {
    if (index !== currentStep) {
      animateTransition(index, index > currentStep ? 'next' : 'prev');
    }
  };

  const handleComplete = () => {
    if (!forceShow) {
      localStorage.setItem('catholink_tutorial_completed', 'true');
    }
    setShowTutorial(false);
    onClose();
  };

  const handleSkip = () => {
    if (!forceShow) {
      localStorage.setItem('catholink_tutorial_completed', 'true');
    }
    setShowTutorial(false);
    onClose();
  };

  const step = tutorialSteps[currentStep];

  return (
    <Dialog open={showTutorial} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="w-[95vw] max-w-[500px] h-[85vh] max-h-[600px] p-0 gap-0 overflow-hidden rounded-3xl border-0 shadow-2xl [&>button]:hidden flex flex-col">
        {/* Gradient Header with Icon */}
        <div className={`relative bg-gradient-to-br ${step.color} p-5 sm:p-6 text-white overflow-hidden flex-shrink-0`}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          {/* Skip button */}
          <button 
            onClick={handleSkip}
            className="absolute top-3 right-4 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            Skip
          </button>
          
          {/* Icon */}
          <div className={`relative z-10 flex justify-center mb-3 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {step.icon}
            </div>
          </div>
          
          {/* Title */}
          <div className={`relative z-10 text-center transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <h2 className="text-lg sm:text-xl font-bold mb-1">{step.title}</h2>
            <p className="text-white/80 text-xs sm:text-sm">{step.description}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-background">
          {/* Tips */}
          <div className={`space-y-2.5 transition-all duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {step.tips.map((tip, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className="text-white text-[10px] sm:text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Footer with Navigation */}
        <div className="flex-shrink-0 p-4 sm:p-5 bg-background border-t border-border">
          {/* Step Dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-6 sm:w-8 bg-primary' 
                    : 'w-1.5 sm:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1 h-11 sm:h-12 rounded-xl text-sm sm:text-base font-medium disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              Back
            </Button>
            
            <Button 
              onClick={handleNext}
              className={`flex-1 h-11 sm:h-12 rounded-xl text-sm sm:text-base font-medium bg-gradient-to-r ${step.color} hover:opacity-90 transition-opacity border-0`}
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage tutorial state
export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('catholink_tutorial_completed');
    if (!hasCompleted) {
      setIsFirstTime(true);
      setShowTutorial(true);
    }
  }, []);

  const openTutorial = () => setShowTutorial(true);
  const closeTutorial = () => setShowTutorial(false);

  return { showTutorial, isFirstTime, openTutorial, closeTutorial };
};

// Help button component to trigger tutorial
export const TutorialHelpButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="fixed bottom-6 right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
      title="Need help? View tutorial"
    >
      <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
    </Button>
  );
};

export default TutorialGuide;
