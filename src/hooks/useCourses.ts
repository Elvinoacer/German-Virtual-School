'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export function useCourses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
  teacherId?: string;
}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);
      if (params?.level) searchParams.append('level', params.level);
      if (params?.teacherId) searchParams.append('teacherId', params.teacherId);
      
      const { data } = await axios.get(`/api/courses?${searchParams.toString()}`);
      return data.data;
    },
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${courseId}`);
      return data.data;
    },
    enabled: !!courseId,
  });
}
