'use client';

import { useInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function StudentBillingPage() {
  const { data: invoices, isLoading, refetch } = useInvoices();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD-PAYMENT');

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowSuccess(true);
      refetch();
      // Clean up URL
      router.replace('/student/billing');
      // Hide banner after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams, refetch, router]);

  // Calculate totals from API data
  const totalOutstanding = invoices?.reduce((sum: number, inv: any) => 
    sum + (parseFloat(inv.amount) - parseFloat(inv.paidAmount)), 0
  ) || 0;

  const totalPaid = invoices?.reduce((sum: number, inv: any) => 
    sum + parseFloat(inv.paidAmount), 0
  ) || 0;

  const overdueInvoices = invoices?.filter((inv: any) => 
    inv.status === 'OVERDUE'
  ).length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'green';
      case 'PARTIAL': return 'orange';
      case 'OVERDUE': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark h-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {showSuccess && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
              <div>
                <h3 className="text-green-800 dark:text-green-200 font-semibold">Payment Successful</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">Your payment has been processed successfully. Your balance has been updated.</p>
              </div>
            </div>
          )}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-main dark:text-white mb-2">
                Billing & Payments
              </h1>
              <p className="text-text-subtle">
                Manage your course fees and payment history
              </p>
            </div>
            <Link 
              href="/student/billing/history"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
              View Payment History
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-subtle text-sm font-medium">Outstanding Balance</p>
                <span className="material-symbols-outlined text-orange-500">account_balance_wallet</span>
              </div>
              <p className="text-3xl font-bold text-text-main dark:text-white">
                ${totalOutstanding.toFixed(2)}
              </p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-subtle text-sm font-medium">Total Paid</p>
                <span className="material-symbols-outlined text-green-500">check_circle</span>
              </div>
              <p className="text-3xl font-bold text-text-main dark:text-white">
                ${totalPaid.toFixed(2)}
              </p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-subtle text-sm font-medium">Overdue</p>
                <span className="material-symbols-outlined text-red-500">warning</span>
              </div>
              <p className="text-3xl font-bold text-text-main dark:text-white">
                {overdueInvoices}
              </p>
            </div>
          </div>

          {/* Invoices List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">
                receipt_long
              </span>
              <h3 className="text-xl font-semibold text-text-main dark:text-white mb-2">
                No invoices yet
              </h3>
              <p className="text-text-subtle mb-6">
                You don't have any invoices at the moment.
              </p>
              <Link href="/courses" className="text-primary hover:underline">
                Browse courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice: any) => {
                const statusColor = getStatusColor(invoice.status);
                const remaining = invoice.amount - invoice.paidAmount;

                return (
                  <div
                    key={invoice.id}
                    className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white">{invoice.course?.title || 'Course'}</h3>
                            <p className="text-text-subtle text-sm">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded bg-${statusColor}-100 dark:bg-${statusColor}-900/20 text-${statusColor}-600 dark:text-${statusColor}-400`}>
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-text-subtle text-sm">Amount</p>
                            <p className="text-xl font-bold text-text-main dark:text-white">
                              ${parseFloat(invoice.amount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-subtle text-sm">Paid</p>
                            <p className="text-xl font-bold text-green-500">
                              ${parseFloat(invoice.paidAmount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-subtle text-sm">Outstanding</p>
                            <p className="text-xl font-bold text-orange-500">
                              ${remaining.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        {remaining > 0 && (
                            <div className="mt-4 flex justify-end items-center gap-4">
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="block rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary shadow-sm py-2 px-3"
                                >
                                    <option value="CARD-PAYMENT">Card Payment</option>

                                </select>
                                <button 
                                    onClick={async () => {
                                        try {
                                            const res = await axiosInstance.post(`/invoices/${invoice.id}/pay`, {
                                                invoiceId: invoice.id,
                                                amount: remaining,
                                                method: paymentMethod
                                            });
                                            if (res.data?.data?.checkoutUrl) {
                                                window.location.href = res.data.data.checkoutUrl;
                                            }
                                        } catch (err: any) {
                                            toast.error(err?.response?.data?.message || "Failed to initiate payment. Please try again.");
                                            console.error("Payment initiation error:", err);
                                        }
                                    }}
                                    className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                                >
                                    Pay Now
                                </button>
                            </div>
                        )}

                        {/* Payment History */}
                        {invoice.payments && invoice.payments.length > 0 && (
                          <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <h4 className="text-md font-semibold mb-2">Payment History</h4>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                              {invoice.payments.map((payment: any) => (
                                <li key={payment.id} className="py-2 flex justify-between items-center text-sm">
                                  <span className="text-text-subtle">{new Date(payment.processedAt).toLocaleDateString()}</span>
                                  <span className="font-bold text-green-500">${parseFloat(payment.amount).toFixed(2)}</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white">{payment.method}</span>
                                  <span className={`text-xs font-semibold ${payment.status === 'COMPLETED' ? 'text-green-500' : 'text-gray-500'}`}>{payment.status}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
