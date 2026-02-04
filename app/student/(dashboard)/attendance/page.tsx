"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Timer,
  Filter
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  course: {
    id: string;
    title: string;
    level: string;
  };
  session: {
    id: string;
    title: string;
    status: string;
  };
  status: string;
  durationMinutes: number;
  sessionDurationMinutes: number;
  attendancePercent: number;
  category: 'FULL' | 'PARTIAL' | 'MISSING';
  checkInTime: string | null;
  checkOutTime: string | null;
  logs: Array<{ id: string; type: string; timestamp: string }>;
}

interface AttendanceData {
  stats: {
    totalSessions: number;
    fullAttendance: number;
    partialAttendance: number;
    missing: number;
    averagePercent: number;
    totalMinutesAttended: number;
  };
  records: AttendanceRecord[];
}

export default function StudentAttendancePage() {
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data, isLoading, isError } = useQuery<AttendanceData>({
    queryKey: ['student-attendance'],
    queryFn: async () => {
      const response = await axiosInstance.get('/student/attendance');
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
        <p>Failed to load attendance data. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, records } = data;

  // Get unique courses for filter
  const uniqueCourses = [...new Set(records.map(r => r.course.title))];

  // Apply filters
  const filteredRecords = records.filter(record => {
    const courseMatch = filterCourse === "all" || record.course.title === filterCourse;
    const categoryMatch = filterCategory === "all" || record.category === filterCategory;
    return courseMatch && categoryMatch;
  });

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'FULL':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getPercentColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600 dark:text-green-400';
    if (percent >= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen">
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link href="/student/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Link>
              <span className="text-slate-300">•</span>
              <span>Attendance History</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              My Attendance History
            </h1>
            <p className="text-slate-500 mt-2">
              View your class attendance records with detailed session information
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">Total Sessions</p>
            <p className="text-2xl font-black">{stats.totalSessions}</p>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">Full Attendance</p>
            <p className="text-2xl font-black text-green-600">{stats.fullAttendance}</p>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">Partial</p>
            <p className="text-2xl font-black text-yellow-600">{stats.partialAttendance}</p>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">Missing</p>
            <p className="text-2xl font-black text-red-600">{stats.missing}</p>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">Avg. Attendance</p>
            <p className={`text-2xl font-black ${getPercentColor(stats.averagePercent)}`}>
              {stats.averagePercent}%
            </p>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                <Timer className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">Total Time</p>
            <p className="text-2xl font-black">{Math.round(stats.totalMinutesAttended / 60)}h</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold">Filters:</span>
          </div>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-xl px-4 py-2 cursor-pointer"
          >
            <option value="all">All Courses</option>
            {uniqueCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-xl px-4 py-2 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="FULL">Full Attendance</option>
            <option value="PARTIAL">Partial</option>
            <option value="MISSING">Missing</option>
          </select>
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/20">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Session</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Attendance %</th>
                  <th className="px-6 py-4 text-center">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">
                          {format(parseISO(record.date), "MMM dd, yyyy")}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(parseISO(record.date), "EEEE")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{record.course.title}</span>
                        <span className="text-xs text-primary font-medium">{record.course.level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{record.session.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getCategoryStyle(record.category)}`}>
                        {record.category === 'FULL' ? 'Full' : record.category === 'PARTIAL' ? 'Partial' : 'Missing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-black ${getPercentColor(record.attendancePercent)}`}>
                        {record.attendancePercent}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">{record.durationMinutes}m</span>
                        <span className="text-xs text-slate-500">of {record.sessionDurationMinutes}m</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No attendance records found</p>
                        <p className="text-sm text-slate-400">Join a class session to see your attendance here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
