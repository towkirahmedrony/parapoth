import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { supabase } from "@/shared/lib/supabase";

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

type NormalizedRegisterData = {
  fullName: string;
  username: string;
  email: string;
  password: string;
};

const INITIAL_FORM_DATA: RegisterFormData = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const USERNAME_PATTERN = /^[a-z0-9_]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_FULL_NAME_LENGTH = 80;
const MAX_USERNAME_LENGTH = 20;
const MIN_USERNAME_LENGTH = 3;

function normalizeRegisterData(userData: RegisterFormData): NormalizedRegisterData {
  return {
    fullName: userData.fullName.trim().replace(/\s+/g, " "),
    username: userData.username.trim().toLowerCase(),
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
  };
}

function getRegisterErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("profiles_username_key") ||
    message.includes("duplicate key value") ||
    (message.includes("username") && message.includes("duplicate"))
  ) {
    return "এই ইউজারনেমটি আগে থেকেই ব্যবহৃত। অন্য একটি দিন।";
  }

  if (
    message.includes("user already registered") ||
    message.includes("already registered") ||
    (message.includes("email") && message.includes("already"))
  ) {
    return "এই তথ্য দিয়ে অ্যাকাউন্ট তৈরি করা যাচ্ছে না। লগ ইন অথবা পাসওয়ার্ড রিসেট চেষ্টা করুন।";
  }

  if (message.includes("valid_username") || message.includes("username")) {
    return "ইউজারনেমে শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করা যাবে।";
  }

  if (message.includes("password")) {
    return "পাসওয়ার্ডটি যথেষ্ট শক্তিশালী নয়। অন্তত ৮ অক্ষর ব্যবহার করুন।";
  }

  return "অ্যাকাউন্ট তৈরি করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।";
}

export default function RegisterForm({
  onSuccess,
  defaultRefCode,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterFormData) => {
      const normalizedData = normalizeRegisterData(userData);

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

      if (error) {
        throw error;
      }

      if (data.user?.identities && data.user.identities.length === 0) {
        throw new Error("user already registered");
      }

      return {
        ...data,
        submittedEmail: normalizedData.email,
      };
    },
    onSuccess: async (data) => {
      // 🚀 [NEW] IP Address ও Device Info ব্যাকএন্ডে সেভ করার জন্য API Call
      if (data.user) {
        try {
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          await fetch(`${backendUrl}/api/v1/auth/save-device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: data.user.id,
              device_name: /Mobile|Android|iP(hone|od|ad)/.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop/Laptop',
              os_or_browser: navigator.userAgent
            })
          });
        } catch (err) {
          console.error('IP saving process failed:', err);
        }
        
        onSuccess(data.submittedEmail);
      }
    },
    onError: (error) => {
      setCustomError(getRegisterErrorMessage(error));
    },
  });

  const isPending = registerMutation.isPending;
  const errorId = customError ? "register-form-error" : undefined;

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "username" ? value.trim().toLowerCase() : value,
    }));

    if (customError) {
      setCustomError(null);
    }
  };

  const validateForm = (): string | null => {
    const normalizedData = normalizeRegisterData(formData);
    const confirmPassword = formData.confirmPassword;

    if (!normalizedData.fullName) {
      return "পুরো নাম লিখুন।";
    }

    if (normalizedData.fullName.length < 2) {
      return "পুরো নাম কমপক্ষে ২ অক্ষরের হতে হবে।";
    }

    if (normalizedData.fullName.length > MAX_FULL_NAME_LENGTH) {
      return `পুরো নাম ${MAX_FULL_NAME_LENGTH} অক্ষরের বেশি হতে পারবে না।`;
    }

    if (!normalizedData.username) {
      return "ইউজারনেম লিখুন।";
    }

    if (normalizedData.username.length < MIN_USERNAME_LENGTH) {
      return `ইউজারনেম কমপক্ষে ${MIN_USERNAME_LENGTH} অক্ষরের হতে হবে।`;
    }

    if (normalizedData.username.length > MAX_USERNAME_LENGTH) {
      return `ইউজারনেম ${MAX_USERNAME_LENGTH} অক্ষরের বেশি হতে পারবে না।`;
    }

    if (!USERNAME_PATTERN.test(normalizedData.username)) {
      return "ইউজারনেমে শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করা যাবে।";
    }

    if (!normalizedData.email) {
      return "ইমেইল অ্যাড্রেস লিখুন।";
    }

    if (!EMAIL_PATTERN.test(normalizedData.email)) {
      return "সঠিক ইমেইল অ্যাড্রেস লিখুন।";
    }

    if (normalizedData.password.length < MIN_PASSWORD_LENGTH) {
      return `পাসওয়ার্ড অন্তত ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`;
    }

    if (normalizedData.password !== confirmPassword) {
      return "পাসওয়ার্ড দুটি মিলছে না।";
    }

    return null;
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCustomError(null);

    const validationError = validateForm();

    if (validationError) {
      setCustomError(validationError);
      return;
    }

    registerMutation.mutate(formData);
  };

  const inputClasses =
    "w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-base text-text-primary transition-colors placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="w-full">
      {customError && (
        <div
          id="register-form-error"
          role="alert"
          aria-live="polite"
          className="mb-3 flex items-start gap-2 rounded-xl border border-border-color bg-surface-elevated p-2.5 text-sm text-text-primary"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-primary"
            aria-hidden="true"
          />
          <p className="font-medium leading-5">{customError}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3" noValidate>
        <input
          id="register-full-name"
          type="text"
          required
          autoComplete="name"
          maxLength={MAX_FULL_NAME_LENGTH}
          disabled={isPending}
          className={inputClasses}
          placeholder="পুরো নাম"
          value={formData.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
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
          minLength={MIN_USERNAME_LENGTH}
          maxLength={MAX_USERNAME_LENGTH}
          disabled={isPending}
          className={`${inputClasses} lowercase`}
          placeholder="ইউজারনেম (ছোট হাতের অক্ষর ও সংখ্যা)"
          value={formData.username}
          onChange={(event) => updateField("username", event.target.value)}
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
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={Boolean(customError)}
          aria-describedby={errorId}
        />

        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            disabled={isPending}
            className={`${inputClasses} pr-12`}
            placeholder={`পাসওয়ার্ড (অন্তত ${MIN_PASSWORD_LENGTH} অক্ষরের)`}
            value={formData.password}
            onChange={(event) => updateField("password", event.target.value)}
            aria-invalid={Boolean(customError)}
            aria-describedby={errorId}
          />

          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:cursor-not-allowed"
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <input
          id="register-confirm-password"
          type={showPassword ? "text" : "password"}
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          disabled={isPending}
          className={inputClasses}
          placeholder="পাসওয়ার্ড নিশ্চিত করুন"
          value={formData.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          aria-invalid={Boolean(customError)}
          aria-describedby={errorId}
        />

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-lg font-bold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>সাইন আপ...</span>
            </>
          ) : (
            "সাইন আপ"
          )}
        </button>
      </form>
    </div>
  );
}
