import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { lovable } from '../integrations/lovable/index';

export const authService = {
  signInWithGoogle: async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      throw result.error;
    }

    // If redirected, the browser will navigate away
    return result;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  getUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (user: User | null, event?: string) => void) => {
    return supabase.auth.onAuthStateChange((event: string, session: { user: User | null } | null) => {
      callback(session?.user ?? null, event);
    });
  },
};