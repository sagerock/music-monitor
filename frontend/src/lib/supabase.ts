import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpskjkezcifsameyfxzz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2tqa2V6Y2lmc2FtZXlmeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjkzMDksImV4cCI6MjA3MDYwNTMwOX0.nWMCbFyrqHv7LD4wMgLss1kA3Fcp9TRV0aDX2KhvdX8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Helper to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.href = '/';
  }
  return { error };
};

// Database types (will be generated from your schema later)
export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string;
          name: string;
          genres: string[];
          popularity: number | null;
          followers: number | null;
          country: string | null;
          is_major_label: boolean | null;
          image_url: string | null;
          spotify_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['artists']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['artists']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      watchlists: {
        Row: {
          user_id: string;
          artist_id: string;
          created_at: string;
        };
      };
      alerts: {
        Row: {
          id: number;
          user_id: string;
          artist_id: string;
          threshold: number;
          is_active: boolean;
          last_triggered: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}