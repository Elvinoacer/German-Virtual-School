"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui";

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  image: string | null;
  isVerified: boolean;
  onboardingComplete: boolean;
  createdAt: string;
  studentProfile: {
    dateOfBirth: string | null;
    phoneNumber: string | null;
    address: string | null;
    emergencyContact: string | null;
  } | null;
  enrollments: Array<{
    id: string;
    status: string;
    createdAt: string;
    course: {
      id: string;
      title: string;
      level: string;
      teacher: { id: string; firstName: string; lastName: string };
    };
  }>;
  invoices: Array<{
    id: string;
    amount: number;
    paidAmount: number;
    status: string;
    dueDate: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
  studentEvaluations: Array<{
    id: string;
    attendanceScore: number;
    participationScore: number;
    assignmentScore: number;
    languageProficiency: number;
    overallComment: string | null;
    createdAt: string;
    course: { title: string; level: string };
    teacher: { firstName: string; lastName: string };
  }>;
  stats: {
    totalEnrollments: number;
    activeEnrollments: number;
    totalInvoiced: number;
    totalPaid: number;
    arrears: number;
  };
}

export default function AdminStudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useQuery<StudentData>({
    queryKey: ["admin-student-detail", studentId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/students/${studentId}`);
      return res.data.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch(`/admin/students/${studentId}/verify`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", studentId] });
      toast.success("Student verified successfully");
    },
    onError: () => toast.error("Failed to verify student"),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-slate-500">Student not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-6xl mx-auto space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div
            className="size-16 md:size-24 rounded-3xl bg-cover bg-center ring-4 ring-white dark:ring-slate-800 shadow-xl shrink-0"
            style={{
              backgroundImage: `url('${student.avatarUrl || student.image || "https://ui-avatars.com/api/?name=" + student.firstName + "+" + student.lastName}')`,
            }}
          ></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
              {student.firstName} {student.lastName}
              {student.isVerified ? (
                <span className="material-symbols-outlined text-green-500 text-xl" title="Verified">verified</span>
              ) : (
                <span className="material-symbols-outlined text-amber-500 text-xl" title="Pending Verification">hourglass_empty</span>
              )}
            </h1>
            <p className="text-slate-500 font-medium">{student.email}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                Student
              </span>
              {!student.onboardingComplete && (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
                  Onboarding Incomplete
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {!student.isVerified && (
            <Button
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="flex items-center gap-2 font-bold bg-green-600 hover:bg-green-700"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {verifyMutation.isPending ? "Verifying..." : "Verify Student"}
            </Button>
          )}
          <Link
            href={`/messages?userId=${studentId}`}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Send Message
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollments</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {student.stats.activeEnrollments} <span className="text-sm font-medium text-slate-400">/ {student.stats.totalEnrollments}</span>
          </p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">KES {student.stats.totalInvoiced.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-black text-green-600 mt-1">KES {student.stats.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arrears</p>
          <p className={`text-2xl font-black mt-1 ${student.stats.arrears > 0 ? 'text-red-600' : 'text-green-600'}`}>
            KES {student.stats.arrears.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enrollments */}
          <section>
            <h2 className="text-xl font-black flex items-center gap-3 mb-6">
              <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
              </div>
              Enrollments
            </h2>
            <div className="space-y-3">
              {student.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {enrollment.course.level}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{enrollment.course.title}</h3>
                      <p className="text-xs text-slate-500">
                        {enrollment.course.teacher.firstName} {enrollment.course.teacher.lastName}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    enrollment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>
              ))}
              {student.enrollments.length === 0 && (
                <p className="text-center py-8 text-slate-400 italic">No enrollments yet.</p>
              )}
            </div>
          </section>

          {/* Recent Payments */}
          <section>
            <h2 className="text-xl font-black flex items-center gap-3 mb-6">
              <div className="size-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[20px]">payments</span>
              </div>
              Recent Payments
            </h2>
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {student.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{format(new Date(payment.createdAt), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">KES {Number(payment.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{payment.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {student.payments.length === 0 && (
                <p className="text-center py-8 text-slate-400 italic">No payments recorded.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Profile Information</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {student.studentProfile?.dateOfBirth ? format(new Date(student.studentProfile.dateOfBirth), "MMMM d, yyyy") : "Not Set"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{student.studentProfile?.phoneNumber || "Not Set"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{student.studentProfile?.address || "Not Set"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{student.studentProfile?.emergencyContact || "Not Set"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{format(new Date(student.createdAt), "MMMM yyyy")}</p>
              </div>
            </div>
          </div>

          {/* Recent Evaluations */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Recent Evaluations</h3>
            <div className="space-y-3">
              {student.studentEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{evaluation.course.title}</p>
                    <span className="text-lg font-black text-primary">
                      {Math.round((evaluation.attendanceScore + evaluation.participationScore + evaluation.assignmentScore + evaluation.languageProficiency) / 4)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    By {evaluation.teacher.firstName} • {format(new Date(evaluation.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              ))}
              {student.studentEvaluations.length === 0 && (
                <p className="text-center py-4 text-slate-400 italic text-xs">No evaluations yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
