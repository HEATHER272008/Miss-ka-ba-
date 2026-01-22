import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const NotificationButton = () => {
  const { permission, loading, requestPermission, isSupported } = usePushNotifications();

  const handleClick = async () => {
    if (permission !== 'granted') {
      await requestPermission();
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={loading || permission === 'denied'}
      className="relative"
      title={
        !isSupported
          ? 'Enable notifications (open in new tab first)'
          : permission === 'granted' 
            ? 'Notifications enabled' 
            : permission === 'denied' 
              ? 'Notifications blocked' 
              : 'Enable notifications'
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : permission === 'granted' ? (
        <Bell className="h-4 w-4 text-green-500" />
      ) : permission === 'denied' ? (
        <BellOff className="h-4 w-4 text-destructive" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
    </Button>
  );
};
