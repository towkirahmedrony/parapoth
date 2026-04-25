export const MIN_PASSWORD_LENGTH = 8;

export const DASHBOARD_HOME_PATH = "/dashboard/home";
export const LOGIN_PATH = "/auth/login";
export const FORGOT_PASSWORD_PATH = "/auth/forgot-password";

export type PasswordField = "old" | "new" | "confirm";

export type RecoveryParams = {
  isRecovery: boolean;
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
};

export type PasswordVisibilityState = Record<PasswordField, boolean>;

export function getHashParams() {
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

export function getRecoveryParams(searchParams: URLSearchParams): RecoveryParams {
  const hashParams = getHashParams();

  const searchType = searchParams.get("type");
  const hashType = hashParams.get("type");

  const searchMode = searchParams.get("mode");
  const hashMode = hashParams.get("mode");

  const code = searchParams.get("code") ?? hashParams.get("code");
  const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");

  const isRecovery =
    searchMode === "recovery" ||
    hashMode === "recovery" ||
    searchType === "recovery" ||
    hashType === "recovery" ||
    Boolean(code) ||
    Boolean(accessToken && refreshToken);

  return {
    isRecovery,
    code,
    accessToken,
    refreshToken,
  };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
}

export function getUpdatePasswordErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("same password") || message.includes("different")) {
    return "নতুন পাসওয়ার্ডটি আগের পাসওয়ার্ডের থেকে আলাদা হতে হবে।";
  }

  if (message.includes("weak") || message.includes("password")) {
    return `পাসওয়ার্ডটি যথেষ্ট শক্তিশালী নয়। অন্তত ${MIN_PASSWORD_LENGTH} অক্ষর ব্যবহার করুন।`;
  }

  if (
    message.includes("session") ||
    message.includes("jwt") ||
    message.includes("expired") ||
    message.includes("invalid login")
  ) {
    return "সেশনটির মেয়াদ শেষ হয়েছে। আবার পাসওয়ার্ড রিসেট লিংক ব্যবহার করুন।";
  }

  return getErrorMessage(error);
}

export function validatePasswordForm({
  isRecoveryMode,
  oldPassword,
  newPassword,
  confirmPassword,
}: {
  isRecoveryMode: boolean;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  if (!isRecoveryMode && !oldPassword) {
    return "বর্তমান পাসওয়ার্ড দিতে হবে।";
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return `নতুন পাসওয়ার্ড অন্তত ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`;
  }

  if (newPassword !== confirmPassword) {
    return "নতুন পাসওয়ার্ড দুটি মিলছে না। অনুগ্রহ করে চেক করুন।";
  }

  if (!isRecoveryMode && oldPassword === newPassword) {
    return "বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড একই হতে পারবে না।";
  }

  return null;
}

export function clearRecoveryUrlTokens() {
  window.history.replaceState(null, "", window.location.pathname);
}
