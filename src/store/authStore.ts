import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setRememberMe: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  signIn: async (email: string, password: string, rememberMe: boolean) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user, session: data.session });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user, session: data.session });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Call the RPC function to delete user data
      const { error: rpcError } = await supabase.rpc('delete_user_data', {
        user_id: user.id
      });

      if (rpcError) {
        console.error('Error deleting user data:', rpcError);
        throw rpcError;
      }

      // Delete the auth account
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id,
        { shouldSoftDelete: false }
      );

      if (authError) {
        // If admin API fails, try user-level deletion
        const { error: userAuthError } = await supabase.auth.signOut();
        if (userAuthError) throw userAuthError;
      }

      // Clear local state
      set({ 
        user: null, 
        session: null, 
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  },

  setRememberMe: (value: boolean) => {
    // Implement any remember me functionality if needed
  }
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.setState({ 
      user: session?.user || null,
      session,
      isLoading: false 
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ 
      user: null, 
      session: null,
      isLoading: false 
    });
  }
});

// Initial session check
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({ 
    user: session?.user || null,
    session,
    isLoading: false 
  });
});