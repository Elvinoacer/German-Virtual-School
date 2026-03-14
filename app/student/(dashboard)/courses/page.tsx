"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useCourses } from "@/hooks/useCourses";
import { format } from "date-fns";

export default function StudentCoursesPage() {
  const { data: session } = useSession();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: availableCoursesData, isLoading: coursesLoading } = useCourses({
    limit: 4,
  });

  const activeEnrollments =
    enrollments?.filter((e: any) => e.status === "ACTIVE") || [];
  const enrolledCourseIds = enrollments?.map((e: any) => e.courseId) || [];
  const availableCourses =
    availableCoursesData?.data?.filter(
      (c: any) => !enrolledCourseIds.includes(c.id)
    ) || [];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white antialiased min-h-screen flex flex-col transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-border-dark bg-white/90 dark:bg-[#111722]/90 backdrop-blur-md transition-colors duration-200">
        <div className="px-4 lg:px-10 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 text-gray-900 dark:text-white"
          >
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-4xl">school</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              German Virtual School
            </h2>
          </Link>
          <nav className="hidden md:flex flex-1 justify-end items-center gap-8">
            <div className="flex items-center gap-6 lg:gap-9">
              <Link
                className="text-sm font-medium hover:text-primary transition-colors"
                href="/student/dashboard"
              >
                My Dashboard
              </Link>
              <Link
                className="text-sm font-medium text-primary"
                href="/student/courses"
              >
                Courses
              </Link>
              <Link
                className="text-sm font-medium hover:text-primary transition-colors"
                href="/student/reports"
              >
                Reports
              </Link>
              <Link
                className="text-sm font-medium hover:text-primary transition-colors"
                href="/forum"
              >
                Community
              </Link>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-border-dark">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Student
                </p>
                <p className="text-sm font-bold">
                  {session?.user?.firstName} {session?.user?.lastName?.[0]}.
                </p>
              </div>
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary cursor-pointer"
                style={{
                  backgroundImage: `url('${
                    session?.user?.image ||
                    "https://ui-avatars.com/api/?name=" +
                      session?.user?.firstName +
                      "+" +
                      session?.user?.lastName
                  }')`,
                }}
              ></div>
            </div>
          </nav>
          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-600 dark:text-gray-300">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero Section */}
        <div className="w-full max-w-[1440px] px-4 md:px-10 pt-8 pb-6">
          <div
            className="relative overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat min-h-[360px] md:min-h-[420px] flex flex-col justify-end p-6 md:p-12 gap-6 group"
            style={{
              backgroundImage:
                "linear-gradient(rgba(16, 22, 34, 0.2) 0%, rgba(16, 22, 34, 0.9) 100%), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
            }}
          >
            <div className="relative z-10 max-w-2xl animate-fade-in-up">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-white uppercase bg-primary rounded-full bg-opacity-90">
                Current Semester
              </span>
              <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-2">
                Willkommen back, {session?.user?.firstName}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-lg mb-6">
                Continue your learning journey or explore new subjects today.
                You are currently enrolled in {activeEnrollments.length} active{" "}
                {activeEnrollments.length === 1 ? "course" : "courses"}.
              </p>
            </div>
          </div>
        </div>

        {/* Course Grid - My Enrolled Courses */}
        <div className="w-full max-w-[1440px] px-4 md:px-10 py-8">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              school
            </span>
            My Active Courses
          </h3>

          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white dark:bg-surface-dark rounded-xl animate-pulse border border-gray-200 dark:border-border-dark"
                />
              ))}
            </div>
          ) : activeEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {activeEnrollments.map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="group flex flex-col bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute top-3 left-3 z-10 bg-primary/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                      {enrollment.status}
                    </div>
                    {enrollment.course.thumbnailUrl ? (
                      <img
                        src={enrollment.course.thumbnailUrl}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl">
                          school
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {enrollment.course.level}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {enrollment.course.durationWeeks} Weeks
                      </p>
                    </div>
                    <h3
                      className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1"
                      title={enrollment.course.title}
                    >
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {enrollment.course.teacher.firstName}{" "}
                      {enrollment.course.teacher.lastName}
                    </p>
                    <div className="mt-auto">
                      <div className="flex justify-between text-xs font-medium mb-1.5 text-gray-500 dark:text-gray-400">
                        <span>Time Spent</span>
                        <span className="text-primary font-bold">
                          {(() => {
                            const totalSeconds =
                              enrollment.totalTimeSeconds || 0;
                            const hours = Math.floor(totalSeconds / 3600);
                            const minutes = Math.floor(
                              (totalSeconds % 3600) / 60
                            );
                            return `${hours}h ${minutes}m`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-medium mb-1.5 text-gray-500 dark:text-gray-400">
                        <span>Progress</span>
                        <span className="text-primary">
                          {enrollment.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-[#111722] rounded-full h-1.5 mb-4">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progressPercentage}%` }}
                        ></div>
                      </div>
                      <Link
                        href={`/student/courses/${enrollment.courseId}`}
                        className="w-full py-2 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <span>Go to Classroom</span>
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-10 text-center mb-12">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">
                history_edu
              </span>
              <p className="text-gray-500">
                You are not enrolled in any courses yet.
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("explore")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="mt-4 text-primary font-bold hover:underline"
              >
                Browse available courses
              </button>
            </div>
          )}

          <div
            id="explore"
            className="flex items-center justify-between mb-6 pt-4"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">
                explore
              </span>
              Explore More Courses
            </h3>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white dark:bg-surface-dark rounded-xl animate-pulse border border-gray-200 dark:border-border-dark"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {availableCourses.map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex flex-col bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-3 left-3 z-10 text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">
                        schedule
                      </span>
                      <span className="text-xs font-medium">
                        {course.durationWeeks} Weeks
                      </span>
                    </div>
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl">
                          school
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase text-blue-500 ring-1 ring-inset ring-blue-500/20">
                        {course.level}
                      </span>
                      <div className="flex gap-1 items-center">
                        <span className="text-sm font-bold text-primary">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-border-dark flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                          {course.teacher.firstName[0]}
                        </div>
                        <span className="text-xs text-gray-500">
                          {course.teacher.firstName}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination / Load More */}
          <div className="flex justify-center mt-8 pb-12">
            <Link
              href="/courses"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark hover:border-primary text-gray-900 dark:text-white font-bold text-sm transition-all shadow-sm"
            >
              <span>Load More Courses</span>
              <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform">
                expand_more
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-border-dark bg-white dark:bg-[#111722] py-8 transition-colors duration-200">
        <div className="w-full max-w-[1440px] px-4 md:px-10 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="size-6 text-primary">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            <span className="font-bold">German Virtual School</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 dark:text-gray-400">
            <Link className="hover:text-primary" href="/support">
              Support
            </Link>
            <Link className="hover:text-primary" href="/faq">
              FAQ
            </Link>
            <Link className="hover:text-primary" href="/calendar">
              Academic Calendar
            </Link>
            <Link className="hover:text-primary" href="/privacy">
              Privacy Policy
            </Link>
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} GVS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
