import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; 
import { ShieldAlert } from "lucide-react";

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

  const hasPermission = role === 'admin' || !requiredPermission || permissions.includes(requiredPermission);

  if (!hasPermission) {
    return fallback || (
      <div className="flex h-[60vh] flex-col items-center justify-center p-4 text-center">
        <ShieldAlert style={{ color: '#ef4444' }} className="mb-4 h-12 w-12" />
        <h2 style={{ color: 'var(--dyn-text)' }} className="text-xl font-bold">Access Denied</h2>
        <p style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }} className="mt-2">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
