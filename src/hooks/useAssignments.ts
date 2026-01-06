'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export function useAssignments(courseId?: string) {
  return useQuery({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      const params = courseId ? `?courseId=${courseId}` : '';
      const { data } = await axios.get(`/api/assignments${params}`);
      return data.data || data; // Extract data from response wrapper
    },
  });
}

export function useAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/assignments/${assignmentId}`);
      return data.data;
    },
    enabled: !!assignmentId,
  });
}
