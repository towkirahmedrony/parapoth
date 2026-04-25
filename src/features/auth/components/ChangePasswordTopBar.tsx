import { ArrowLeft } from "lucide-react";

type ChangePasswordTopBarProps = {
  isRecoveryMode: boolean;
  onBack: () => void;
};

export function ChangePasswordTopBar({
  isRecoveryMode,
  onBack,
}: ChangePasswordTopBarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border-color bg-nav-bg/80 px-4 py-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onBack}
        className="rounded-full p-2 text-nav-text transition-colors hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-focus-ring"
        aria-label="আগের পেজে ফিরে যান"
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </button>

      <h1 className="text-lg font-semibold text-nav-text">
        {isRecoveryMode ? "পাসওয়ার্ড রিসেট" : "পাসওয়ার্ড পরিবর্তন"}
      </h1>
    </div>
  );
}
