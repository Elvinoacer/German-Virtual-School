'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export function useSessions(params?: { courseId?: string; status?: string }) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.courseId) searchParams.append('courseId', params.courseId);
      if (params?.status) searchParams.append('status', params.status);
      
      const { data } = await axios.get(`/sessions?${searchParams.toString()}`);
      return data;
    },
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const { data } = await axios.get(`/sessions/${sessionId}`);
      return data;
    },
    enabled: !!sessionId,
  });
}
