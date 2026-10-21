import { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabase';
import { authService } from '../services/authService';
import type { AppUser, AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string>('student');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const mountedRef = useRef(true);
  const roleFetchRef = useRef(false);
  const activeUserIdRef = useRef<string | null>(null);

  const enrichUserWithProfile = useCallback(async (authUser: AppUser | null) => {
    if (!authUser?.id || !mountedRef.current) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, institution, total_xp, language_preference')
        .eq('id', authUser.id)
        .single();

      if (error || !profile || !mountedRef.current) return;

      setUser(prev => {
        if (!prev || prev.id !== authUser.id) return prev;

        return {
          ...prev,
          username: profile.username ?? (prev as any).username ?? null,
          full_name: profile.full_name ?? (prev as any).full_name ?? null,
          avatar_url: profile.avatar_url ?? (prev as any).avatar_url ?? null,
          institution: profile.institution ?? (prev as any).institution ?? null,
          language_preference: profile.language_preference ?? (prev as any).language_preference ?? 'bn',
          total_xp: profile.total_xp ?? 0,
          total_score: profile.total_xp ?? 0
        } as AppUser;
      });
    } catch (error) {
      console.warn('Profile enrichment failed:', error);
    } finally {
      if (mountedRef.current && activeUserIdRef.current === authUser.id) {
        setProfileLoading(false);
      }
    }
  }, []);

  const fetchRoleData = useCallback(async () => {
    if (roleFetchRef.current || !mountedRef.current) return;

    roleFetchRef.current = true;

    try {
      const result = await authService.getRoleAndPermissions();
      if (!mountedRef.current) return;

      setRole(result?.role || 'student');
      setPermissions(result?.permissions || []);
    } catch (error) {
      console.warn('Role fetch failed, fallback to student:', error);
      if (!mountedRef.current) return;
      setRole('student');
      setPermissions([]);
    } finally {
      roleFetchRef.current = false;
    }
  }, []);

  const updateUserProfile = useCallback((userId: string, profile: Pick<AppUser, 'full_name' | 'username' | 'avatar_url'>) => {
    setUser((current) => current?.id === userId ? { ...current, ...profile } : current);
  }, []);

  const applySession = useCallback((currentSession: Session | null) => {
    setSession(currentSession);
    activeUserIdRef.current = currentSession?.user.id ?? null;

    if (!currentSession?.user) {
      setUser(null);
      setProfileLoading(false);
      setRole('student');
      setPermissions([]);
      setLoading(false);
      return;
    }

    const baseUser = {
      ...(currentSession.user as AppUser),
      total_xp: (currentSession.user as any)?.total_xp ?? 0,
      total_score: (currentSession.user as any)?.total_score ?? 0
    } as AppUser;

    setUser(baseUser);
    setProfileLoading(true);
    setLoading(false);

    void fetchRoleData();
    void enrichUserWithProfile(baseUser);
  }, [enrichUserWithProfile, fetchRoleData]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      activeUserIdRef.current = null;
      setProfileLoading(false);
      setRole('student');
      setPermissions([]);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const handleUnauthorized = () => {
      console.warn('Unauthorized event received. Clearing auth state...');
      void signOut();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const init = async () => {
      try {
        const {
          data: { session: initialSession },
          error
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!mountedRef.current) return;

        applySession(initialSession);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (!mountedRef.current) return;
        setProfileLoading(false);
        setLoading(false);
      }
    };

    void init();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mountedRef.current) return;
      applySession(currentSession);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [applySession, signOut]);

  const value = useMemo<AuthContextType>(() => ({
    session,
    user,
    role,
    permissions,
    loading,
    profileLoading,
    updateUserProfile,
    signOut
  }), [session, user, role, permissions, loading, profileLoading, updateUserProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
