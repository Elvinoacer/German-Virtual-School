"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { toast } from "sonner";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    activeCourses: number;
  };
  courses: Array<{
    id: string;
    title: string;
    level: string;
    price: number;
    enrollments: number;
  }>;
}

interface AdminTeachersData {
  teachers: Teacher[];
  total: number;
}

export default function AdminTeachersPage() {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<AdminTeachersData>({
    queryKey: ['admin-teachers', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await axiosInstance.get(`/admin/teachers?${params}`);
      return response.data.data;
    }
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      const response = await axiosInstance.post('/admin/teachers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
      toast.success("Teacher created successfully");
      setIsAddModalOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Failed to create teacher");
    }
  });

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    createTeacherMutation.mutate({ firstName, lastName, email, password });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
        <p>Failed to load teachers. Please try again.</p>
      </div>
    );
  }

  const { teachers, total } = data;

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#e7ebf3] dark:border-[#2d3748]">
              <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">Add New Teacher</h2>
            </div>
            <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4c669a] uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4c669a] uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4c669a] uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4c669a] uppercase tracking-wider mb-2">Initial Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <p className="text-xs text-[#9ca3af] mt-1">Minimum 8 characters</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] text-[#4c669a] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTeacherMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createTeacherMutation.isPending ? "Creating..." : "Create Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white">
            Teacher Management
          </h1>
          <p className="text-[#4c669a] text-sm mt-1">
            Manage all teachers, courses, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs md:text-sm text-[#4c669a]">
            Total Teachers: <span className="font-bold text-[#0d121b] dark:text-white">{total}</span>
          </span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Teacher
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fc] dark:bg-[#2d3748] border-b border-[#e7ebf3] dark:border-[#2d3748]">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                  Teacher
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                  Courses
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                  Students
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                  Revenue
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
              {teachers.length > 0 ? teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-full bg-cover bg-center border border-[#e7ebf3] dark:border-[#2d3748]"
                        style={{
                          backgroundImage: teacher.avatarUrl
                            ? `url('${teacher.avatarUrl}')`
                            : 'url(https://ui-avatars.com/api/?name=' + encodeURIComponent(`${teacher.firstName} ${teacher.lastName}`) + ')'
                        }}
                      />
                      <div>
                        <p className="font-medium text-[#0d121b] dark:text-white">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p className="text-xs text-[#4c669a]">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                        {teacher.stats.activeCourses} Active
                      </span>
                      <span className="text-xs text-[#4c669a]">
                        {teacher.stats.totalCourses} Total
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                      {teacher.stats.totalStudents}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-green-600">
                      ${teacher.stats.totalRevenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#4c669a]">
                    {format(new Date(teacher.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/teachers/${teacher.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                    >
                      View Details
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#4c669a]">
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
