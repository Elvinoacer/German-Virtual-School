'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await axios.get('/finance/invoices');
      return data.data; // Response is { success: true, data: [...] }
    },
  });
}
