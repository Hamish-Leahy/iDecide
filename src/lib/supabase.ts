import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single, optimized Supabase client instance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'idecide' },
  },
  // Enable request caching
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const profileCache = new Map<string, { data: any; timestamp: number }>();

// Optimized profile fetching with caching
export async function fetchProfile(userId: string) {
  const now = Date.now();
  const cached = profileCache.get(userId);

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  if (data) {
    profileCache.set(userId, { data, timestamp: now });
  }

  return data;
}

// Batch update helper
export async function batchUpdate(table: string, updates: any[]) {
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    batches.push(
      supabase
        .from(table)
        .upsert(batch)
        .select()
    );
  }

  return Promise.all(batches);
}

// Clear cache when needed
export function clearCache(userId?: string) {
  if (userId) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
}