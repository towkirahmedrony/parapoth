import { type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { PasswordInput } from "./PasswordInput";
import {
  FORGOT_PASSWORD_PATH,
  MIN_PASSWORD_LENGTH,
  type PasswordVisibilityState,
} from "../utils/changePasswordUtils";

type ChangePasswordFormProps = {
  isRecoveryMode: boolean;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  visibleFields: PasswordVisibilityState;
  isLoading: boolean;
  isSuccess: boolean;
  canSubmit: boolean;
  errorId?: string;
  hasError: boolean;
  onOldPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleOldVisibility: () => void;
  onToggleNewVisibility: () => void;
  onToggleConfirmVisibility: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChangePasswordForm({
  isRecoveryMode,
  oldPassword,
  newPassword,
  confirmPassword,
  visibleFields,
  isLoading,
  isSuccess,
  canSubmit,
  errorId,
  hasError,
  onOldPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleOldVisibility,
  onToggleNewVisibility,
  onToggleConfirmVisibility,
  onSubmit,
}: ChangePasswordFormProps) {
  const isDisabled = isLoading || isSuccess;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {!isRecoveryMode && (
        <>
          <PasswordInput
            id="current-password"
            label="বর্তমান পাসওয়ার্ড"
            value={oldPassword}
            placeholder="বর্তমান পাসওয়ার্ড দিন"
            autoComplete="current-password"
            isVisible={visibleFields.old}
            disabled={isDisabled}
            required
            errorId={errorId}
            hasError={hasError}
            toggleLabelWhenVisible="বর্তমান পাসওয়ার্ড লুকান"
            toggleLabelWhenHidden="বর্তমান পাসওয়ার্ড দেখুন"
            onChange={onOldPasswordChange}
            onToggleVisibility={onToggleOldVisibility}
            rightAction={
              <Link
                to={FORGOT_PASSWORD_PATH}
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            }
          />

          <div className="border-t border-border-color pt-2" />
        </>
      )}

      <PasswordInput
        id="new-password"
        label="নতুন পাসওয়ার্ড"
        value={newPassword}
        placeholder={`নতুন পাসওয়ার্ড দিন, অন্তত ${MIN_PASSWORD_LENGTH} অক্ষর`}
        autoComplete="new-password"
        isVisible={visibleFields.new}
        disabled={isDisabled}
        required
        minLength={MIN_PASSWORD_LENGTH}
        errorId={errorId}
        hasError={hasError}
        toggleLabelWhenVisible="নতুন পাসওয়ার্ড লুকান"
        toggleLabelWhenHidden="নতুন পাসওয়ার্ড দেখুন"
        onChange={onNewPasswordChange}
        onToggleVisibility={onToggleNewVisibility}
      />

      <PasswordInput
        id="confirm-new-password"
        label="নতুন পাসওয়ার্ড নিশ্চিত করুন"
        value={confirmPassword}
        placeholder="আবার নতুন পাসওয়ার্ড দিন"
        autoComplete="new-password"
        isVisible={visibleFields.confirm}
        disabled={isDisabled}
        required
        minLength={MIN_PASSWORD_LENGTH}
        errorId={errorId}
        hasError={hasError}
        toggleLabelWhenVisible="নিশ্চিতকরণ পাসওয়ার্ড লুকান"
        toggleLabelWhenHidden="নিশ্চিতকরণ পাসওয়ার্ড দেখুন"
        onChange={onConfirmPasswordChange}
        onToggleVisibility={onToggleConfirmVisibility}
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-lg font-bold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>আপডেট হচ্ছে...</span>
          </>
        ) : isRecoveryMode ? (
          "পাসওয়ার্ড সেভ করুন"
        ) : (
          "পাসওয়ার্ড পরিবর্তন করুন"
        )}
      </button>
    </form>
  );
}
