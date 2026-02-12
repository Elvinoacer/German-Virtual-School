"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
    avatarUrl: string | null;
    attendanceRate: number;
    progress: number;
    activeCourse: {
        id: string;
        title: string;
        level: string;
    } | null;
    lastActive?: string;
    status?: string;
}

export default function TeacherStudentListPage() {
  const { data: sessionData } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: studentData, isLoading } = useQuery<{ data: Student[], pagination: any }>({
    queryKey: ["teacher-students", page, search, levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        ...(levelFilter !== "all" ? { level: levelFilter } : {})
      });
      const res = await fetch(`/api/teacher/students?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const json = await res.json();
      return json.data;
    },
    placeholderData: (previousData) => previousData, 
  });

  const students = studentData?.data || [];
  const pagination = studentData?.pagination;

  const stats = {
      assignedStudents: pagination?.totalItems || 0,
      totalSchoolStudents: pagination?.totalSchoolStudents || 0,
      activeNow: Math.floor((pagination?.totalItems || 0) * 0.1) || 0, // Mock active calculation
      avgAttendance: 85
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display transition-colors duration-200 min-h-screen flex flex-col overflow-x-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
          
          {/* Header & Stats */}
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Students Directory
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors duration-200">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Assigned Students</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.assignedStudents}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined">supervisor_account</span>
                </div>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors duration-200">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total School Students</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalSchoolStudents}</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                  <span className="material-symbols-outlined">school</span>
                </div>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors duration-200">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Now</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.activeNow}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined">wifi</span>
                </div>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors duration-200">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Attendance</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.avgAttendance}%</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors duration-200">
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search by name, email..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border-none focus:ring-2 focus:ring-primary text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
               <select 
                className="px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary cursor-pointer min-w-[140px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
               >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
               </select>

               <select 
                className="px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary cursor-pointer min-w-[140px]"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
               >
                  <option value="all">All Levels</option>
                  <option value="A1">German A1</option>
                  <option value="A2">German A2</option>
                  <option value="B1">German B1</option>
                  <option value="B2">German B2</option>
                  <option value="C1">German C1</option>
                  <option value="C2">German C2</option>
               </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Student</th>
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 whitespace-nowrap">Active Course</th>
                      <th className="px-6 py-4 whitespace-nowrap">Progress</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary"></div>
                                </div>
                            </td>
                        </tr>
                    ) : students.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                           No students found matching your criteria.
                         </td>
                       </tr>
                    ) : (
                      students.map(student => (
                        <tr key={student.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden shrink-0">
                                {student.avatarUrl || student.image ? (
                                  <img src={student.avatarUrl || student.image || ""} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span>{student.firstName[0]}{student.lastName[0]}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white truncate">{student.firstName} {student.lastName}</p>
                                <p className="text-xs text-slate-500 truncate">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (student.status || 'Active') === 'Active' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {student.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             {student.activeCourse ? (
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{student.activeCourse.title}</span>
                                    <span className="text-xs text-slate-500">{student.activeCourse.level}</span>
                                </div>
                             ) : (
                                <span className="text-slate-400 italic">No Active Course</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap min-w-[150px]">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-1">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                            </div>
                            <span className="text-xs">{student.progress}%</span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                             <div className="flex items-center justify-end gap-2">
                                {student.activeCourse && (
                                    <Link href={`/teacher/students/${student.id}/evaluate/${student.activeCourse.id}`}>
                                        <button className="flex items-center justify-center size-8 rounded-lg text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors" title="Evaluate">
                                            <span className="material-symbols-outlined text-[20px]">assessment</span>
                                        </button>
                                    </Link>
                                )}
                                <Link 
                                href={`/teacher/students/${student.id}`}
                                className="flex items-center justify-center size-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View Profile"
                                >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </Link>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
             
             {/* Pagination */}
             {pagination && (
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                        Showing page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
                    </p>
                    <div className="flex gap-2 ml-auto sm:ml-0">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page === pagination.totalPages}
                            className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
             )}
          </div>

        </div>
      </div>
      
      {/* Verify Icons Load */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </div>
  );
}
