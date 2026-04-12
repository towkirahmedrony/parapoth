import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../shared/lib/supabase';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface RegisterFormProps {
  onSuccess: (email: string) => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      // Using native Supabase SDK method (no custom API endpoint needed here)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            username: userData.username.toLowerCase(), 
          },
        },
      });

      if (signUpError) throw signUpError;
      return data;
    },
    onSuccess: (data) => {
      if (data.user) {
        onSuccess(formData.email);
      }
    },
    onError: (err: Error) => {
      const errorMessage = err.message || '';
      if (errorMessage.includes('profiles_username_key') || errorMessage.includes('duplicate key value')) {
        setCustomError("এই ইউজারনেমটি আগে থেকেই ব্যবহৃত। অন্য একটি দিন।");
      } else if (errorMessage.includes('User already registered')) {
        setCustomError("এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে। দয়া করে লগ ইন করুন।");
      } else if (errorMessage.includes('valid_username')) {
        setCustomError("ইউজারনেমে শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করা যাবে।");
      } else {
        setCustomError("অ্যাকাউন্ট তৈরি করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
      }
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    if (formData.password !== formData.confirmPassword) {
      setCustomError("পাসওয়ার্ড দুটি মিলছে না।");
      return;
    }

    registerMutation.mutate(formData);
  };

  const isPending = registerMutation.isPending;

  const inputStyle = {
    backgroundColor: 'var(--dyn-card)',
    color: 'var(--dyn-text)',
    border: '1px solid color-mix(in srgb, var(--dyn-text) 20%, transparent)',
  };

  return (
    <div className="w-full">
      {customError && (
        <div 
          className="mb-4 p-3 flex items-start gap-2 rounded-lg text-sm border"
          style={{ 
            borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
            color: 'var(--dyn-text)'
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 opacity-70" />
          <p className="font-medium">{customError}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          required
          disabled={isPending}
          className="w-full px-4 py-3.5 rounded-xl focus:outline-none transition-colors text-base disabled:opacity-60 disabled:cursor-not-allowed"
          style={inputStyle}
          placeholder="পুরো নাম"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />

        <input
          type="text"
          required
          pattern="[a-zA-Z0-9_]+"
          disabled={isPending}
          className="w-full px-4 py-3.5 rounded-xl focus:outline-none transition-colors text-base disabled:opacity-60 disabled:cursor-not-allowed"
          style={inputStyle}
          placeholder="ইউজারনেম (যেমন: johndoe123)"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
        />

        <input
          type="email"
          required
          disabled={isPending}
          className="w-full px-4 py-3.5 rounded-xl focus:outline-none transition-colors text-base disabled:opacity-60 disabled:cursor-not-allowed"
          style={inputStyle}
          placeholder="ইমেইল অ্যাড্রেস"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            disabled={isPending}
            className="w-full pl-4 pr-12 py-3.5 rounded-xl focus:outline-none transition-colors text-base disabled:opacity-60 disabled:cursor-not-allowed"
            style={inputStyle}
            placeholder="পাসওয়ার্ড (অন্তত ৬ অক্ষরের)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 focus:outline-none disabled:opacity-50"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            disabled={isPending}
            className="w-full pl-4 pr-12 py-3.5 rounded-xl focus:outline-none transition-colors text-base disabled:opacity-60 disabled:cursor-not-allowed"
            style={inputStyle}
            placeholder="পাসওয়ার্ড নিশ্চিত করুন"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 py-3.5 px-4 font-bold text-lg rounded-full transition-all duration-200 flex justify-center items-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: 'var(--dyn-primary)',
            color: 'var(--dyn-bg)'
          }}
        >
          {isPending ? <Loader2 className="animate-spin h-6 w-6" /> : 'সাইন আপ'}
        </button>
      </form>
    </div>
  );
}
