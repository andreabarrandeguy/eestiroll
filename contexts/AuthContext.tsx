import { supabase } from '@/config/supabase';
import * as authService from '@/services/auth';
import { setAuthSuperProperty } from '@/services/analytics';
import { AuthContextType, AuthStatus } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setStatus(session ? 'authenticated' : 'anonymous');
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'authenticated' : 'anonymous');
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // The Supabase client only auto-refreshes tokens while something is actively
  // calling startAutoRefresh(); on native this must be tied to app foreground state.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    setAuthSuperProperty(status === 'authenticated');
  }, [status]);

  return (
    <AuthContext.Provider
      value={{
        status,
        userId,
        email,
        sendOtp: authService.sendOtp,
        verifyOtp: authService.verifyOtp,
        signOut: authService.signOut,
        deleteAccount: authService.deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
