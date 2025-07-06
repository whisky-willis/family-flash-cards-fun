import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authRateLimiter, sanitizeError } from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAnonymous: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ data: any; error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createAnonymousUser: () => Promise<{ user: User | null; error: any }>;
  convertAnonymousUser: (email: string, password: string, name: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isAnonymous = user?.is_anonymous || false;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state change:', event, 'user:', session?.user?.id, 'anonymous:', session?.user?.is_anonymous);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', session?.user?.id, 'anonymous:', session?.user?.is_anonymous);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createAnonymousUser = async () => {
    console.log('👤 Creating anonymous user...');
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('❌ Failed to create anonymous user:', error);
    } else {
      console.log('✅ Anonymous user created:', data.user?.id);
    }
    return { user: data.user, error };
  };

  const convertAnonymousUser = async (email: string, password: string, name: string) => {
    console.log('🔄 Converting anonymous user to permanent account...');
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: { name }
      });
      
      if (error) {
        console.error('❌ Failed to convert anonymous user:', error);
        return { data, error: { message: sanitizeError(error) } };
      } else {
        console.log('✅ Anonymous user converted successfully');
      }
      
      return { data, error };
    } catch (error) {
      console.error('❌ Failed to convert anonymous user:', error);
      return { data: null, error: { message: sanitizeError(error) } };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(`signup_${email}`, 3, 10 * 60 * 1000)) {
      const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(`signup_${email}`) / 1000 / 60);
      return { 
        data: null, 
        error: { message: `Too many signup attempts. Please try again in ${remainingTime} minutes.` }
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        return { data, error: { message: sanitizeError(error) } };
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: sanitizeError(error) } };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(`signin_${email}`, 5, 15 * 60 * 1000)) {
      const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(`signin_${email}`) / 1000 / 60);
      return { 
        error: { message: `Too many login attempts. Please try again in ${remainingTime} minutes.` }
      };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { error: { message: sanitizeError(error) } };
      }
      
      return { error: null };
    } catch (error) {
      return { error: { message: sanitizeError(error) } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isAnonymous,
    signUp,
    verifyOtp,
    signIn,
    signOut,
    createAnonymousUser,
    convertAnonymousUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}