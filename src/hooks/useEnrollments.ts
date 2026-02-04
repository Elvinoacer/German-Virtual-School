'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export function useEnrollments() {
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: async () => {
      const { data } = await axios.get('/enrollments/me');
      return data.data.enrollments;
    },
  });
}

export function useCourseEnrollment(courseId: string) {
  return useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const { data } = await axios.get(`/courses/${courseId}/enrollment`);
      return data;
    },
    enabled: !!courseId,
  });
}
