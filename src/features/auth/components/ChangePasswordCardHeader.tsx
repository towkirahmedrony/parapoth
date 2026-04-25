import { KeyRound, Lock } from "lucide-react";

type ChangePasswordCardHeaderProps = {
  isRecoveryMode: boolean;
};

export function ChangePasswordCardHeader({
  isRecoveryMode,
}: ChangePasswordCardHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated text-text-primary">
        {isRecoveryMode ? (
          <KeyRound size={32} aria-hidden="true" />
        ) : (
          <Lock size={32} aria-hidden="true" />
        )}
      </div>

      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        {isRecoveryMode ? "নতুন পাসওয়ার্ড সেট করুন" : "পাসওয়ার্ড আপডেট করুন"}
      </h2>

      <p className="text-sm leading-6 text-text-secondary">
        {isRecoveryMode
          ? "আপনার অ্যাকাউন্টের জন্য একটি নতুন এবং শক্তিশালী পাসওয়ার্ড দিন।"
          : "নিরাপত্তার স্বার্থে প্রথমে আপনার বর্তমান পাসওয়ার্ডটি দিন।"}
      </p>
    </div>
  );
}
