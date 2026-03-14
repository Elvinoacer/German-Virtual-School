"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  duration: number;
  createdAt: string;
  teacher: string;
  teacherId: string;
  stats: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    totalModules: number;
    revenue: number;
    completionRate: number;
  };
}

interface AdminCoursesData {
  courses: Course[];
  total: number;
}

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const { data, isLoading, isError } = useQuery<AdminCoursesData>({
    queryKey: ['admin-courses', search, levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (levelFilter !== 'all') params.append('level', levelFilter);
      
      const response = await axiosInstance.get(`/admin/courses?${params}`);
      return response.data.data;
    }
  });

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
        <p>Failed to load courses. Please try again.</p>
      </div>
    );
  }

  const { courses, total } = data;

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white">
            Course Management
          </h1>
          <p className="text-[#4c669a] text-sm mt-1">
            Oversee all courses, enrollments, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs md:text-sm text-[#4c669a]">
            Total Courses: <span className="font-bold text-[#0d121b] dark:text-white">{total}</span>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              search
            </span>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white text-sm"
          >
            <option value="all">All Levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {courses.length > 0 ? courses.map((course) => (
          <div key={course.id} className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                ['A1', 'A2'].includes(course.level) ? 'bg-blue-100 text-primary' :
                ['B1', 'B2'].includes(course.level) ? 'bg-orange-100 text-orange-600' :
                'bg-indigo-100 text-indigo-600'
              }`}>
                {course.level}
              </div>
              <span className="text-sm font-semibold text-green-600">
                ${course.price.toLocaleString()}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-1">
                {course.title}
              </h3>
              <p className="text-xs text-[#4c669a] line-clamp-2">
                {course.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#4c669a]">
              <span className="material-symbols-outlined text-sm">person</span>
              {course.teacher}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e7ebf3] dark:border-[#2d3748]">
              <div>
                <p className="text-xs text-[#4c669a]">Enrollments</p>
                <p className="text-sm font-bold text-[#0d121b] dark:text-white">
                  {course.stats.activeEnrollments}/{course.stats.totalEnrollments}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4c669a]">Completion</p>
                <p className="text-sm font-bold text-[#0d121b] dark:text-white">
                  {course.stats.completionRate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4c669a]">Revenue</p>
                <p className="text-sm font-bold text-green-600">
                  ${course.stats.revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4c669a]">Modules</p>
                <p className="text-sm font-bold text-[#0d121b] dark:text-white">
                  {course.stats.totalModules}
                </p>
              </div>
            </div>

            <Link
              href={`/teacher/courses/${course.id}`}
              className="mt-2 w-full py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium text-center"
            >
              View Course
            </Link>
          </div>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined text-4xl text-[#4c669a] mb-2">school</span>
            <p className="text-[#4c669a]">No courses found</p>
          </div>
        )}
      </div>
    </div>
  );
}
