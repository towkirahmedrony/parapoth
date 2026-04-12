import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/shared/constants/storageKeys';

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    identifier: '', 
    password: ''
  });

  // Clear session on mount safely
  useEffect(() => {
    const clearOldSession = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Failed to clear old session:', error);
      }
    };
    clearOldSession();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: typeof formData) => {
      // Magic string removed, using centralized constant
      const { data, error: functionError } = await supabase.functions.invoke(API_ENDPOINTS.AUTH.LOGIN, {
        body: credentials,
      });

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);

      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) throw sessionError;
      }
      
      return data;
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (err: Error) => {
      if (err.message.includes('Invalid login credentials')) {
        setCustomError('ভুল মোবাইল নম্বর/ইমেইল বা পাসওয়ার্ড।');
      } else {
        setCustomError('লগইন করতে সমস্যা হচ্ছে। একটু পর আবার চেষ্টা করুন।');
      }
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    loginMutation.mutate(formData);
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="w-full">
      {customError && (
        <div 
          style={{ 
            backgroundColor: 'color-mix(in srgb, #ef4444 10%, transparent)', 
            color: '#ef4444' 
          }}
          className="mb-4 p-3 flex items-start gap-2 rounded-lg text-sm"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{customError}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <input
            type="text"
            required
            style={{ 
              backgroundColor: 'var(--dyn-card)', 
              color: 'var(--dyn-text)', 
              border: '1px solid color-mix(in srgb, var(--dyn-text) 20%, transparent)' 
            }}
            className="w-full px-4 py-3.5 rounded-xl focus:outline-none focus:border-[var(--dyn-primary)] transition-colors placeholder:text-[color-mix(in_srgb,var(--dyn-text)_40%,transparent)] text-base"
            placeholder="ইমেইল বা ইউজার নেম"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            disabled={isPending}
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            style={{ 
              backgroundColor: 'var(--dyn-card)', 
              color: 'var(--dyn-text)', 
              border: '1px solid color-mix(in srgb, var(--dyn-text) 20%, transparent)' 
            }}
            className="w-full pl-4 pr-12 py-3.5 rounded-xl focus:outline-none focus:border-[var(--dyn-primary)] transition-colors placeholder:text-[color-mix(in_srgb,var(--dyn-text)_40%,transparent)] text-base"
            placeholder="পাসওয়ার্ড"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 focus:outline-none"
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
            disabled={isPending}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{ 
            backgroundColor: 'var(--dyn-primary)', 
            color: 'var(--dyn-bg)' 
          }}
          className="w-full mt-2 py-3.5 px-4 font-bold text-lg rounded-full transition-all duration-200 flex justify-center items-center gap-2 hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="animate-spin h-6 w-6" /> : 'লগ ইন'}
        </button>
      </form>
    </div>
  );
}
