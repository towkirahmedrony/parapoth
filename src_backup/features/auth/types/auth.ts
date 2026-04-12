import { User as SupabaseUser, Session } from '@supabase/supabase-js';

/**
 * Extended Application User type that includes custom database fields
 * appended to the standard Supabase User object.
 */
export interface AppUser extends SupabaseUser {
  total_score?: number;
  total_xp?: number;
  // Add other custom profile fields here if needed (e.g., avatar_url, full_name)
}

export interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  role: string;
  permissions: string[];
  signOut: () => Promise<void>;
}
