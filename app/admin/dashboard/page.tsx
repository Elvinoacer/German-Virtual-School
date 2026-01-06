"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";

interface AdminDashboardData {
  stats: {
    totalStudents: number;
    studentsTrend: number;
    activeTeachers: number;
    teachersTrend: number;
    monthlyRevenue: number;
    revenueTrend: number;
    systemStatus: string;
  };
  userGrowth: Array<{
    month: string;
    count: number;
  }>;
  financialHealth: {
    total: number;
    courseFees: number;
    materials: number;
    pending: number;
  };
  activeSessions: Array<{
    id: string;
    className: string;
    level: string;
    teacher: string;
    studentCount: number;
    maxStudents: number;
    status: string;
    latency: number;
  }>;
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery<AdminDashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/dashboard/admin');
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full text-text-main dark:text-white">
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

  const { stats, userGrowth, financialHealth, activeSessions } = data;

  const handleDownloadAttendance = () => {
    toast.info("Generating Attendance CSV...");
    // Logic for generating a simple CSV
    const headers = ["Class", "Level", "Teacher", "Students", "Status"];
    const rows = activeSessions.map(s => [s.className, s.level, s.teacher, `${s.studentCount}/${s.maxStudents}`, s.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_summary_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success("CSV Downloaded");
  };

  return (
        <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Total Students */}
            <Link href="/admin/students" className="bg-white dark:bg-[#1a202c] p-4 md:p-6 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm flex flex-col gap-3 md:gap-4 group hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">school</span>
                </div>
                {stats.studentsTrend !== 0 && (
                  <span className={`flex items-center ${stats.studentsTrend > 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'} px-2 py-1 rounded text-xs font-semibold`}>
                    {stats.studentsTrend > 0 ? '+' : ''}{stats.studentsTrend}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-[#4c669a] text-sm font-medium">
                  Total Students
                </p>
                <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white mt-1">
                  {stats.totalStudents.toLocaleString()}
                </h3>
              </div>
            </Link>
            {/* Active Teachers */}
            <Link href="/admin/teachers" className="bg-white dark:bg-[#1a202c] p-4 md:p-6 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm flex flex-col gap-3 md:gap-4 group hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                  <span className="material-symbols-outlined">
                    cast_for_education
                  </span>
                </div>
                {stats.teachersTrend !== 0 && (
                  <span className={`flex items-center ${stats.teachersTrend > 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'} px-2 py-1 rounded text-xs font-semibold`}>
                    {stats.teachersTrend > 0 ? '+' : ''}{stats.teachersTrend}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-[#4c669a] text-sm font-medium">
                  Active Teachers
                </p>
                <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white mt-1">
                  {stats.activeTeachers}
                </h3>
              </div>
            </Link>
            {/* Monthly Revenue */}
            <Link href="/admin/finance" className="bg-white dark:bg-[#1a202c] p-4 md:p-6 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm flex flex-col gap-3 md:gap-4 group hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                {stats.revenueTrend !== 0 && (
                  <span className={`flex items-center ${stats.revenueTrend > 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'} px-2 py-1 rounded text-xs font-semibold`}>
                    {stats.revenueTrend > 0 ? '+' : ''}{stats.revenueTrend}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-[#4c669a] text-sm font-medium">
                  Monthly Revenue
                </p>
                <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white mt-1">
                  KES {stats.monthlyRevenue.toLocaleString()}
                </h3>
              </div>
            </Link>
            {/* System Status */}
            <Link href="/admin/settings" className="bg-white dark:bg-[#1a202c] p-4 md:p-6 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm flex flex-col gap-3 md:gap-4 group hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg text-green-600">
                  <span className="material-symbols-outlined">dns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-green-600 text-xs font-semibold">
                    Online
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[#4c669a] text-sm font-medium">
                  System Status
                </p>
                <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white mt-1">
                  {stats.systemStatus.charAt(0).toUpperCase() + stats.systemStatus.slice(1)}
                </h3>
              </div>
            </Link>
          </section>

          {/* Main Charts Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* User Growth Trends Chart (2/3 width) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm flex flex-col transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">
                    User Growth Trends
                  </h3>
                  <p className="text-sm text-[#4c669a]">
                    Enrollments over the last 6 months
                  </p>
                </div>
                <select className="bg-[#f8f9fc] dark:bg-[#2d3748] border-none text-sm font-medium rounded-lg px-3 py-2 text-[#4c669a] outline-none">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="flex-1 min-h-[200px] md:min-h-[300px] w-full relative">
                {/* Custom Tailwind SVG Chart Representation */}
                {(() => {
                  const actualMax = Math.max(...userGrowth.map(g => g.count), 1);
                  // Calculate a nice max for the Y-axis (round up to nearest 10 or 100)
                  const magnitude = Math.pow(10, Math.floor(Math.log10(actualMax)));
                  const step = magnitude / 2 > 0 ? magnitude / 2 : 1;
                  const yAxisMax = Math.ceil((actualMax * 1.1) / step) * step;
                  
                  const labels = [
                    yAxisMax,
                    Math.round(yAxisMax * 0.66),
                    Math.round(yAxisMax * 0.33),
                    0
                  ];

                  return (
                    <>
                      <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pt-10 pb-6">
                        {/* Y-Axis labels (Dynamic) */}
                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-[#9ca3af] h-full pr-2 text-right w-8">
                          {labels.map((label, idx) => (
                            <span key={idx}>{label}</span>
                          ))}
                        </div>
                        {/* Chart Bars/Area */}
                        <div className="ml-10 flex-1 h-full flex items-end justify-between gap-4">
                          {userGrowth.map((item, index) => {
                            const heightPercent = yAxisMax > 0 ? (item.count / yAxisMax) * 90 : 2;
                            return (
                              <div key={index} className="w-full bg-primary/10 rounded-t-lg relative group transition-all duration-300" style={{ height: `${heightPercent}%` }}>
                                <div className="absolute inset-0 bg-primary rounded-t-lg transition-all duration-500 group-hover:bg-primary/80"></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 transition-all">
                                  {item.month}: {item.count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* X-Axis Labels */}
                      <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs font-medium text-[#4c669a] px-2">
                        {userGrowth.map((item, index) => (
                          <span key={index}>{item.month}</span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            {/* Financial Overview & Payment Split (1/3 width) */}
            <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm flex flex-col transition-colors duration-200">
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-1">
                Financial Health
              </h3>
              <p className="text-sm text-[#4c669a] mb-6">
                Current month revenue split
              </p>
              <div className="flex items-center justify-center py-4 relative">
                {/* Donut Chart representation with conic-gradient */}
                <div
                  className="size-48 rounded-full"
                  style={{
                    background:
                      `conic-gradient(#135bec 0% ${financialHealth.courseFees}%, #93c5fd ${financialHealth.courseFees}% ${financialHealth.courseFees + financialHealth.materials}%, #e5e7eb ${financialHealth.courseFees + financialHealth.materials}% 100%)`,
                  }}
                ></div>
                <div className="absolute inset-0 m-auto size-32 bg-white dark:bg-[#1a202c] rounded-full flex flex-col items-center justify-center shadow-inner transition-colors duration-200">
                  <span className="text-sm text-[#4c669a]">Total</span>
                  <span className="text-xl font-bold text-[#0d121b] dark:text-white">
                    KES {(financialHealth.total / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-primary"></span>
                    <span className="text-[#0d121b] dark:text-gray-300">
                      Course Fees
                    </span>
                  </div>
                  <span className="font-semibold text-[#0d121b] dark:text-white">
                    {financialHealth.courseFees}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-blue-300"></span>
                    <span className="text-[#0d121b] dark:text-gray-300">
                      Materials
                    </span>
                  </div>
                  <span className="font-semibold text-[#0d121b] dark:text-white">
                    {financialHealth.materials}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-gray-200"></span>
                    <span className="text-[#0d121b] dark:text-gray-300">
                      Pending
                    </span>
                  </div>
                  <span className="font-semibold text-[#0d121b] dark:text-white">
                    {financialHealth.pending}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Row: Live Classes & Quick Actions */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Live Active Sessions */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm flex flex-col overflow-hidden transition-colors duration-200">
              <div className="p-6 border-b border-[#e7ebf3] dark:border-[#2d3748] flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">
                    Active Sessions Monitor
                  </h3>
                  <p className="text-sm text-[#4c669a]">
                    Real-time classroom connectivity
                  </p>
                </div>
                <Link href="/admin/courses" className="text-primary text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f8f9fc] dark:bg-[#2d3748]">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-[#4c669a] uppercase">
                        Class Name
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-[#4c669a] uppercase">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-[#4c669a] uppercase">
                        Students
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-[#4c669a] uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-[#4c669a] uppercase">
                        Latency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7ebf3] dark:divide-gray-700">
                    {activeSessions.length > 0 ? activeSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-8 rounded flex items-center justify-center font-bold text-xs ${
                              session.level === 'A1' || session.level === 'A2' ? 'bg-blue-100 text-primary' :
                              session.level === 'B1' || session.level === 'B2' ? 'bg-orange-100 text-orange-600' :
                              'bg-indigo-100 text-indigo-600'
                            }`}>
                              {session.level}
                            </div>
                            <span className="font-medium text-[#0d121b] dark:text-white">
                              {session.className}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#4c669a]">
                          {session.teacher}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#4c669a]">
                          {session.studentCount}/{session.maxStudents}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            session.status === 'LIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            <span className={`size-1.5 rounded-full ${
                              session.status === 'LIVE' ? 'bg-green-600' : 'bg-yellow-600'
                            }`}></span>{" "}
                            {session.status === 'LIVE' ? 'Live' : 'Starting'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-lg ${
                              session.latency < 50 ? 'text-green-500' : session.latency < 100 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              wifi
                            </span>
                            <span className="text-xs font-medium text-[#4c669a]">
                              {session.latency}ms
                            </span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#4c669a]">
                          No active sessions at the moment
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Quick Reports & Actions */}
            <div className="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm flex flex-col transition-colors duration-200">
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-1">
                Reports Access
              </h3>
              <p className="text-sm text-[#4c669a] mb-6">
                Quickly generate standard exports
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleDownloadAttendance}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="material-symbols-outlined text-3xl text-[#4c669a] group-hover:text-primary">
                    description
                  </span>
                  <span className="text-xs font-medium text-[#4c669a] group-hover:text-primary">
                    Attendance CSV
                  </span>
                </button>
                <Link href="/admin/finance" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] hover:border-primary hover:bg-primary/5 transition-all group">
                  <span className="material-symbols-outlined text-3xl text-[#4c669a] group-hover:text-primary">
                    account_balance
                  </span>
                  <span className="text-xs font-medium text-[#4c669a] group-hover:text-primary">
                    Financial Audit
                  </span>
                </Link>
                <Link href="/admin/reports" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] hover:border-primary hover:bg-primary/5 transition-all group">
                  <span className="material-symbols-outlined text-3xl text-[#4c669a] group-hover:text-primary">
                    bar_chart
                  </span>
                  <span className="text-xs font-medium text-[#4c669a] group-hover:text-primary">
                    Growth Report
                  </span>
                </Link>
                <Link href="/admin/students" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] hover:border-primary hover:bg-primary/5 transition-all group">
                  <span className="material-symbols-outlined text-3xl text-[#4c669a] group-hover:text-primary">
                    person_add
                  </span>
                  <span className="text-xs font-medium text-[#4c669a] group-hover:text-primary">
                    New Users
                  </span>
                </Link>
              </div>
              <div className="mt-6 pt-6 border-t border-[#e7ebf3] dark:border-[#2d3748] flex items-center justify-center text-[#4c669a] text-xs gap-2">
                <span className="material-symbols-outlined text-base">
                  lock
                </span>
                <span>Secure SSL Connection</span>
              </div>
            </div>
          </section>
        </div>
  );
}
