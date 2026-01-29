"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import NotificationIcon from "@/components/shared/NotificationIcon";

interface DashboardData {
  stats: {
    attendance: number;
    attendanceTrend: number;
    progress: number;
    completedCourses: number;
    balance: number;
    hasOverdue: boolean;
    oldestUnpaidInvoiceId: string | null;
  };
  todaySessions: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    recordingUrl?: string | null;
    course: { title: string };
    teacher: { firstName: string; lastName: string; image?: string };
    attendeeCount: number;
  }>;
  history: {
    data: Array<{
      id: string;
      title: string;
      courseName: string;
      startTime: string;
      endTime: string;
      recordingUrl?: string | null;
      teacherName: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  courses: Array<{
    id: string;
    title: string;
    lessonsCount: number;
    duration: number;
    grade: string;
    progress: number;
    level: string;
    teacherName: string;
  }>;
  availableCourses: Array<{
    id: string;
    title: string;
    level: string;
    price: number;
    teacherName: string;
    modulesCount: number;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    courseName: string;
    dueDate: string;
    type: string;
  }>;
  registration: {
    id: string;
    registeredAt: string;
  } | null;
  currentTerm: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [historyPage, setHistoryPage] = useState(1);

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['student-dashboard', historyPage],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/dashboard/student?historyPage=${historyPage}&historyLimit=5`);
      return response.data.data;
    }
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('/api/student/term/register');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      toast.success("Welcome! You are now registered for the semester.");
    },
    onError: () => {
      toast.error("Failed to register. Please try again.");
    }
  });

  const handleLanguageToggle = () => {
    toast.info("Language switching is coming soon!", {
      description: "We are currently working on German translations."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white">
        <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
        <p>Failed to load dashboard data. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, todaySessions, history, courses, assignments } = data;

  return (
    <div className="flex flex-col w-full min-h-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-200">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black text-text-main dark:text-white tracking-tight">
              Guten Morgen, {user?.firstName || 'Student'}
            </h2>
            <p className="text-text-subtle text-sm md:text-base">
              {data.currentTerm?.name || 'Academic Semester'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLanguageToggle}
              className="hidden sm:flex items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-main dark:text-white text-sm font-bold shadow-sm hover:border-primary transition-colors"
            >
              EN / DE
            </button>
            <NotificationIcon className="size-10 rounded-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-subtle hover:text-primary shadow-sm" />
            <Link
              href="/profile"
              className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-card-dark shadow-sm bg-gray-200 block"
              style={{
                backgroundImage: user?.image ? `url('${user.image}')` : undefined,
              }}
            >
               {!user?.image && <span className="flex items-center justify-center h-full text-gray-500 text-xs font-bold">{user?.firstName?.charAt(0) || 'S'}</span>}
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 md:gap-8">
          {/* Quick Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex flex-col gap-1">
                <p className="text-text-subtle text-sm font-medium">Attendance</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">{stats.attendance}%</h3>
                </div>
              </div>
              <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">how_to_reg</span>
              </div>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex flex-col gap-1">
                <p className="text-text-subtle text-sm font-medium">Overall Progress</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">{stats.progress}%</h3>
                </div>
                <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${stats.progress}%` }}></div>
                </div>
              </div>
              <div className="size-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex flex-col gap-1">
                <p className="text-text-subtle text-sm font-medium">Current Balance</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">KES {stats.balance.toFixed(2)}</h3>
                </div>
              </div>
              <div className="size-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
          </section>

          {/* Semester Registration CTA */}
          {data.currentTerm && !data.registration && (
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20 group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-9xl">history_edu</span>
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Action Required</span>
                    <span className="text-xs font-bold text-blue-100">{data.currentTerm.name} Registration</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black mb-3">Welcome to the New Semester!</h2>
                  <p className="text-blue-50 text-sm md:text-base leading-relaxed opacity-90">
                    Your semester registration is pending. Enroll in any course to automatically register for the semester and unlock your full dashboard features.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending}
                    className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-xl hover:scale-105 active:scale-95 text-center min-w-[200px]"
                  >
                    {registerMutation.isPending ? "Registering..." : "One-Click Register"}
                  </button>
                  <Link 
                    href="/courses" 
                    className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all text-center"
                  >
                    Browse Courses
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Today's Classes */}
              <div>
                <h3 className="text-xl font-bold text-text-main dark:text-white mb-4">Today's Classes</h3>
                <div className="flex flex-col gap-4">
                  {todaySessions.length > 0 ? todaySessions.map((session) => (
                    <div key={session.id} className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:shadow-lg transition-all">
                      <div className="w-full sm:w-48 aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center relative shrink-0">
                        <span className="material-symbols-outlined text-4xl sm:text-5xl text-gray-300">videocam</span>
                        {session.status === 'LIVE' && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase animate-pulse">Live Now</div>}
                      </div>
                      <div className="flex flex-col justify-between flex-1 gap-4">
                        <div>
                          <div className="text-primary text-sm font-bold mb-1">{format(parseISO(session.startTime), "HH:mm")} - {format(parseISO(session.endTime), "HH:mm")}</div>
                          <h4 className="text-xl font-bold">{session.course.title}: {session.title}</h4>
                          <p className="text-text-subtle text-sm">Instructor: {session.teacher.firstName} {session.teacher.lastName}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-text-subtle">{session.attendeeCount} students attending</span>
                          {new Date(session.endTime) > new Date() ? (
                            <Link href={`/classroom/${session.id}`} className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all">Join Class</Link>
                          ) : (
                            session.recordingUrl ? (
                              <a href={session.recordingUrl} target="_blank" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all">Watch Recording</a>
                            ) : <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ended on {format(parseISO(session.startTime), "MMM d 'at' HH:mm")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center bg-card-light dark:bg-card-dark rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                      <p className="text-text-subtle">No classes scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Past Sessions History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-text-main dark:text-white">Class History</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <span className="text-xs font-bold">{historyPage} / {history.pagination.totalPages || 1}</span>
                    <button 
                      onClick={() => setHistoryPage(p => Math.min(history.pagination.totalPages, p + 1))}
                      disabled={historyPage >= history.pagination.totalPages}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Course & Topic</th>
                        <th className="px-6 py-4 text-right">Recording</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {history.data.map((session) => (
                        <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold">{format(parseISO(session.startTime), "MMM d, yyyy")}</p>
                            <p className="text-xs text-slate-400">{format(parseISO(session.startTime), "HH:mm")}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold truncate max-w-[200px]">{session.courseName}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{session.title}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {session.recordingUrl ? (
                              <a href={session.recordingUrl} target="_blank" className="inline-flex items-center gap-1 text-xs font-black text-emerald-500 hover:underline">
                                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                                WATCH
                              </a>
                            ) : <span className="text-[10px] font-bold text-slate-300">N/A</span>}
                          </td>
                        </tr>
                      ))}
                      {history.data.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No past sessions found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Trend */}
              <Link href="/student/reports" className="block group">
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm group-hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">Performance Trend</h3>
                    <span className="text-xs text-text-subtle bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">View Report</span>
                  </div>
                  <div className="h-48 flex flex-col items-center justify-center text-text-subtle bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 group-hover:bg-slate-100 dark:group-hover:bg-slate-900 transition-colors">
                     <span className="material-symbols-outlined text-4xl mb-2 text-primary/50">insights</span>
                     <p className="text-sm font-medium">Click to view detailed performance analytics</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              {/* Enrolled Courses */}
              <div>
                <h3 className="text-lg font-bold mb-4">Enrolled Courses</h3>
                <div className="flex flex-col gap-3">
                  {courses.length > 0 ? courses.map(course => (
                    <Link key={course.id} href={`/student/courses/${course.id}`} className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{course.level}</p>
                        <span className="text-[10px] font-bold text-slate-400">{course.lessonsCount} lessons</span>
                      </div>
                      <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{course.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{course.teacherName}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span>PROGRESS</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${course.progress}%` }} />
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <div className="bg-card-light dark:bg-card-dark p-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
                      <p className="text-sm text-text-subtle">You are not enrolled in any courses yet.</p>
                      <Link href="/courses" className="text-primary text-xs font-bold mt-2 hover:underline inline-block">Browse Catalog</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Available Courses & Discovery */}
              {data.availableCourses.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    Explore New Courses
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-widest">New</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {data.availableCourses.map(course => (
                      <Link key={course.id} href={`/courses/${course.id}`} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all flex items-center justify-between group shadow-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{course.level}</p>
                            <span className="text-[10px] font-bold text-slate-400">• {course.modulesCount} modules</span>
                          </div>
                          <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{course.title}</h4>
                          <p className="text-xs text-slate-500">{course.teacherName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-text-main dark:text-white">{course.price > 0 ? `KES ${course.price.toLocaleString()}` : 'FREE'}</p>
                          <span className="text-[10px] font-bold text-primary dark:text-primary-light">Details →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-8xl text-text-main dark:text-white">receipt_long</span>
                </div>
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">Outstanding Fees</h3>
                <p className="text-text-subtle text-xs mb-6">Tuition & Material costs</p>
                
                {stats.balance > 0 ? (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-subtle">Total Due</span>
                    <span className="font-bold text-red-500">KES {stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span className="text-sm font-bold">You're all set!</span>
                    </div>
                    <p className="text-[10px] text-text-subtle leading-tight">
                      No outstanding balance found. If you just enrolled, fees may not be invoiced yet.
                    </p>
                  </div>
                )}
                
                <div className="w-full border-t border-gray-100 dark:border-gray-700 my-4"></div>
                {stats.balance > 0 && stats.oldestUnpaidInvoiceId ? (
                  <button 
                    onClick={async () => {
                      try {
                        const res = await axiosInstance.post('/api/finance/pay', {
                          invoiceId: stats.oldestUnpaidInvoiceId,
                          amount: stats.balance // Or maybe just the oldest invoice's amount? For simplicity let's pay the balance or let billing handle it.
                        });
                        if (res.data?.data?.checkoutUrl) {
                          window.location.href = res.data.data.checkoutUrl;
                        }
                      } catch (err) {
                        toast.error("Failed to initiate payment");
                      }
                    }}
                    className="block w-full text-center bg-primary hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
                  >
                    Pay Now
                  </button>
                ) : (
                  <Link href="/student/billing" className="block w-full text-center bg-primary hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20">
                    {stats.balance > 0 ? 'Pay Now' : 'View History'}
                  </Link>
                )}
              </div>

              {/* Assignments */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                  Assignments
                  <span className="size-5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-[10px] font-black">{assignments.length}</span>
                </h3>
                <div className="flex flex-col gap-3">
                  {assignments.length > 0 ? assignments.map(a => (
                    <Link key={a.id} href={`/student/assignments/${a.id}`} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:border-primary/30 border border-transparent transition-all">
                      <h4 className="text-sm font-bold truncate">{a.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[100px]">{a.courseName}</span>
                        <span className="text-[10px] font-black text-orange-500">DUE {format(parseISO(a.dueDate), "MMM d")}</span>
                      </div>
                    </Link>
                  )) : (
                    <p className="text-xs text-text-subtle text-center py-4">No pending assignments!</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900 dark:bg-primary rounded-2xl p-5 text-white shadow-xl shadow-primary/20">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/student/reports" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">download</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Transcript</span>
                  </Link>
                  <Link href="/messages" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">mail</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Message</span>
                  </Link>
                  <Link href="/student/schedule" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors text-center group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">event</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Calendar</span>
                  </Link>
                  <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com'}`} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">help</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}