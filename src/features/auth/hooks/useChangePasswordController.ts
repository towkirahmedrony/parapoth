import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { supabase } from "@/shared/lib/supabase";
import {
  clearRecoveryUrlTokens,
  DASHBOARD_HOME_PATH,
  getRecoveryParams,
  getUpdatePasswordErrorMessage,
  LOGIN_PATH,
  type PasswordField,
  type PasswordVisibilityState,
  validatePasswordForm,
} from "../utils/changePasswordUtils";

const DEFAULT_VISIBLE_FIELDS: PasswordVisibilityState = {
  old: false,
  new: false,
  confirm: false,
};

export function useChangePasswordController() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRecoveryParams = useMemo(
    () => getRecoveryParams(searchParams),
    [searchParams]
  );

  const [isRecoveryMode, setIsRecoveryMode] = useState(
    initialRecoveryParams.isRecovery
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [visibleFields, setVisibleFields] =
    useState<PasswordVisibilityState>(DEFAULT_VISIBLE_FIELDS);

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSuccess = Boolean(successMessage);
  const errorId = error ? "change-password-error" : undefined;

  useEffect(() => {
    let isMounted = true;

    const initializeRecoverySession = async () => {
      const recoveryParams = getRecoveryParams(searchParams);

      if (recoveryParams.isRecovery && isMounted) {
        setIsRecoveryMode(true);
      }

      try {
        if (recoveryParams.code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            recoveryParams.code
          );

          if (exchangeError) {
            throw exchangeError;
          }
        } else if (recoveryParams.accessToken && recoveryParams.refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: recoveryParams.accessToken,
            refresh_token: recoveryParams.refreshToken,
          });

          if (setSessionError) {
            throw setSessionError;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          throw sessionError;
        }

        if (!session && !recoveryParams.isRecovery) {
          navigate(LOGIN_PATH, {
            replace: true,
            state: {
              from: {
                pathname: window.location.pathname,
                search: window.location.search,
              },
            },
          });
          return;
        }

        if (!session && recoveryParams.isRecovery) {
          setError(
            "পাসওয়ার্ড রিসেট লিংকটি কাজ করছে না বা মেয়াদ শেষ হয়েছে। নতুন করে রিসেট লিংক পাঠান।"
          );
        }
      } catch (sessionInitError: unknown) {
        if (!isMounted) return;

        setIsRecoveryMode(true);
        setError(getUpdatePasswordErrorMessage(sessionInitError));
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    initializeRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
        setError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  const toggleVisibility = (field: PasswordField) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setVisibleFields(DEFAULT_VISIBLE_FIELDS);
  };

  const clearErrorOnInput = () => {
    if (error) {
      setError(null);
    }
  };

  const verifyCurrentPassword = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      throw new Error("ইউজারের তথ্য পাওয়া যায়নি। আবার লগইন করুন।");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      throw new Error("আপনার বর্তমান পাসওয়ার্ডটি ভুল হয়েছে।");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading || isSuccess) return;

    setError(null);
    setSuccessMessage(null);

    const validationError = validatePasswordForm({
      isRecoveryMode,
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (!isRecoveryMode) {
        await verifyCurrentPassword();
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session found for password update.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      resetForm();
      clearRecoveryUrlTokens();

      setSuccessMessage(
        isRecoveryMode
          ? "পাসওয়ার্ড সফলভাবে রিসেট হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"
          : "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।"
      );
    } catch (submitError: unknown) {
      setError(getUpdatePasswordErrorMessage(submitError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(isRecoveryMode ? LOGIN_PATH : DASHBOARD_HOME_PATH, { replace: true });
  };

  const handleSuccessNavigate = async () => {
    if (isRecoveryMode) {
      await supabase.auth.signOut();
      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    navigate(DASHBOARD_HOME_PATH, { replace: true });
  };

  const canSubmit =
    !isLoading &&
    !isSuccess &&
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    (isRecoveryMode || Boolean(oldPassword));

  return {
    isRecoveryMode,
    oldPassword,
    newPassword,
    confirmPassword,
    visibleFields,
    isLoading,
    isCheckingSession,
    error,
    successMessage,
    isSuccess,
    errorId,
    canSubmit,
    setOldPassword,
    setNewPassword,
    setConfirmPassword,
    toggleVisibility,
    clearErrorOnInput,
    handleSubmit,
    handleBack,
    handleSuccessNavigate,
  };
}
