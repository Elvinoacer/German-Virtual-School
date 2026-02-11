"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";

interface Invoice {
  id: string;
  amount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  description: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  term: string | null;
}

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface BillingSettings {
  defaultFee: number;
  currency: string;
  billingCycle: string;
  lateFeeAction: string | null;
  taxRate: number;
}

interface AdminFinanceData {
  stats: {
    totalRevenue: number;
    totalPaid: number;
    totalOutstanding: number;
    collectionRate: number;
    paidInvoices: number;
    partialInvoices: number;
    overdueInvoices: number;
  };
  invoices: Invoice[];
}

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "settings" | "terms">("invoices");
  const queryClient = useQueryClient();

  // Queries
  const { data: financeData, isLoading: isFinanceLoading } = useQuery<AdminFinanceData>({
    queryKey: ['admin-finance'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/finance');
      return response.data.data;
    }
  });

  const { data: settings, isLoading: isSettingsLoading } = useQuery<BillingSettings>({
    queryKey: ['admin-billing-settings'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/finance/settings');
      return response.data.data;
    },
    enabled: activeTab === 'settings'
  });

  const { data: terms, isLoading: isTermsLoading } = useQuery<Term[]>({
    queryKey: ['admin-terms'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/terms');
      return response.data.data;
    },
    enabled: activeTab === 'terms'
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.patch('/admin/finance/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-billing-settings'] });
      toast.success("Billing settings updated");
    }
  });

  const createTermMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/admin/terms', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-terms'] });
      toast.success("Academic term created");
    }
  });

  const setTermAsCurrentMutation = useMutation({
    mutationFn: async (termId: string) => {
      const response = await axiosInstance.patch(`/admin/terms/${termId}`, { isCurrent: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-terms'] });
      toast.success("Active term updated");
    }
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('/admin/finance/generate');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-finance'] });
      toast.success(data.message || `Generated ${data.data?.created || 0} invoices`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate invoices');
    }
  });

  if (isFinanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Initial State from Query
  const [formData, setFormData] = useState({
    defaultFee: settings?.defaultFee || 5000,
    billingCycle: settings?.billingCycle || 'ONE_TIME',
    lateFeeAction: settings?.lateFeeAction || 'ROLL_TO_NEXT',
    applyToStudents: false
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        defaultFee: settings.defaultFee,
        billingCycle: settings.billingCycle,
        lateFeeAction: settings.lateFeeAction || 'ROLL_TO_NEXT',
      }));
    }
  }, [settings]);

  const handleCreateTerm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTermMutation.mutate({
      name: formData.get("name"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isCurrent: formData.get("isCurrent") === "on",
    });
    e.currentTarget.reset();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      defaultFee: formData.defaultFee,
      billingCycle: formData.billingCycle,
      lateFeeAction: formData.lateFeeAction,
      applyToStudents: formData.applyToStudents
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white">
            Finance & Billing Management
          </h1>
          <p className="text-[#4c669a] text-sm mt-1">
            Configure school fees, academic terms, and track global revenue
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto hide-scrollbar">
          {(["invoices", "settings", "terms"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab 
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "invoices" && financeData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="material-symbols-outlined text-green-600 text-6xl">payments</span>
               </div>
               <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total Paid Revenue</p>
               <h3 className="text-3xl font-black text-green-600">
                 KES {financeData.stats.totalPaid.toLocaleString()}
               </h3>
               <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <span className="text-green-500 flex items-center"><span className="material-symbols-outlined text-xs">trending_up</span> {financeData.stats.collectionRate}%</span> 
                  collection rate
               </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="material-symbols-outlined text-red-600 text-6xl">account_balance</span>
               </div>
               <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Outstanding Arrears</p>
               <h3 className="text-3xl font-black text-red-600">
                 KES {financeData.stats.totalOutstanding.toLocaleString()}
               </h3>
               <p className="mt-4 text-[10px] font-bold text-slate-400">Total uncollected amount</p>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="material-symbols-outlined text-primary text-6xl">receipt_long</span>
               </div>
               <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Paid Invoices</p>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                 {financeData.stats.paidInvoices}
               </h3>
               <p className="mt-4 text-[10px] font-bold text-slate-400">Fully cleared bills</p>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="material-symbols-outlined text-orange-600 text-6xl">warning</span>
               </div>
               <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Overdue Alerts</p>
               <h3 className="text-3xl font-black text-orange-600">
                 {financeData.stats.overdueInvoices}
               </h3>
               <p className="mt-4 text-[10px] font-bold text-slate-400">Payment deadlines missed</p>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Recent Invoices</h2>
              <Button 
                onClick={() => generateInvoicesMutation.mutate()} 
                disabled={generateInvoicesMutation.isPending}
                className="flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">receipt_long</span>
                {generateInvoicesMutation.isPending ? 'Generating...' : 'Generate Invoices'}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {financeData.invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-900 dark:text-white leading-none mb-1">{invoice.student.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{invoice.student.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">
                        {invoice.description || 'N/A'}
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900 dark:text-white">
                        KES {invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 font-black text-green-600">
                        KES {invoice.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          invoice.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-500 text-right">
                        {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-white dark:bg-surface-dark p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-8xl">settings_input_component</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Global Billing Rules</h2>
              <p className="text-slate-500 text-sm font-medium mb-10">Define fixed fees and recurring billing cycles for the school.</p>
              
              <form onSubmit={handleUpdateSettings} className="space-y-8 relative">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Default School Fee (KES)</label>
                    <Input 
                      name="defaultFee" 
                      type="number" 
                      value={formData.defaultFee} 
                      onChange={handleInputChange}
                      className="h-14 rounded-2xl bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-black text-lg"
                      placeholder="5,000"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Recurring Billing Cycle</label>
                    <select 
                      name="billingCycle" 
                      value={formData.billingCycle}
                      onChange={handleInputChange}
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-bold text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="SEMESTER">Semester (Per Current Term)</option>
                      <option value="QUARTERLY">Quarterly (3 Months)</option>
                      {/* <option value="BIANNUAL">Bi-Annual</option> */}
                      {/* <option value="ONE_TIME">One Time Payment</option> */}
                    </select>
                 </div>

                 {/* Bulk Apply Checkbox */}
                 <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <input 
                      type="checkbox" 
                      name="applyToStudents" 
                      id="applyToStudents" 
                      checked={formData.applyToStudents}
                      onChange={handleInputChange}
                      className="mt-1 size-5 rounded border-blue-300 text-primary focus:ring-primary transition-all" 
                    />
                    <div>
                      <label htmlFor="applyToStudents" className="text-sm font-bold text-blue-900 dark:text-blue-100 block">Apply to all active enrollments?</label>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        If checked, this will update the billing cycle for ALL currently active students to <strong>{formData.billingCycle}</strong> immediately.
                      </p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Late Payment Action</label>
                    <select 
                      name="lateFeeAction" 
                      value={formData.lateFeeAction}
                      onChange={handleInputChange}
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-bold text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                      <option value="ROLL_TO_NEXT">Automatically roll arrears to next cycle</option>
                      <option value="BLOCK_ACCESS">Restrict dashboard access until paid</option>
                      <option value="NONE">Manual intervention only</option>
                    </select>
                 </div>
                 <Button type="submit" disabled={updateSettingsMutation.isPending} className="w-full h-14 rounded-2xl text-base font-black shadow-2xl shadow-primary/20">
                   {updateSettingsMutation.isPending ? "Updating Settings..." : "Save Global Rules"}
                 </Button>
              </form>
           </div>

           <div className="flex flex-col justify-center items-center p-10 bg-primary/5 dark:bg-primary/20 rounded-[40px] border-2 border-dashed border-primary/20">
              <span className="material-symbols-outlined text-6xl text-primary mb-6">info</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">Automated Arrears Handling</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-center max-w-sm">
                When "Roll Arrears" is active, Any unpaid balance at the end of a semester will be automatically added to the student's next invoice.
              </p>
           </div>
        </div>
      )}

      {activeTab === "terms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Term List */}
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                Academic Calendar
              </h2>
              <div className="grid grid-cols-1 gap-4">
                 {terms?.map((term) => (
                   <div key={term.id} className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group transition-all hover:border-primary/40">
                      <div className="flex items-center gap-5">
                         <div className={`size-12 rounded-2xl flex items-center justify-center ${term.isCurrent ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                           <span className="material-symbols-outlined">event</span>
                         </div>
                         <div>
                            <h4 className="font-black text-slate-900 dark:text-white">{term.name}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                               {format(new Date(term.startDate), "MMM yyyy")} — {format(new Date(term.endDate), "MMM yyyy")}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         {term.isCurrent ? (
                           <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">Active Term</span>
                         ) : (
                           <button 
                             onClick={() => setTermAsCurrentMutation.mutate(term.id)}
                             disabled={setTermAsCurrentMutation.isPending}
                             className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                           >
                             Set Active
                           </button>
                         )}
                      </div>
                   </div>
                 ))}
                 {terms?.length === 0 && (
                   <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 italic text-slate-400">
                      No academic terms defined yet.
                   </div>
                 )}
              </div>
           </div>

           {/* Create Term Form */}
           <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl h-fit">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Add New Semester</h3>
              <form onSubmit={handleCreateTerm} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Semester Name</label>
                    <Input name="name" required placeholder="e.g. Term 1 - 2026" className="h-12 rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Start Date</label>
                    <Input name="startDate" type="date" required className="h-12 rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">End Date</label>
                    <Input name="endDate" type="date" required className="h-12 rounded-xl" />
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <input type="checkbox" name="isCurrent" id="isCurrent" className="size-5 rounded border-slate-300 text-primary focus:ring-primary transition-all" />
                    <label htmlFor="isCurrent" className="text-xs font-bold text-slate-700 dark:text-slate-300">Set as current semester</label>
                 </div>
                 <Button type="submit" disabled={createTermMutation.isPending} className="w-full py-6 rounded-2xl font-black text-base shadow-lg shadow-primary/20">
                    {createTermMutation.isPending ? "Creating..." : "Launch Semester"}
                 </Button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
