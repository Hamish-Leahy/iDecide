import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, fetchProfile, clearCache } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  onboarding_completed: boolean;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const TIMEOUT_DURATION = 15000; // Reduced to 15 seconds
const MAX_RETRIES = 2; // Reduced retries
const RETRY_DELAY = 500; // Reduced to 500ms

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  // Memoize state updates to prevent unnecessary re-renders
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;

      // Clear cache and update state
      clearCache(state.user.id);
      updateState({
        profile: state.profile ? { ...state.profile, ...updates } : null
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [state.user, state.profile, updateState]);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (session) {
        updateState({ session });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      updateState({ error: error as Error });
    }
  }, [updateState]);

  const updateUserAndProfile = useCallback(async (user: User) => {
    try {
      let profile: Profile | null = null;
      let error: Error | null = null;

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), TIMEOUT_DURATION);
      });

      try {
        // Use optimized profile fetching with caching
        profile = await Promise.race([
          fetchProfile(user.id),
          timeoutPromise
        ]);
      } catch (e) {
        error = e as Error;
        
        if (error.message !== 'Profile fetch timeout') {
          try {
            const { data, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email,
                onboarding_completed: false,
                idecide_score: 0,
                last_score_update: new Date().toISOString()
              }])
              .select()
              .single();

            if (createError) throw createError;
            if (!data) throw new Error('Failed to create profile');
            
            profile = data;
            error = null;
          } catch (createError) {
            error = createError as Error;
          }
        }
      }

      updateState({
        user,
        profile,
        loading: false,
        error
      });
    } catch (error) {
      console.error('Error in updateUserAndProfile:', error);
      updateState({
        user,
        loading: false,
        error: error as Error
      });
    }
  }, [updateState]);

  // Memoize auth initialization
  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        await updateUserAndProfile(session.user);
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      updateState({
        loading: false,
        error: error as Error
      });
    }
  }, [updateUserAndProfile, updateState]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await updateUserAndProfile(session.user);
        } else {
          updateState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, updateUserAndProfile, updateState]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearCache(); // Clear all cached data
    updateState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null
    });
  }, [updateState]);

  // Memoize context value
  const value = useMemo(() => ({
    ...state,
    signOut,
    refreshSession,
    updateProfile
  }), [state, signOut, refreshSession, updateProfile]);

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