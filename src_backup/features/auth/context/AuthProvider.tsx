import { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabase';
import { authService } from '../services/authService';
import { AppUser, AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Default string value 'student' matches the AuthContextType restriction strictly
  const [role, setRole] = useState<string>('student');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const fetchingRef = useRef<boolean>(false);

  // Memoized sign out logic
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Local state cleanup
      setSession(null);
      setUser(null);
      setRole('student');
      setPermissions([]);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserRoleData = useCallback(async (isMounted: boolean) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Role Fetch Timeout')), 5000)
    );

    try {
      // Improved type safety for result
      const result = await Promise.race([
        authService.getRoleAndPermissions(),
        timeoutPromise
      ]) as { role: string; permissions: string[] };

      if (isMounted) {
        setRole(result.role);
        setPermissions(result.permissions);
      }
    } catch (error) {
      console.warn("Auth role fetching error, falling back to student:", error);
      if (isMounted) {
        setRole('student'); 
        setPermissions([]);
      }
    } finally {
      fetchingRef.current = false;
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Listen for global unauthorized events (from apiClient)
    const handleUnauthorized = () => {
      console.warn("Session expired or unauthorized. Clearing local auth state...");
      signOut();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          const activeSession = initialSession;
          setSession(activeSession);
          setUser((activeSession?.user as AppUser) ?? null);
          
          if (activeSession?.user) {
            await fetchUserRoleData(isMounted);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser((currentSession?.user as AppUser) ?? null);
          if (currentSession?.user) {
             fetchUserRoleData(isMounted);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setRole('student');
          setPermissions([]);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [signOut, fetchUserRoleData]);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo<AuthContextType>(() => ({
    session,
    user,
    role,
    permissions,
    loading,
    signOut
  }), [session, user, role, permissions, loading, signOut]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
