'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/generated/prisma/client';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-main mb-4">403</h1>
            <p className="text-text-subtle">You do not have permission to access this page.</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
