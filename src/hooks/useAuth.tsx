import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'admin' | 'student' | null;
  profile: any;
  loading: boolean;
  profileChecked: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string) => {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);

  const fetchUserRole = async (userId: string): Promise<'admin' | 'student' | null> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Auth] fetchUserRole error:', error);
      setUserRole(null);
      return null;
    }

    const role = (data?.role ?? null) as 'admin' | 'student' | null;
    setUserRole(role);
    return role;
  };

  const fetchProfile = async (userId: string): Promise<any | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Auth] fetchProfile error:', error);
      setProfile(null);
      return null;
    }

    setProfile(data ?? null);
    return data ?? null;
  };

  const provisionAccount = async (): Promise<boolean> => {
    try {
      // Get the current session to ensure we have a valid token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        console.warn('[Auth] No session available for provisioning');
        return false;
      }
      
      const { error } = await withTimeout(
        supabase.functions.invoke('provision-user', {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        }),
        8000,
        'provision-user'
      );
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Auth] provision-user failed:', err);
      return false;
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const [role, prof] = await Promise.all([
        withTimeout(fetchUserRole(userId), 4000, 'fetchUserRole'),
        withTimeout(fetchProfile(userId), 4000, 'fetchProfile'),
      ]);

      // If either record is missing (common after DB data was cleared), try to repair it.
      if (!role || !prof) {
        const ok = await provisionAccount();
        if (ok) {
          await Promise.all([fetchUserRole(userId), fetchProfile(userId)]);
        }
      }
    } catch (err) {
      console.error('[Auth] loadUserData failed:', err);
    } finally {
      setProfileChecked(true);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const handleSession = async (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setUserRole(null);
        setProfile(null);
        setProfileChecked(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setProfileChecked(false);
      await loadUserData(nextSession.user.id);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        console.log('[Auth] state change:', event);
        await handleSession(nextSession);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] Session error:', error.message);
        setLoading(false);
        return;
      }

      await handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setProfile(null);
    setProfileChecked(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, profile, loading, profileChecked, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
