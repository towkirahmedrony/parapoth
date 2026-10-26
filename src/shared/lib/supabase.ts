import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import {
  clearPasswordRecoverySession,
  rememberPasswordRecoverySession,
} from '@/features/auth/utils/passwordRecoverySession';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set at build time.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Supabase consumes implicit-flow recovery tokens during client initialization
// and removes them from the URL before the password page may mount. Preserve a
// short-lived, session-bound marker from the SDK's verified recovery event.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY' && session) {
    rememberPasswordRecoverySession(session);
  } else if (event === 'SIGNED_OUT') {
    clearPasswordRecoverySession();
  }
});
