import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; 
import { ShieldAlert, MailWarning } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  requiredPermission, 
  fallback 
}: PermissionGuardProps) {
  const { user, role, permissions, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // --- নতুন ইমেইল ভেরিফিকেশন চেক ---
  // যদি ইউজারের ইমেইল ভেরিফাইড না থাকে, তবে ড্যাশবোর্ডে না ঢুকতে দিয়ে এই স্ক্রিনটি দেখাবে
  if (user && !user.email_confirmed_at) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 rounded-full bg-accent/10 p-4">
          <MailWarning className="h-12 w-12 text-accent" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-text-primary">
          ইমেইল ভেরিফিকেশন প্রয়োজন
        </h2>
        <p className="mb-6 max-w-md leading-relaxed text-[15px] text-text-secondary">
          এগিয়ে যাওয়ার আগে অনুগ্রহ করে আপনার <strong className="text-primary">{user.email}</strong> ইনবক্স চেক করে অ্যাকাউন্টটি ভেরিফাই করুন। ইনবক্সে না পেলে স্প্যাম (Spam) বা জাঙ্ক ফোল্ডার চেক করতে পারেন।
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md hover:opacity-90 active:scale-95 transition-all"
        >
          আমি ভেরিফাই করেছি
        </button>
      </div>
    );
  }

  const hasPermission = role === 'admin' || !requiredPermission || permissions.includes(requiredPermission);

  if (!hasPermission) {
    return fallback || (
      <div className="flex h-[60vh] flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="mb-4 h-12 w-12 text-accent" />
        <h2 className="text-xl font-bold text-text-primary">Access Denied</h2>
        <p className="mt-2 text-text-secondary">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
