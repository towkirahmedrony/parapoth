import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { supabase } from "@/shared/lib/supabase";

type LoginFormData = {
  identifier: string;
  password: string;
};

type LocationState = {
  from?: {
    pathname?: string;
    search?: string;
  };
};

const INITIAL_FORM_DATA: LoginFormData = {
  identifier: "",
  password: "",
};

function getLoginErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("unauthorized") ||
    message.includes("401")
  ) {
    return "ভুল ইমেইল/ইউজারনেম বা পাসওয়ার্ড।";
  }

  if (message.includes("email not confirmed")) {
    return "আপনার ইমেইল এখনো ভেরিফাই করা হয়নি। ইনবক্স চেক করুন।";
  }

  return "লগইন করতে সমস্যা হচ্ছে। একটু পর আবার চেষ্টা করুন।";
}

function getRedirectPath(state: LocationState | null): string {
  const pathname = state?.from?.pathname;

  if (!pathname || pathname.startsWith("/auth")) {
    return "/dashboard";
  }

  return `${pathname}${state?.from?.search ?? ""}`;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>(INITIAL_FORM_DATA);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      let identifier = credentials.identifier.trim().toLowerCase();
      let loginEmail = identifier;

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      // 🚀 [FIX] ইউজারনেম দিয়ে ইমেইল বের করার জন্য RPC ফাংশন কল করা হলো
      if (!isEmail) {
        const { data: userEmail, error: rpcError } = await supabase.rpc('get_email_by_username', {
          p_username: identifier
        });

        if (rpcError || !userEmail) {
          throw new Error("invalid login credentials");
        }
        
        loginEmail = userEmail as string;
      }

      // আসল ইমেইলটি দিয়ে Supabase Auth এ লগ-ইন
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      if (!data?.session) {
        throw new Error("No session returned from login endpoint.");
      }

      return data;
    },
    onSuccess: async (data) => {
      if (data?.session?.user?.id) {
        try {
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          await fetch(`${backendUrl}/api/v1/auth/save-device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: data.session.user.id,
              device_name: /Mobile|Android|iP(hone|od|ad)/.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop/Laptop',
              os_or_browser: navigator.userAgent
            })
          });
        } catch (err) {
          console.error('IP saving process failed:', err);
        }
      }

      const redirectPath = getRedirectPath(location.state as LocationState | null);
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      setCustomError(getLoginErrorMessage(error));
    },
  });

  const isPending = loginMutation.isPending;
  const errorId = customError ? "login-form-error" : undefined;

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "identifier" ? value.trimStart() : value,
    }));

    if (customError) {
      setCustomError(null);
    }
  };

  const validateForm = (): string | null => {
    const identifier = formData.identifier.trim();
    const password = formData.password;

    if (!identifier) {
      return "ইমেইল বা ইউজারনেম লিখুন।";
    }

    if (!password) {
      return "পাসওয়ার্ড লিখুন।";
    }

    return null;
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCustomError(null);

    const validationError = validateForm();

    if (validationError) {
      setCustomError(validationError);
      return;
    }

    loginMutation.mutate(formData);
  };

  return (
    <div className="w-full">
      {customError && (
        <div
          id="login-form-error"
          role="alert"
          aria-live="polite"
          className="mb-4 flex items-start gap-2 rounded-lg border border-accent bg-surface-elevated p-3 text-sm text-accent"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="font-medium">{customError}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <div className="space-y-1">
          <input
            id="login-identifier"
            type="text"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3.5 text-base text-text-primary transition-colors placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-70"
            placeholder="ইমেইল বা ইউজারনেম"
            value={formData.identifier}
            onChange={(event) => updateField("identifier", event.target.value)}
            disabled={isPending}
            aria-invalid={Boolean(customError)}
            aria-describedby={errorId}
          />
        </div>

        <div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-input-border bg-input-bg py-3.5 pl-4 pr-12 text-base text-text-primary transition-colors placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="পাসওয়ার্ড"
              value={formData.password}
              onChange={(event) => updateField("password", event.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(customError)}
              aria-describedby={errorId}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:cursor-not-allowed"
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              aria-pressed={showPassword}
              disabled={isPending}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="flex justify-end pb-1 pt-2">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-primary transition-colors hover:underline"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-lg font-bold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span>লগ ইন হচ্ছে...</span>
            </>
          ) : (
            "লগ ইন"
          )}
        </button>
      </form>
    </div>
  );
}
