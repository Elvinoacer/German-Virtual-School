"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

interface TeacherDashboardData {
  stats: {
    totalStudents: number;
    studentsTrend: number;
    activeCourses: number;
    toGradeCount: number;
    urgentCount: number;
    monthlyRevenue: number;
    revenueTrend: number;
  };
  todaySchedule: Array<{
    id: string;
    title: string;
    courseName: string;
    level: string;
    startTime: string;
    endTime: string;
    status: string;
    description: string | null;
  }>;
  gradingQueue: Array<{
    id: string;
    title: string;
    courseName: string;
    submissionCount: number;
    dueDate: string;
    type: string;
  }>;
  engagementData: Array<{
    day: string;
    percentage: number;
  }>;
  activeCourses: Array<{
    id: string;
    title: string;
    level: string;
    studentCount: number;
    students: Array<{
      id: string;
      image: string | null;
      name: string;
    }>;
    progress: number;
    status: string;
  }>;
}

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery<TeacherDashboardData>({
    queryKey: ["teacher-dashboard"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/dashboard/teacher");
      return response.data.data;
    },
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white">
        <span className="material-symbols-outlined text-4xl mb-2 text-red-500">
          error
        </span>
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

  const { stats, todaySchedule, gradingQueue, engagementData, activeCourses } =
    data;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden font-display transition-colors duration-200">
      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto bg-background-light dark:bg-background-dark transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                Guten Morgen, {user?.firstName || "Teacher"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">
                Here is what's happening in your virtual classroom today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/teacher/calendar"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">
                  calendar_month
                </span>
                Calendar
              </Link>
              <Link
                href="/teacher/assignments"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">
                  assignment
                </span>
                Assignments
              </Link>
              <Link
                href="/teacher/courses/new"
                className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add_circle
                </span>
                Create Course
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              href="/teacher/students"
              className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-xs font-medium">
                  {stats.studentsTrend > 0 ? "+" : ""}
                  {stats.studentsTrend}%
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Total Students
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.totalStudents}
              </h3>
            </Link>
            <Link
              href="/teacher/courses"
              className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">
                    library_books
                  </span>
                </div>
                <span className="text-slate-400 px-2 py-1 rounded text-xs font-medium">
                  -
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Active Courses
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.activeCourses}
              </h3>
            </Link>
            <Link
              href="/teacher/assignments"
              className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">assignment</span>
                </div>
                <span className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-xs font-medium">
                  Urgent: {stats.urgentCount}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                To Grade
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.toGradeCount}
              </h3>
            </Link>
            <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-xs font-medium">
                  {stats.revenueTrend > 0 ? "+" : ""}
                  {stats.revenueTrend}%
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Revenue (Monthly)
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                KES {stats.monthlyRevenue.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Two Column Layout: Schedule & Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Schedule (Takes 1/3) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Today's Schedule
                  </h3>
                  <Link
                    href="/teacher/calendar"
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    View Calendar
                  </Link>
                </div>
                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-8">
                  {todaySchedule.length > 0 ? (
                    todaySchedule.map((session, index) => {
                      const isLive =
                        session.status === "LIVE" ||
                        (new Date() >= new Date(session.startTime) &&
                          new Date() <= new Date(session.endTime));
                      return (
                        <div key={session.id} className="relative">
                          <span
                            className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full ${
                              isLive
                                ? "bg-primary ring-4 ring-blue-100 dark:ring-blue-900/30"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          ></span>
                          <div
                            className={`${
                              isLive
                                ? "bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800"
                                : "p-3"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              {isLive && (
                                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                  Live Now
                                </span>
                              )}
                              <span
                                className={`text-sm font-semibold ${
                                  isLive
                                    ? "text-slate-600 dark:text-slate-300"
                                    : "text-slate-500 dark:text-slate-400 block mb-1"
                                }`}
                              >
                                {format(parseISO(session.startTime), "HH:mm")} -{" "}
                                {format(parseISO(session.endTime), "HH:mm")}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                              {session.courseName}
                            </h4>
                            <p
                              className={`text-sm ${
                                isLive
                                  ? "text-slate-500 dark:text-slate-400 mb-3"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {session.description || session.level}
                            </p>
                            {isLive && (
                              <Link
                                href={`/classroom/${session.id}`}
                                className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  video_camera_front
                                </span>
                                Join Class
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-slate-500 italic">
                      No classes scheduled for today.
                    </div>
                  )}
                </div>
              </div>
              {/* Grading Widget */}
              <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Needs Grading
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                    {stats.urgentCount} Urgent
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {gradingQueue.length > 0 ? (
                    gradingQueue.map((item) => (
                      <Link
                        href={`/teacher/assignments/${item.id}/grading`}
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">
                              description
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              Submitted by {item.submissionCount} students
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">
                          chevron_right
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-4">
                      No pending grading items.
                    </div>
                  )}
                </div>
                <Link
                  href="/teacher/assignments"
                  className="block w-full mt-4 text-center text-sm text-slate-500 hover:text-primary font-medium transition-colors"
                >
                  View all assignments
                </Link>
              </div>
            </div>
            {/* Right Column: Analytics & Management (Takes 2/3) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Engagement Chart */}
              <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Student Engagement
                    </h3>
                    <p className="text-sm text-slate-500">
                      Attendance and participation over the last 7 days
                    </p>
                  </div>
                  <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 cursor-pointer focus:ring-2 focus:ring-primary/50">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                {/* Mock Chart Visualization */}
                <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
                  <div
                    className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-end justify-between px-4 pb-0 relative overflow-hidden"
                    data-alt="Bar chart showing engagement trends"
                  >
                    {/* Chart Bars */}
                    {engagementData.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-2 group w-full"
                      >
                        <div
                          className={`w-8 rounded-t-sm transition-all duration-300 relative ${
                            data.percentage >= 80
                              ? "bg-primary shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                              : "bg-blue-200 dark:bg-blue-900/40 group-hover:bg-primary"
                          }`}
                          style={{ height: `${data.percentage}%` }}
                        ></div>
                        <span
                          className={`text-xs ${
                            data.percentage >= 80
                              ? "text-slate-900 dark:text-white font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {data.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Course Management Summary */}
              <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Active Courses Overview
                  </h3>
                  <Link
                    href="/teacher/courses"
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    View All Courses
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Course Name</th>
                        <th className="px-6 py-4">Students</th>
                        <th className="px-6 py-4">Progress</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {activeCourses.length > 0 ? (
                        activeCourses.map((course) => (
                          <tr
                            key={course.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                              <Link
                                href={`/teacher/courses/${course.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {course.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex -space-x-2">
                                {course.students.map((student, i) => (
                                  <div
                                    key={student.id}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-cover bg-center bg-gray-200"
                                    style={{
                                      backgroundImage: student.image
                                        ? `url('${student.image}')`
                                        : undefined,
                                    }}
                                  >
                                    {!student.image && (
                                      <span className="flex items-center justify-center h-full text-[10px] text-gray-500 font-bold">
                                        {student.name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {course.studentCount > 3 && (
                                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                                    +{course.studentCount - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 w-48">
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${course.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium">
                                  {course.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  course.status === "PUBLISHED"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                }`}
                              >
                                {course.status === "PUBLISHED"
                                  ? "Active"
                                  : course.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                href={`/teacher/courses/${course.id}`}
                                className="text-slate-400 hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined">
                                  arrow_forward
                                </span>
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-sm text-slate-500"
                          >
                            No active courses found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <footer className="mt-12 mb-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className="flex justify-between items-center text-sm text-slate-500">
              <p>
                © {new Date().getFullYear()} German Virtual School. All rights
                reserved.
              </p>
              <div className="flex gap-4">
                <Link className="hover:text-primary" href="/privacy">
                  Privacy Policy
                </Link>
                <Link className="hover:text-primary" href="/terms">
                  Terms of Service
                </Link>
                <Link className="hover:text-primary" href="/help">
                  Help Center
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
