"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import { CourseLevel, CourseStatus } from '@/generated/prisma/client';
import { useSession } from "next-auth/react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  status: CourseStatus;
  price: number;
  durationWeeks: number;
  thumbnailUrl: string | null;
  createdAt: string;
  enrollmentCount: number;
}

export default function TeacherCoursesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["teacher-courses", session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/courses?teacherId=${session?.user?.id}&status=ALL`);
      return response.data.data.data as Course[];
    },
    enabled: !!session?.user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await axios.delete(`/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      toast.success("Course deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete course");
    },
  });

  const handleDelete = (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      deleteMutation.mutate(courseId);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              My Courses
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Manage your courses and curriculum.
            </p>
          </div>
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 h-64 animate-pulse" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl">image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      course.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Created on {format(new Date(course.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">group</span>
                      {course.enrollmentCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">payments</span>
                      KES {course.price}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">signal_cellular_alt</span>
                      {course.level}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teacher/courses/${course.id}`}
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        View
                      </Link>
                      <Link
                        href={`/teacher/courses/${course.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Edit
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-bold"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Delete Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">No courses found. Create your first course to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

