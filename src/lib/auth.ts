import { createClient, AuthError, User, Session } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Schema validation for auth inputs
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Error handling utility
class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Validate and format auth error messages
function handleAuthError(error: AuthError): never {
  let message = 'An authentication error occurred';
  
  switch (error.status) {
    case 400:
      message = 'Invalid email or password';
      break;
    case 401:
      message = 'Your session has expired. Please sign in again';
      break;
    case 422:
      message = 'Invalid input data';
      break;
    case 429:
      message = 'Too many attempts. Please try again later';
      break;
    default:
      message = error.message;
  }
  
  throw new AuthenticationError(message, error.status?.toString());
}

export async function validateEmail(email: string): Promise<string> {
  return emailSchema.parseAsync(email);
}

export async function validatePassword(password: string): Promise<string> {
  return passwordSchema.parseAsync(password);
}

export async function signUp(email: string, password: string) {
  try {
    // Validate inputs
    await validateEmail(email);
    await validatePassword(password);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (signUpError) throw signUpError;

    if (signUpData.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: signUpData.user.id,
            email: signUpData.user.email,
            onboarding_completed: false,
            idecide_score: 0,
            last_score_update: new Date().toISOString()
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          await supabase.auth.signOut();
          throw new Error('Failed to create user profile');
        }
      } catch (error) {
        console.error('Error in signUp:', error);
        await supabase.auth.signOut();
        throw error;
      }
    }

    return signUpData;
  } catch (error) {
    if (error instanceof AuthError) {
      handleAuthError(error);
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Validate inputs
    await validateEmail(email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      handleAuthError(error);
    }
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  try {
    await validateEmail(email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  } catch (error) {
    if (error instanceof AuthError) {
      handleAuthError(error);
    }
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  try {
    await validatePassword(newPassword);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  } catch (error) {
    if (error instanceof AuthError) {
      handleAuthError(error);
    }
    throw error;
  }
}

// Session management
export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function refreshSession(): Promise<void> {
  const { error } = await supabase.auth.refreshSession();
  if (error) throw error;
}

// Social auth providers
export async function signInWithProvider(provider: 'google' | 'github' | 'facebook') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      handleAuthError(error);
    }
    throw error;
  }
}