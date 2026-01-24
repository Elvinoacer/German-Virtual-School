'use client';

import { useState, useEffect } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [page, setPage] = useState(1);
  // Fetch teachers
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTeachers(data.data);
        }
      })
      .catch(err => console.error('Failed to load teachers', err));
  }, []);
  
  const { data, isLoading, error } = useCourses({ 
    page, 
    limit: 12, 
    search: search || undefined,
    level: level || undefined,
    teacherId: teacherId || undefined
  });

  if (error) {
    toast.error('Failed to load courses');
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-card-light dark:bg-card-dark border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-text-main dark:text-white">
            Browse Courses
          </h1>
          <p className="mt-2 text-text-subtle">
            Find the perfect German language course for your level
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-main dark:text-white focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Level Filter */}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-main dark:text-white focus:ring-2 focus:ring-primary"
          >
            <option value="">All Levels</option>
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Proficient</option>
          </select>

          {/* Teacher Filter */}
          <select
            value={teacherId}
            onChange={(e) => {
                setTeacherId(e.target.value);
                setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-main dark:text-white focus:ring-2 focus:ring-primary"
          >
            <option value="">All Instructors</option>
            {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card-light dark:bg-card-dark rounded-xl p-6 animate-pulse">
                <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && data?.data && (
          <>
            {data.data.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">
                  search_off
                </span>
                <h3 className="text-xl font-semibold text-text-main dark:text-white mb-2">
                  No courses found
                </h3>
                <p className="text-text-subtle">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.map((course: any) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="bg-card-light dark:bg-card-dark rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-primary transition-all group"
                  >
                    {/* Course Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {course.thumbnailUrl ? (
                        <img 
                          src={course.thumbnailUrl} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-6xl text-primary">
                          school
                        </span>
                      )}
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <div className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                          {course.level}
                        </div>
                        {course.isEnrolled && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            Enrolled
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-text-subtle text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Teacher */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {course.teacher?.avatarUrl ? (
                            <img 
                              src={course.teacher.avatarUrl} 
                              alt={course.teacher.firstName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold">
                              {course.teacher?.firstName?.[0]}{course.teacher?.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-text-subtle">
                          {course.teacher?.firstName} {course.teacher?.lastName}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            KES {course.price}
                          </span>
                          <span className="text-sm text-text-subtle ml-1">
                            / {course.durationWeeks} weeks
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-text-subtle">
                          <span className="material-symbols-outlined text-base">
                            people
                          </span>
                          <span>{course.enrollmentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-text-main dark:text-white">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
