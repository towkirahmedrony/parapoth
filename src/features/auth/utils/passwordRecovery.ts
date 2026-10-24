export const PASSWORD_RECOVERY_ROUTE_PATH = "/auth/change-password";

export const PASSWORD_RECOVERY_REDIRECT_PATH = `${PASSWORD_RECOVERY_ROUTE_PATH}?mode=recovery`;

export const PASSWORD_RECOVERY_PUBLIC_MESSAGE =
  "যদি এই ইমেইলটি কোনো অ্যাকাউন্টের সঙ্গে মিলে, তাহলে রিসেটের নির্দেশনা পাঠানো হবে। ইনবক্স বা স্প্যাম ফোল্ডার দেখুন, প্রয়োজনে পরে আবার চেষ্টা করুন।";

export type PasswordRecoveryErrorKind = "expired" | "invalid";

export const PASSWORD_RECOVERY_ERROR_MESSAGES: Record<
  PasswordRecoveryErrorKind,
  string
> = {
  expired:
    "পাসওয়ার্ড রিসেট লিংকটির মেয়াদ শেষ হয়েছে। নতুন করে রিসেট লিংক পাঠান।",
  invalid:
    "পাসওয়ার্ড রিসেট লিংকটি সঠিক নয় বা ইতিমধ্যে ব্যবহার করা হয়েছে। নতুন করে রিসেট লিংক পাঠান।",
};

/**
 * Supabase reports a failed recovery redirect in the URL instead of throwing:
 * `#error=access_denied&error_code=otp_expired&error_description=...` for
 * implicit links and `?error=...` for PKCE ones. The SDK does not clear the
 * fragment on failure, so the values can still be read on the reset page.
 */
export function getRecoveryErrorKind(
  search: URLSearchParams,
  hash: URLSearchParams
): PasswordRecoveryErrorKind | null {
  const error = search.get("error") ?? hash.get("error");
  const errorCode = search.get("error_code") ?? hash.get("error_code");
  const description =
    search.get("error_description") ?? hash.get("error_description");

  if (!error && !errorCode && !description) return null;

  const haystack = `${errorCode ?? ""} ${description ?? ""}`.toLowerCase();

  if (
    haystack.includes("otp_expired") ||
    haystack.includes("expired") ||
    haystack.includes("token has expired")
  ) {
    return "expired";
  }

  return "invalid";
}

export function readPasswordRecoveryErrorFromUrl(location: {
  search: string;
  hash: string;
}): PasswordRecoveryErrorKind | null {
  return getRecoveryErrorKind(
    new URLSearchParams(location.search.replace(/^\?/, "")),
    new URLSearchParams(location.hash.replace(/^#/, ""))
  );
}

export function normalizeRecoveryReason(
  value: string | null
): PasswordRecoveryErrorKind | null {
  return value === "expired" || value === "invalid" ? value : null;
}

export type PasswordRecoveryAuth = {
  resetPasswordForEmail: (
    email: string,
    options: { redirectTo: string }
  ) => Promise<{ error: unknown | null }>;
};

/**
 * Requests recovery directly from Supabase Auth. It intentionally does not
 * read profile rows and does not expose Auth errors that could reveal whether
 * an account exists.
 */
export async function requestPasswordRecovery(
  email: string,
  auth: PasswordRecoveryAuth,
  origin: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;

  try {
    await auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${origin}${PASSWORD_RECOVERY_REDIRECT_PATH}`,
    });
  } catch {
    // Keep the public response identical for account-existence and Auth errors.
  }
}
