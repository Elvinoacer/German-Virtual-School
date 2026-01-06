"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, Clock, Users, Timer } from "lucide-react";

export default function SessionAttendanceReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["session-attendance", sessionId],
    queryFn: async () => {
      const response = await axios.get(`/api/sessions/${sessionId}/attendance`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Failed to load attendance report</h2>
        <Link href="/teacher/calendar" className="text-primary hover:underline mt-4 inline-block">
          Back to Calendar
        </Link>
      </div>
    );
  }

  const { stats, attendance, sessionTitle } = data;

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/teacher/calendar" className="flex items-center gap-1 hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Calendar
            </Link>
            <span className="text-slate-300">•</span>
            <span>Attendance Report</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {sessionTitle}
          </h1>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-card-dark p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Attendees</p>
            <p className="text-2xl font-black">{stats.totalAttendees}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-card-dark p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg. Duration</p>
            <p className="text-2xl font-black">{stats.averageDuration}m</p>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Present Count</p>
            <p className="text-2xl font-black">{stats.presentCount}</p>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <h2 className="text-lg font-bold">Attendee Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-400">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">First Joined</th>
                <th className="px-6 py-4">Last Left</th>
                <th className="px-6 py-4 text-center">Duration</th>
                <th className="px-6 py-4">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {attendance.map((record: any) => (
                <tr key={record.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                        {record.student.firstName[0]}{record.student.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{record.student.firstName} {record.student.lastName}</p>
                        <p className="text-xs text-slate-500">{record.student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {record.checkInTime ? format(new Date(record.checkInTime), "HH:mm:ss") : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {record.checkOutTime ? format(new Date(record.checkOutTime), "HH:mm:ss") : "Still in call"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black">
                      {record.durationMinutes}m
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {record.logs.map((log: any, i: number) => (
                        <span key={log.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          log.type === 'JOIN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                        }`}>
                          {log.type} {format(new Date(log.timestamp), "HH:mm")}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No attendance data available for this session.
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
