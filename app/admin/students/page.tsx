"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  stats: {
    activeEnrollments: number;
    completedEnrollments: number;
    totalEnrollments: number;
    totalInvoiced: number;
    totalPaid: number;
    arrears: number;
    paymentStatus: string;
  };
  courses: Array<{
    id: string;
    title: string;
    level: string;
    status: string;
  }>;
}

interface AdminStudentsData {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isError } = useQuery<AdminStudentsData>({
    queryKey: ['admin-students', debouncedSearch, statusFilter, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '10');
      
      const response = await axiosInstance.get(`/api/admin/students?${params}`);
      return response.data.data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axiosInstance.patch(`/api/admin/students/${studentId}/verify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success("Student verified successfully");
    },
    onError: () => {
      toast.error("Failed to verify student");
    }
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
        <p>Failed to load students. Please try again.</p>
      </div>
    );
  }

  const students = data?.students || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div className={`p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full transition-opacity duration-300 ${(isLoading && !data) ? 'opacity-50' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white">
            Student Management
          </h1>
          <p className="text-[#4c669a] text-sm mt-1">
            Manage all students, enrollments, and payment status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs md:text-sm text-[#4c669a]">
            Total Students: <span className="font-bold text-[#0d121b] dark:text-white">{total}</span>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              {isFetching ? 'sync' : 'search'}
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white focus:ring-2 focus:ring-primary/50 text-sm ${isFetching ? 'animate-pulse' : ''}`}
            />
          </div>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Students</option>
            <option value="active">Active Enrollments</option>
            <option value="overdue">Payment Overdue</option>
            <option value="verified">Verified Status</option>
            <option value="unverified">Unverified Status</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fc] dark:bg-[#2d3748] border-b border-[#e7ebf3] dark:border-[#2d3748]">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                  Student
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                  Enrollments
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3] dark:divide-[#2d3748]">
              {students.length > 0 ? students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-full bg-cover bg-center border border-[#e7ebf3] dark:border-[#2d3748]"
                        style={{
                          backgroundImage: student.avatarUrl
                            ? `url('${student.avatarUrl}')`
                            : 'url(https://ui-avatars.com/api/?name=' + encodeURIComponent(`${student.firstName} ${student.lastName}`) + ')'
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[#0d121b] dark:text-white">
                            {student.firstName} {student.lastName}
                          </p>
                          {student.isVerified ? (
                            <span className="material-symbols-outlined text-green-500 text-sm" title="Verified">verified</span>
                          ) : (
                            <span className="material-symbols-outlined text-amber-500 text-sm" title="Pending Verification">hourglass_empty</span>
                          )}
                        </div>
                        <p className="text-xs text-[#4c669a]">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                        {student.stats.activeEnrollments} Active
                      </span>
                      <span className="text-xs text-[#4c669a]">
                        {student.stats.totalEnrollments} Total
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-semibold ${student.stats.arrears > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {student.stats.arrears > 0 ? `KES ${student.stats.arrears.toLocaleString()} overdue` : 'Paid'}
                      </span>
                      <span className="text-xs text-[#4c669a]">
                        KES {student.stats.totalPaid.toLocaleString()} / {student.stats.totalInvoiced.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#4c669a]">
                    {format(new Date(student.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {!student.isVerified && (
                        <button
                          onClick={() => {
                            if (confirm(`Verify ${student.firstName} ${student.lastName}?`)) {
                              verifyMutation.mutate(student.id);
                            }
                          }}
                          disabled={verifyMutation.isPending}
                          className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          {verifyMutation.isPending && verifyMutation.variables === student.id ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                      <Link
                        href={`/teacher/students/${student.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                      >
                        Details
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#4c669a]">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-4 border-t border-[#e7ebf3] dark:border-[#2d3748] flex items-center justify-between bg-[#f8f9fc] dark:bg-[#1a202c]">
            <p className="text-xs md:text-sm text-[#4c669a] hidden sm:block">
              Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, total)}</span> of <span className="font-medium">{total}</span> students
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`size-8 rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? 'bg-primary text-white'
                      : 'border border-[#e7ebf3] dark:border-[#2d3748] hover:bg-white dark:hover:bg-gray-800 text-[#4c669a]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
