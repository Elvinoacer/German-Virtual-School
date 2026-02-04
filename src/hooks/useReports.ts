'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import axios from '@/lib/axios';

export function useStudentReport() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['report', 'student', user?.id],
    queryFn: async () => {
      const { data } = await axios.get(`/reports/student/${user?.id}`);
      return data;
    },
    enabled: !!user?.id,
  });
}
