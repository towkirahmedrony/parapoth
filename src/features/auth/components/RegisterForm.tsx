import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

import { supabase } from '@/shared/lib/supabase';

interface RegisterFormProps {
  onSuccess: (email: string) => void;
  defaultRefCode?: string | null;
}

type RegisterFormData = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const INITIAL_FORM_DATA: RegisterFormData = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const USERNAME_PATTERN = /^[a-z0-9_]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function RegisterForm({ onSuccess, defaultRefCode }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterFormData) => {
      const normalizedData = {
        fullName: userData.fullName.trim().replace(/\s+/g, ' '),
        username: userData.username.trim().toLowerCase(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
      };

      const { data, error } = await supabase.auth.signUp({
        email: normalizedData.email,
        password: normalizedData.password,
        options: {
          data: {
            full_name: normalizedData.fullName,
            username: normalizedData.username,
            referred_by_code: defaultRefCode?.trim() || null,
          },
        },
      });

      if (error) throw error;

      // নতুন চেক: ইমেইল আগে থেকেই থাকলে Supabase error দেয় না, কিন্তু identities array ফাঁকা পাঠায়।
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('user already registered');
      }

      return {
        ...data,
        submittedEmail: normalizedData.email,
      };
    },
    onSuccess: (data) => {
      if (data.user) {
        onSuccess(data.submittedEmail);
      }
    },
    onError: (err: Error) => {
      const errorMessage = err.message?.toLowerCase() || '';

      if (
        errorMessage.includes('profiles_username_key') ||
        errorMessage.includes('duplicate key value') ||
        (errorMessage.includes('username') && errorMessage.includes('duplicate'))
      ) {
        setCustomError('এই ইউজারনেমটি আগে থেকেই ব্যবহৃত। অন্য একটি দিন।');
        return;
      }

      if (
        errorMessage.includes('user already registered') ||
        (errorMessage.includes('email') && errorMessage.includes('already'))
      ) {
        setCustomError('এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে। দয়া করে লগ ইন করুন।');
        return;
      }

      if (
        errorMessage.includes('valid_username') ||
        errorMessage.includes('username')
      ) {
        setCustomError('ইউজারনেমে শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করা যাবে।');
        return;
      }

      setCustomError('অ্যাকাউন্ট তৈরি করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।');
    },
  });

  const isPending = registerMutation.isPending;
  const errorId = customError ? 'register-form-error' : undefined;

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'username' ? value.toLowerCase() : value,
    }));

    if (customError) {
      setCustomError(null);
    }
  };

  const validateForm = (): string | null => {
    const fullName = formData.fullName.trim().replace(/\s+/g, ' ');
    const username = formData.username.trim().toLowerCase();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!fullName) return 'পুরো নাম লিখুন।';
    if (fullName.length < 2) return 'পুরো নাম কমপক্ষে ২ অক্ষরের হতে হবে।';
    if (!username) return 'ইউজারনেম লিখুন।';
    if (username.length < 3) return 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।';
    if (username.length > 20) return 'ইউজারনেম ২০ অক্ষরের বেশি হতে পারবে না।';
    if (!USERNAME_PATTERN.test(username)) return 'ইউজারনেমে শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করা যাবে।';
    if (!email) return 'ইমেইল অ্যাড্রেস লিখুন।';
    if (password.length < MIN_PASSWORD_LENGTH) return 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।';
    if (password !== confirmPassword) return 'পাসওয়ার্ড দুটি মিলছে না।';

    return null;
  };

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCustomError(null);

    const validationError = validateForm();

    if (validationError) {
      setCustomError(validationError);
      return;
    }

    registerMutation.mutate(formData);
  };

  const inputClasses = "w-full rounded-xl px-4 py-3 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring bg-input-bg text-text-primary border border-input-border placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="w-full">
      {customError && (
        <div
          id="register-form-error"
          role="alert"
          aria-live="polite"
          className="mb-3 flex items-start gap-2 rounded-xl border p-2.5 text-sm bg-surface-elevated border-border-color text-text-primary"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-primary" />
          <p className="font-medium leading-5">{customError}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3" noValidate>
        <input
          id="register-full-name"
          type="text"
          required
          autoComplete="name"
          disabled={isPending}
          className={inputClasses}
          placeholder="পুরো নাম"
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          aria-invalid={Boolean(customError)}
          aria-describedby={errorId}
        />

        <input
          id="register-username"
          type="text"
          required
          autoComplete="username"
          inputMode="text"
          pattern="[a-z0-9_]+"
          minLength={3}
          maxLength={20}
          disabled={isPending}
          className={`${inputClasses} lowercase`}
          placeholder="ইউজারনেম (ছোট হাতের অক্ষর ও সংখ্যা)"
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
          aria-invalid={Boolean(customError)}
          aria-describedby={errorId}
        />

        <input
          id="register-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          disabled={isPending}
          className={inputClasses}
          placeholder="ইমেইল অ্যাড্রেস"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          aria-invalid={Boolean(customError)}
          aria-describedby={errorId}
        />

        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            disabled={isPending}
            className={`${inputClasses} pr-12`}
            placeholder="পাসওয়ার্ড (অন্তত ৬ অক্ষরের)"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            aria-invalid={Boolean(customError)}
            aria-describedby={errorId}
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-focus-ring text-text-secondary hover:text-text-primary disabled:cursor-not-allowed"
            aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <input
          id="register-confirm-password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          disabled={isPending}
          className={inputClasses}
          placeholder="পাসওয়ার্ড নিশ্চিত করুন"
          value={formData.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          aria-invalid={Boolean(customError)}
          aria-describedby={errorId}
        />

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-lg font-bold transition-all duration-200 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>সাইন আপ...</span>
            </>
          ) : (
            'সাইন আপ'
          )}
        </button>
      </form>
    </div>
  );
}
