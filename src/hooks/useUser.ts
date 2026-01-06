'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export function useUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users/me');
      return data;
    },
    retry: false,
  });
}
