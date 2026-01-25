'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RoleGuard } from '@/components/RoleGuard';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['STUDENT']}>
        {children}
      </RoleGuard>
    </ProtectedRoute>
  );
}
