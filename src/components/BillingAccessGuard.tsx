'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';
import { format } from 'date-fns';

interface BillingAccessData {
  hasAccess: boolean;
  reason?: string;
  invoiceId?: string;
  amount?: number;
  description?: string;
  dueDate?: string;
}

interface Props {
  children: React.ReactNode;
}

/**
 * BillingAccessGuard
 * 
 * Wraps student content and blocks access if lateFeeAction is BLOCK_ACCESS
 * and the student has overdue invoices.
 */
export function BillingAccessGuard({ children }: Props) {
  const { data, isLoading, isError } = useQuery<BillingAccessData>({
    queryKey: ['billing-access'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/student/billing/access');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1
  });

  // While loading, show content (don't block unnecessarily)
  if (isLoading) {
    return <>{children}</>;
  }

  // On error, allow access (fail open)
  if (isError) {
    return <>{children}</>;
  }

  // If access is granted, show children
  if (data?.hasAccess) {
    return <>{children}</>;
  }

  // Access denied - show payment required screen
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 text-center">
        <div className="size-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">
            block
          </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          Access Restricted
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Your access to the student dashboard has been temporarily restricted due to an outstanding payment.
          Please settle your balance to continue.
        </p>

        {data?.description && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 mb-6 text-left">
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
              Outstanding Invoice
            </p>
            <p className="font-bold text-slate-900 dark:text-white">
              {data.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-slate-500">Amount Due:</span>
              <span className="text-lg font-black text-red-600">
                KES {data.amount?.toLocaleString()}
              </span>
            </div>
            {data.dueDate && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-slate-500">Due Date:</span>
                <span className="text-sm font-bold text-red-500">
                  {format(new Date(data.dueDate), 'MMM dd, yyyy')} (Overdue)
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/student/billing"
            className="w-full py-4 px-6 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            Pay Now
          </Link>
          <Link
            href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@gvs.edu'}`}
            className="w-full py-3 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
