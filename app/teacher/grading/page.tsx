"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, Clock, AlertCircle } from "lucide-react";
import axios from "axios";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";

interface Submission {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    image: string | null;
    email: string;
  };
  assignment: {
    id: string;
    title: string;
    course: {
      title: string;
    };
  };
  submittedAt: string;
  status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED" | "RETURNED";
  grade: number | null;
}

export default function TeacherGradingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["teacher-grading", debouncedSearch, statusFilter, page],
    queryFn: async () => {
      const response = await axios.get("/api/teacher/grading", {
        params: {
          search: debouncedSearch,
          status: statusFilter,
          page,
          limit,
        },
      });
      return response.data.data;
    },
    placeholderData: keepPreviousData,
  });

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const submissions = data?.submissions || [];
  const stats = data?.stats || { pending: 0, graded: 0, late: 0 };
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grading</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review and grade student submissions</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // Reset to first page on filter change
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="GRADED">Graded</option>
            <option value="LATE">Late</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Review</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Graded Total</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.graded}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Late Submissions</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.late}</h3>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        {/* Silent Loading Indicator */}
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/10 overflow-hidden z-10">
            <div className="h-full bg-primary animate-progress-fast"></div>
          </div>
        )}
        
        <div className={`overflow-x-auto transition-opacity duration-200 ${isFetching ? 'opacity-70' : 'opacity-100'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignment</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading && submissions.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="py-8 text-center text-slate-500">Loading submissions...</td>
                 </tr>
              ) : submissions.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="py-8 text-center text-slate-500">No submissions found.</td>
                 </tr>
              ) : (
                submissions.map((submission: Submission) => (
                  <tr key={submission.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {submission.student.image ? (
                          <img src={submission.student.image} alt={`${submission.student.firstName}`} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {submission.student.firstName[0]}{submission.student.lastName[0]}
                          </div>
                        )}
                        <span className="font-medium text-slate-900 dark:text-white">
                          {submission.student.firstName} {submission.student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-600 dark:text-slate-300">{submission.assignment.title}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {submission.assignment.course.title}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {(submission.status === 'PENDING' || submission.status === 'SUBMITTED') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Pending
                        </span>
                      )}
                      {submission.status === 'GRADED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Graded ({submission.grade})
                        </span>
                      )}
                      {submission.status === 'LATE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Late
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/teacher/assignments/${submission.assignment.id}/grading`} className="text-sm font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                        Grade
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing {submissions.length} of {pagination.total} submissions
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Page {page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
