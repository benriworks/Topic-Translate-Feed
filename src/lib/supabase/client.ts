import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Client-side Supabase client
// Uses anon key for public access
export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Singleton pattern for client-side
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }
  return browserClient;
}
