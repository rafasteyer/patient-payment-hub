/* eslint-disable react-refresh/only-export-components */
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
    let isMounted = true;
    let authResolved = false;

    const isOAuthCallback =
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('error') ||
      window.location.search.includes('code=');

    const applyAuthState = (nextUser: User | null) => {
      if (!isMounted) return;
      authResolved = true;
      setUser(nextUser);
      setLoading(false);
    };

    const { data: { subscription } } = authService.onAuthStateChange((nextUser, event) => {
      if (isOAuthCallback && event === 'INITIAL_SESSION' && !nextUser) {
        return;
      }

      applyAuthState(nextUser);
    });

    const restoreSession = async () => {
      try {
        const attempts = isOAuthCallback ? 10 : 1;

        for (let attempt = 0; attempt < attempts; attempt += 1) {
          const session = await authService.getSession();
          const nextUser = session?.user ?? null;

          if (authResolved) return;

          if (nextUser || !isOAuthCallback || attempt === attempts - 1) {
            applyAuthState(nextUser);
            return;
          }

          await new Promise((resolve) => window.setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error('[AuthContext] failed to restore session:', error);
        if (!authResolved) {
          applyAuthState(null);
        }
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
