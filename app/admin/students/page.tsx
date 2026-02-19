"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { toast } from "sonner";
import VerifyStudentModal from "@/components/admin/students/VerifyStudentModal";
import AssignTeacherModal from "@/components/admin/students/AssignTeacherModal";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  isVerified: boolean;
  onboardingComplete?: boolean;
  createdAt: string;

  profile?: {
    dateOfBirth: string | null;
    phoneNumber: string | null;
    address: string | null;
    emergencyContact: string | null;
    mentorId?: string | null;
    interestedProgram?: string | null;
    mentor?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  } | null;

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

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Modal State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [assignTeacherModalOpen, setAssignTeacherModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch all teachers for filter
  const { data: teachers } = useQuery({
    queryKey: ['admin-teachers-list'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/teachers');
      return response.data.data?.teachers || [];
    }
  });

  const { data, isLoading, isFetching, isError } = useQuery<AdminStudentsData>({
    queryKey: ['admin-students', debouncedSearch, statusFilter, teacherFilter, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (teacherFilter) params.append('teacherId', teacherFilter);
      params.append('page', page.toString());
      params.append('limit', '10');
      
      const response = await axiosInstance.get(`/admin/students?${params}`);
      return response.data.data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axiosInstance.patch(`/admin/students/${studentId}/verify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success("Student verified successfully");
      setVerifyModalOpen(false);
      setSelectedStudent(null);
    },
    onError: () => {
      toast.error("Failed to verify student");
    }
  });

  const handleVerifyClick = (student: Student) => {
    setSelectedStudent(student);
    setVerifyModalOpen(true);
  };

  const handleAssignTeacherClick = (student: Student) => {
    setSelectedStudent(student);
    setAssignTeacherModalOpen(true);
  };

  const confirmVerify = () => {
    if (selectedStudent) {
      verifyMutation.mutate(selectedStudent.id);
    }
  };

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

  /* Stats Section */
  const stats = (data as any)?.assignmentStats;

  return (
    <div className={`p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full transition-opacity duration-300 ${(isLoading && !data) ? 'opacity-50' : 'opacity-100'}`}>
      <VerifyStudentModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onConfirm={confirmVerify}
        student={selectedStudent}
        isProcessing={verifyMutation.isPending}
      />
      <AssignTeacherModal
        isOpen={assignTeacherModalOpen}
        onClose={() => setAssignTeacherModalOpen(false)}
        student={selectedStudent}
      />

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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm">
            <p className="text-sm text-[#4c669a]">Total Students</p>
            <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{stats.totalStudents}</p>
          </div>
          <div className="bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm">
            <p className="text-sm text-[#4c669a]">Assigned</p>
            <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
          </div>
          <div className="bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm">
            <p className="text-sm text-[#4c669a]">Unassigned</p>
            <p className="text-2xl font-bold text-amber-600">{stats.unassigned}</p>
          </div>
          <div className="bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm">
            <p className="text-sm text-[#4c669a]">Active Teachers</p>
            <p className="text-2xl font-bold text-blue-600">{Object.keys(stats.byTeacher).length}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="all">All Statuses</option>
            <option value="active">Active Enrollments</option>
            <option value="overdue">Payment Overdue</option>
            <option value="verified">Verified Status</option>
            <option value="unverified">Unverified Status</option>
          </select>
           {/* Teacher Filter */}
           <select
            value={teacherFilter}
            onChange={(e) => {
              setTeacherFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Teachers</option>
            <option value="unassigned">Unassigned Students</option>
            {teachers?.map((teacher: any) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} {stats?.byTeacher[teacher.id] ? `(${stats.byTeacher[teacher.id]})` : ''}
              </option>
            ))}
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
                  Teacher
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">
                   Program Interest
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
                    {student.profile?.mentor ? (
                      <div className="flex items-center gap-2">
                         <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {student.profile.mentor.firstName[0]}
                         </div>
                         <span className="text-sm text-[#0d121b] dark:text-white">
                           {student.profile.mentor.firstName} {student.profile.mentor.lastName}
                         </span>
                      </div>
                    ) : (
                      <span className="text-sm text-[#9ca3af] italic">Unassigned</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {student.profile?.interestedProgram ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {student.profile.interestedProgram}
                        </span>
                    ) : (
                        <span className="text-gray-400 text-xs">-</span>
                    )}
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
                          onClick={() => handleVerifyClick(student)}
                          className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleAssignTeacherClick(student)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">person_add</span>
                        {student.profile?.mentorId ? 'Reassign' : 'Assign'}
                      </button>
                      <Link
                        href={`/admin/students/${student.id}`}
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
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-[#4c669a]">

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
