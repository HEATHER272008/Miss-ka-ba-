import { useState, useEffect, useCallback } from 'react';
import { messaging, getToken, onMessage } from '@/firebase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const VAPID_KEY = 'BK6uKjRuCFaYg1xVKIPptIZm3W2BJFCrLDurjaiCDPSJFbR24ZuLBLoh2Nx3oviHTEarDHdhQlr615vrmxsSUmo';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      toast({
        title: payload.notification?.title || 'New Notification',
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
    throw new Error('Service Worker not supported');
  };

  const saveTokenToDatabase = async (fcmToken: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: user.id,
          token: fcmToken,
          device_info: navigator.userAgent,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,token'
        });

      if (error) throw error;
      console.log('FCM token saved to database');
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!messaging) {
      toast({
        title: 'Push notifications not supported',
        description: 'Your browser does not support push notifications.',
        variant: 'destructive'
      });
      return null;
    }

    setLoading(true);

    try {
      await registerServiceWorker();
      
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        setToken(fcmToken);
        await saveTokenToDatabase(fcmToken);
        
        toast({
          title: 'Notifications enabled',
          description: 'You will now receive push notifications.',
        });
        
        return fcmToken;
      } else {
        toast({
          title: 'Notifications blocked',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable push notifications.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }

    return null;
  }, [user, toast]);

  return {
    permission,
    token,
    loading,
    requestPermission,
    isSupported: !!messaging
  };
};
