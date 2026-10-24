export const PASSWORD_RECOVERY_REDIRECT_PATH = "/auth/change-password?mode=recovery";

export const PASSWORD_RECOVERY_PUBLIC_MESSAGE =
  "যদি এই ইমেইলটি কোনো অ্যাকাউন্টের সঙ্গে মিলে, তাহলে রিসেটের নির্দেশনা পাঠানো হবে। ইনবক্স বা স্প্যাম ফোল্ডার দেখুন, প্রয়োজনে পরে আবার চেষ্টা করুন।";

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
