import { User as SupabaseUser, Session } from '@supabase/supabase-js';

/**
 * Extended Application User type that includes custom database fields
 * appended to the standard Supabase User object.
 */
export interface AppUser extends SupabaseUser {
  total_score?: number;
  total_xp?: number;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  language_preference?: 'bn' | 'en' | string | null;
}

export interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  role: string;
  permissions: string[];
  updateUserProfile: (userId: string, profile: Pick<AppUser, 'full_name' | 'username' | 'avatar_url'>) => void;
  signOut: () => Promise<void>;
}
