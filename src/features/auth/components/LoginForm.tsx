import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        <div className="mb-4 p-3 flex items-start gap-2 rounded-lg text-sm bg-surface-elevated border border-accent text-accent">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{customError}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <input
            type="text"
            required
            className="w-full px-4 py-3.5 rounded-xl bg-input-bg text-text-primary border border-input-border focus:outline-none focus:ring-2 focus:ring-focus-ring transition-colors placeholder:text-text-secondary text-base"
            placeholder="ইমেইল বা ইউজার নেম"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            disabled={isPending}
          />
        </div>

        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-input-bg text-text-primary border border-input-border focus:outline-none focus:ring-2 focus:ring-focus-ring transition-colors placeholder:text-text-secondary text-base"
              placeholder="পাসওয়ার্ড"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary focus:outline-none transition-colors"
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              disabled={isPending}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="flex justify-end pt-2 pb-1">
            <Link 
              to="/auth/forgot-password" 
              className="text-sm font-medium text-primary hover:underline transition-colors"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3.5 px-4 font-bold text-lg rounded-full bg-primary text-primary-foreground transition-all duration-200 flex justify-center items-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="animate-spin h-6 w-6" /> : 'লগ ইন'}
        </button>
      </form>
    </div>
  );
}
