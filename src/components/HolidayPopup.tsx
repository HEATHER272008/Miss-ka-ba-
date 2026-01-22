import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX } from 'lucide-react';

interface HolidayConfig {
  name: string;
  image: string;
  audio: string;
  greeting: string;
  colors: string;
}

const holidays: Record<string, HolidayConfig> = {
  'christmas': {
    name: 'Christmas',
    image: '/holidays/christmas.jpg',
    audio: '/holidays/christmas-music.mp3',
    greeting: 'Merry Christmas! 🎄',
    colors: 'from-red-600 to-green-600',
  },
  'halloween': {
    name: 'Halloween',
    image: '/holidays/halloween.jpg',
    audio: '/holidays/halloween-music.mp3',
    greeting: 'Happy Halloween! 🎃',
    colors: 'from-orange-500 to-purple-800',
  },
  'valentines': {
    name: "Valentine's Day",
    image: '/holidays/valentines.jpg',
    audio: '/holidays/valentines-music.mp3',
    greeting: "Happy Valentine's Day! 💕",
    colors: 'from-pink-500 to-red-500',
  },
};

const getHoliday = (): HolidayConfig | null => {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-12
  const day = today.getDate();

  // Christmas: December 25
  if (month === 12 && day === 25) {
    return holidays.christmas;
  }
  
  // Halloween: October 31
  if (month === 10 && day === 31) {
    return holidays.halloween;
  }
  
  // Valentine's Day: February 14
  if (month === 2 && day === 14) {
    return holidays.valentines;
  }

  return null;
};

const HolidayPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [holiday, setHoliday] = useState<HolidayConfig | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const currentHoliday = getHoliday();
    
    if (!currentHoliday) return;

    // Check if popup was already shown today
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('holidayPopupLastShown');
    
    if (lastShown === today) return;

    // Show the popup
    setHoliday(currentHoliday);
    setIsOpen(true);
    localStorage.setItem('holidayPopupLastShown', today);

    // Play music
    const audio = new Audio(currentHoliday.audio);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    
    // Try to play (may be blocked by browser autoplay policy)
    audio.play().catch(() => {
      console.log('Autoplay blocked, user interaction needed');
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleUserInteraction = () => {
    // Try playing after user interaction
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.log);
    }
  };

  if (!holiday) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-2xl"
        onClick={handleUserInteraction}
      >
        <div className={`relative rounded-lg overflow-hidden bg-gradient-to-br ${holiday.colors}`}>
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-20 bg-background/80 hover:bg-background text-foreground rounded-full"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Mute button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 z-20 bg-background/80 hover:bg-background text-foreground rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>

          {/* Holiday Image */}
          <div className="relative aspect-square">
            <img
              src={holiday.image}
              alt={holiday.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback gradient if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Greeting */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
              {holiday.greeting}
            </h2>
            <p className="text-white/90 text-lg drop-shadow">
              Wishing you a wonderful {holiday.name}!
            </p>
            <p className="text-white/70 text-sm mt-2">
              — From CathoLink Team
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {holiday.name === 'Christmas' && (
              <>
                <div className="absolute top-4 left-1/4 text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>❄️</div>
                <div className="absolute top-8 right-1/4 text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎄</div>
                <div className="absolute top-16 left-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</div>
              </>
            )}
            {holiday.name === 'Halloween' && (
              <>
                <div className="absolute top-4 left-1/4 text-4xl animate-pulse">🎃</div>
                <div className="absolute top-8 right-1/4 text-3xl animate-pulse" style={{ animationDelay: '0.2s' }}>🦇</div>
                <div className="absolute top-16 left-1/3 text-2xl animate-pulse" style={{ animationDelay: '0.4s' }}>👻</div>
              </>
            )}
            {holiday.name === "Valentine's Day" && (
              <>
                <div className="absolute top-4 left-1/4 text-4xl animate-pulse">💕</div>
                <div className="absolute top-8 right-1/4 text-3xl animate-pulse" style={{ animationDelay: '0.2s' }}>💝</div>
                <div className="absolute top-16 left-1/3 text-2xl animate-pulse" style={{ animationDelay: '0.4s' }}>❤️</div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HolidayPopup;