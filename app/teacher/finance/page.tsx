"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

interface FeePlan {
  id: string;
  courseId: string;
  amount: number;
  billingCycle: "MONTHLY" | "QUARTERLY" | "FIXED";
  installments: number;
  course: {
    title: string;
  };
}

interface Course {
    id: string;
    title: string;
}

export default function TeacherFinancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    amount: "",
    billingCycle: "MONTHLY",
    installments: 1
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: feePlans, isLoading } = useQuery<FeePlan[]>({
    queryKey: ['fee-plans'],
    queryFn: async () => {
      const res = await axiosInstance.get('/finance/fee-plans');
      return res.data?.data || [];
    }
  });

  const { data: courses } = useQuery<Course[]>({
      queryKey: ['teacher-courses-simple', user?.id],
      enabled: !!user?.id,
      queryFn: async () => {
          const res = await axiosInstance.get(`/courses?status=ALL&teacherId=${user?.id}`); 
          return res.data?.data?.data || [];
      }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post('/finance/fee-plans', data);
    },
    onSuccess: () => {
      setSuccess("Fee Plan created successfully");
      setIsCreating(false);
      setFormData({ courseId: "", amount: "", billingCycle: "MONTHLY", installments: 1 });
      queryClient.invalidateQueries({ queryKey: ['fee-plans'] });
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || "Failed to create fee plan");
      setTimeout(() => setError(""), 3000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.amount) {
        setError("Please fill all fields");
        return;
    }
    createMutation.mutate({
        ...formData,
        amount: parseFloat(formData.amount),
        installments: parseInt(String(formData.installments))
    });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-[#0d121b] dark:text-white p-4 md:p-6 lg:p-10 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Finance & Fees</h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Manage course fees and billing cycles</p>
          </div>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
          >
            {isCreating ? "Cancel" : "New Fee Plan"}
          </button>
        </header>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

        {isCreating && (
            <div className="bg-white dark:bg-[#1a2234] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6 mb-6 md:mb-8">
                <h2 className="text-xl font-bold mb-4">Create Fee Plan</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Course</label>
                        <select 
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                            value={formData.courseId}
                            onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                        >
                            <option value="">Select Course</option>
                            {courses?.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Amount (KES)</label>
                        <input 
                            type="number" 
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            placeholder="e.g. 5000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Billing Cycle</label>
                        <select 
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                            value={formData.billingCycle}
                            onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">Quarterly</option>
                            <option value="FIXED">Fixed (One-time)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Installments (if valid)</label>
                        <input 
                            type="number" 
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                            value={formData.installments}
                            onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value)})}
                        />
                    </div>
                    <div className="md:col-span-2 mt-4">
                        <button 
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending ? "Saving..." : "Create Plan"}
                        </button>
                    </div>
                </form>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {isLoading ? (
                <p>Loading...</p>
            ) : feePlans?.length === 0 ? (
                <p className="text-slate-500">No fee plans found.</p>
            ) : (
                feePlans?.map(plan => (
                    <div key={plan.id} className="bg-white dark:bg-[#1a2234] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                        <h3 className="font-bold text-lg mb-2">{plan.course.title}</h3>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-primary">KES {Number(plan.amount).toLocaleString()}</span>
                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-semibold">{plan.billingCycle}</span>
                        </div>
                        <p className="text-sm text-slate-500">
                           {plan.billingCycle === 'FIXED' ? 'One-time payment' : `Billed ${plan.billingCycle.toLowerCase()}`}
                        </p>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
