import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] initializing...');

    // Detect if we are in an OAuth callback to handle loading state correctly
    const isCallback = window.location.hash.includes('access_token') || 
                       window.location.hash.includes('error') ||
                       window.location.search.includes('code=');

    // Check initial session
    authService.getUser().then(u => {
      console.log('[AuthContext] initial user:', u?.email);
      if (u) {
        setUser(u);
        setLoading(false);
      } else if (!isCallback) {
        // Only stop loading if we're not waiting for an OAuth callback
        setLoading(false);
      }
    });

    // Listen for auth state changes (handles OAuth callback)
    const { data: { subscription } } = authService.onAuthStateChange((u, event) => {
      console.log('[AuthContext] event:', event, 'user:', u?.email);
      setUser(u);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => { await authService.signInWithGoogle(); };
  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
