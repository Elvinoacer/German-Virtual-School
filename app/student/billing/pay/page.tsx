"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useInvoices } from '@/hooks/useInvoices';
import axios from '@/lib/axios';

export default function MakePaymentPage() {
  const { data: invoices, isLoading } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!selectedInvoice && invoices && invoices.length > 0) {
      const unpaid = invoices.find((inv: any) => inv.status !== 'PAID');
      if (unpaid) {
        setSelectedInvoice(unpaid);
        setAmount((parseFloat(unpaid.amount) - parseFloat(unpaid.paidAmount)).toString());
      }
    }
  }, [invoices, selectedInvoice]);

  const handlePay = async () => {
    if (!selectedInvoice) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`/api/invoices/${selectedInvoice.id}/pay`, {
        amount: parseFloat(amount),
        method,
      });
      
      const { checkoutUrl } = response.data.data;
      if (checkoutUrl) {
          window.location.href = checkoutUrl;
      } else {
          setSuccess('Payment initiated but no checkout URL returned.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased min-h-screen flex flex-col transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark px-4 md:px-10 py-3 sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <div className="size-8 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Deutsche Virtuelle Schule
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <Link
              className="text-slate-900 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal"
              href="/courses"
            >
              Kurse
            </Link>
            <Link
              className="text-slate-900 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal"
              href="/student/billing"
            >
              Abrechnung
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-col min-h-screen">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-12 lg:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
              {/* Breadcrumbs */}
              <div className="flex flex-wrap items-center gap-2 whitespace-nowrap p-4">
                <Link
                  className="text-slate-500 hover:text-primary transition-colors text-sm font-medium leading-normal flex items-center gap-1"
                  href="/student/dashboard"
                >
                  <span className="material-symbols-outlined text-lg">
                    home
                  </span>
                  Home
                </Link>
                <span className="text-slate-500 text-sm font-medium leading-normal">
                  /
                </span>
                <Link
                  className="text-slate-500 hover:text-primary transition-colors text-sm font-medium leading-normal"
                  href="/student/billing"
                >
                  Abrechnung
                </Link>
                <span className="text-slate-500 text-sm font-medium leading-normal">
                  /
                </span>
                <span className="text-slate-900 dark:text-white text-sm font-medium leading-normal">
                  Kasse
                </span>
              </div>

              {/* Page Heading */}
              <div className="flex flex-wrap justify-between gap-3 px-4 pb-6">
                <div className="flex min-w-72 flex-col gap-2">
                  <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                    Zahlung abschließen
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                    Sichere Kasse für die Deutsche Virtuelle Schule.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800">
                  <span className="material-symbols-outlined text-sm filled">
                    lock
                  </span>
                  <span className="text-xs font-bold tracking-wide uppercase">
                    256-bit SSL Verschlüsselt
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 pb-20">
                {/* Left Column: Payment Method & Details */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Invoice Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Select Invoice</label>
                    <select
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-11 px-4"
                      value={selectedInvoice?.id || ''}
                      onChange={e => {
                        const inv = invoices?.find((i: any) => i.id === e.target.value);
                        setSelectedInvoice(inv);
                        if (inv) {
                            setAmount((parseFloat(inv.amount) - parseFloat(inv.paidAmount)).toString());
                        }
                      }}
                    >
                      <option value="" disabled>Select an invoice</option>
                      {invoices && invoices.filter((inv: any) => inv.status !== 'PAID').map((inv: any) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.course?.title || 'Course'} - Due {new Date(inv.dueDate).toLocaleDateString()} - KES {parseFloat(inv.amount).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Payment Method Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                    <select
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-11 px-4"
                      value={method}
                      onChange={e => setMethod(e.target.value)}
                    >
                      <option value="CARD">Credit Card</option>
                      <option value="BANK_TRANSFER">SEPA Bank Transfer</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="STRIPE">Stripe</option>
                    </select>
                  </div>
                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <input
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-11 px-4"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      disabled={!selectedInvoice}
                    />
                  </div>
                  <button
                    className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-primary hover:bg-blue-700 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    onClick={handlePay}
                    disabled={loading || !selectedInvoice || !amount}
                  >
                    {loading ? 'Processing...' : `Pay KES ${amount}`}
                  </button>
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                  {success && <p className="text-green-500 mt-2">{success}</p>}
                </div>
                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Summary Card */}
                  {selectedInvoice && (
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24 transition-colors duration-200">
                      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold">Invoice Summary</h3>
                      </div>
                      <div className="p-6 flex flex-col gap-6">
                        <div className="flex gap-4">
                          <div className="flex flex-col gap-1">
                            <h4 className="text-slate-900 dark:text-white font-bold leading-tight">{selectedInvoice.course?.title || 'Course'}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Amount: KES {parseFloat(selectedInvoice.amount).toFixed(2)}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Paid: KES {parseFloat(selectedInvoice.paidAmount).toFixed(2)}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding: KES {(parseFloat(selectedInvoice.amount) - parseFloat(selectedInvoice.paidAmount)).toFixed(2)}</p>
                          </div>
                        </div>
                        {/* Payment History */}
                        {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-md font-semibold mb-2">Payment History</h4>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                              {selectedInvoice.payments.map((payment: any) => (
                                <li key={payment.id} className="py-2 flex justify-between items-center">
                                  <span className="text-sm text-text-subtle">{new Date(payment.processedAt).toLocaleDateString()}</span>
                                  <span className="text-sm font-bold text-green-500">KES {parseFloat(payment.amount).toFixed(2)}</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white">{payment.method}</span>
                                  <span className="text-xs px-2 py-1 rounded-full text-white bg-green-500">{payment.status}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
