'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    role: session?.user?.role,
    isStudent: session?.user?.role === 'STUDENT',
    isTeacher: session?.user?.role === 'TEACHER',
    isAdmin: session?.user?.role === 'ADMIN',
  };
}
