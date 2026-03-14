"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { format } from "date-fns";

interface TeacherData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  image: string | null;
  isVerified: boolean;
  createdAt: string;
  teacherProfile: {
    bio: string | null;
    qualifications: string | null;
    specializations: string[];
  } | null;
  createdCourses: Array<{
    id: string;
    title: string;
    level: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    _count: { enrollments: number };
  }>;
  stats: {
    totalCourses: number;
    activeCourses: number;
    totalStudents: number;
  };
}

export default function AdminTeacherDetailPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = use(params);

  const { data: teacher, isLoading } = useQuery<TeacherData>({
    queryKey: ["admin-teacher-detail", teacherId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/teachers/${teacherId}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-slate-500">Teacher not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-6xl mx-auto space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div
            className="size-16 md:size-24 rounded-3xl bg-cover bg-center ring-4 ring-white dark:ring-slate-800 shadow-xl shrink-0"
            style={{
              backgroundImage: `url('${teacher.avatarUrl || teacher.image || "https://ui-avatars.com/api/?name=" + teacher.firstName + "+" + teacher.lastName}')`,
            }}
          ></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
              {teacher.firstName} {teacher.lastName}
              {teacher.isVerified && (
                <span className="material-symbols-outlined text-green-500 text-xl" title="Verified">verified</span>
              )}
            </h1>
            <p className="text-slate-500 font-medium">{teacher.email}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">
                Teacher
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/messages?userId=${teacherId}`}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Send Message
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{teacher.stats.totalCourses}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Courses</p>
          <p className="text-2xl font-black text-green-600 mt-1">{teacher.stats.activeCourses}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
          <p className="text-2xl font-black text-primary mt-1">{teacher.stats.totalStudents}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Courses */}
          <section>
            <h2 className="text-xl font-black flex items-center gap-3 mb-6">
              <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-[20px]">school</span>
              </div>
              Courses Created
            </h2>
            <div className="space-y-3">
              {teacher.createdCourses.map((course) => (
                <div key={course.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {course.level}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{course.title}</h3>
                      <p className="text-xs text-slate-500">
                        {course._count.enrollments} students • ${course.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      course.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                    >
                      View
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
              {teacher.createdCourses.length === 0 && (
                <p className="text-center py-8 text-slate-400 italic">No courses created yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Profile Information</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bio</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {teacher.teacherProfile?.bio || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qualifications</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {teacher.teacherProfile?.qualifications || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specializations</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacher.teacherProfile?.specializations?.length ? (
                    teacher.teacherProfile.specializations.map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">None specified</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{format(new Date(teacher.createdAt), "MMMM yyyy")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
