import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
    // Handle auth hash fragments from email verification
    const handleAuthHash = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (accessToken && refreshToken && type === 'signup') {
        console.log('🔐 Processing email verification from hash fragments');
        
        try {
          // Set the session using the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('❌ Error setting session from hash:', error);
            return;
          }

          console.log('✅ Session set from email verification:', data.user?.id);
          
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          
          // Redirect to create-cards if not already there
          if (window.location.pathname !== '/create-cards') {
            window.location.href = '/create-cards';
          }
        } catch (error) {
          console.error('❌ Error processing auth hash:', error);
        }
      }
    };

    // Process auth hash on initial load
    handleAuthHash();

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
        return { data, error };
      } else {
        console.log('✅ Anonymous user converted successfully');
      }
      
      return { data, error };
    } catch (error) {
      console.error('❌ Failed to convert anonymous user:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            name: name
          }
        }
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    // Set flag to prevent anonymous user creation after sign out
    sessionStorage.setItem('just-signed-out', 'true');
    
    await supabase.auth.signOut();
    
    // Clear the flag after a delay
    setTimeout(() => {
      sessionStorage.removeItem('just-signed-out');
    }, 2000);
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