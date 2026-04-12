import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');

  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: async (targetIdentifier: string) => {
      await authService.resetPassword(
        targetIdentifier,
        `${window.location.origin}/auth/update-password`
      );
      return true;
    },
  });

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (identifier.trim()) {
      resetPassword(identifier);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 bg-[var(--dyn-bg)]">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Title */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-bold text-[var(--dyn-text)]">
            পাসওয়ার্ড ভুলে গেছেন?
          </h1>
          <p className="text-sm px-4 text-[color-mix(in_srgb,var(--dyn-text)_60%,transparent)]">
            পাসওয়ার্ড রিসেট করতে আপনার ইমেইল অথবা ইউজারনেম দিন।
          </p>
        </div>

        <div className="w-full">
          {isSuccess ? (
            <div className="p-6 rounded-2xl flex flex-col items-center text-center border border-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)] bg-[var(--dyn-card)]">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[color-mix(in_srgb,var(--dyn-primary)_15%,transparent)]">
                <CheckCircle className="w-8 h-8 text-[var(--dyn-primary)]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--dyn-text)]">ইমেইল চেক করুন</h3>
              <p className="mb-6 text-[color-mix(in_srgb,var(--dyn-text)_70%,transparent)]">
                আপনার অ্যাকাউন্টের সাথে যুক্ত ইমেইলে রিসেট লিংক পাঠানো হয়েছে।
              </p>
              <Link 
                to="/auth/login"
                className="w-full py-3.5 px-4 font-bold text-lg rounded-full transition-all duration-200 flex justify-center items-center hover:opacity-90 active:scale-[0.98] bg-[var(--dyn-primary)] text-[var(--dyn-bg)]"
              >
                লগইনে ফিরে যান
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="mb-4 p-3 flex items-start gap-2 rounded-lg text-sm border border-[color-mix(in_srgb,#ef4444_30%,transparent)] bg-[color-mix(in_srgb,#ef4444_10%,transparent)] text-[#ef4444]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-medium">{error instanceof Error ? error.message : 'অজানা ত্রুটি ঘটেছে।'}</p>
                </div>
              )}

              <input
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-xl focus:outline-none transition-colors text-base bg-[var(--dyn-card)] text-[var(--dyn-text)] border border-[color-mix(in_srgb,var(--dyn-text)_20%,transparent)] focus:border-[var(--dyn-primary)] placeholder:text-[color-mix(in_srgb,var(--dyn-text)_40%,transparent)]"
                placeholder="ইমেইল বা ইউজারনেম"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />

              <button
                type="submit"
                disabled={isPending || !identifier.trim()}
                className="w-full mt-2 py-3.5 px-4 font-bold text-lg rounded-full transition-all duration-200 flex justify-center items-center gap-2 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--dyn-primary)] text-[var(--dyn-bg)]"
              >
                {isPending ? <Loader2 className="animate-spin h-6 w-6" /> : 'রিসেট লিংক পাঠান'}
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        {!isSuccess && (
          <div className="w-full mt-8 flex justify-center">
            <Link 
              to="/auth/login" 
              className="flex items-center gap-2 font-medium transition-colors hover:opacity-70 text-[var(--dyn-text)]"
            >
              <ArrowLeft className="w-4 h-4" />
              লগইনে ফিরে যান
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
