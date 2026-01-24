'use client';

import { use, useState } from 'react';
import { useCourse } from '@/hooks/useCourses';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data: course, isLoading, error } = useCourse(courseId);
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/courses/${courseId}/enroll`);
      return data;
    },
    onSuccess: () => {
      toast.success('Successfully enrolled in course!');
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      router.push('/student/courses');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 
                      (typeof error.response?.data?.error === 'string' ? error.response?.data?.error : null) || 
                      'Failed to enroll';
      toast.error(message);
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    enrollMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-text-subtle">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-main dark:text-white mb-4">Course Not Found</h1>
          <p className="text-text-subtle mb-6">The course you're looking for doesn't exist.</p>
          <Link href="/courses" className="text-primary hover:underline">
            Browse all courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <span className="material-symbols-outlined text-4xl">account_circle</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Authentication Required
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  To enroll in this course and start learning, please log in to your student account or create a new one.
                </p>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Log In to Continue
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Create an Account
                  </Link>
                </div>
                
                <p className="mt-6 text-xs text-gray-400">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative bg-primary text-white overflow-hidden">
        {course.thumbnailUrl && (
          <div className="absolute inset-0 z-0">
            <img 
              src={course.thumbnailUrl} 
              alt="" 
              className="w-full h-full object-cover opacity-30 blur-[2px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {course.thumbnailUrl && (
              <div className="w-full md:w-80 aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0">
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm mb-4 opacity-90">
                <Link href="/" className="hover:underline">Home</Link>
                <span>/</span>
                <Link href="/courses" className="hover:underline">Courses</Link>
                <span>/</span>
                <span>{course.title}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg opacity-90 mb-8 max-w-2xl">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-md">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span>
                    {course.teacher?.firstName} {course.teacher?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-md">
                  <span className="material-symbols-outlined text-[20px]">signal_cellular_alt</span>
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-md">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                  <span>{course.durationWeeks} weeks</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-md">
                  <span className="material-symbols-outlined text-[20px]">people</span>
                  <span>{course.enrollmentCount || 0} students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-text-main dark:text-white mb-4">
                  What You'll Learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                        check_circle
                      </span>
                      <span className="text-text-subtle">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content */}
            {course.modules && course.modules.length > 0 && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-text-main dark:text-white mb-4">
                  Course Content
                </h2>
                <div className="space-y-3">
                  {course.modules.map((module: any) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 dark:bg-gray-800 p-4">
                        <h3 className="font-semibold text-text-main dark:text-white">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-text-subtle mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                      {module.resources && module.resources.length > 0 && (
                        <div className="p-4 space-y-2">
                          {module.resources.map((resource: any) => (
                            <div
                              key={resource.id}
                              className="flex items-center gap-3 text-sm"
                            >
                              <span className="material-symbols-outlined text-text-subtle">
                                {resource.type === 'VIDEO' ? 'play_circle' : 'description'}
                              </span>
                              <span className="text-text-main dark:text-white">
                                {resource.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            {course.teacher && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-text-main dark:text-white mb-4">
                  Instructor
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {course.teacher.avatarUrl ? (
                      <img
                        src={course.teacher.avatarUrl}
                        alt={course.teacher.firstName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold">
                        {course.teacher.firstName[0]}{course.teacher.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-main dark:text-white">
                      {course.teacher.firstName} {course.teacher.lastName}
                    </h3>
                    <p className="text-text-subtle text-sm mt-1">
                      {course.teacher.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="mb-6">
                <div className="text-4xl font-bold text-text-main dark:text-white">
                  KES {course.price}
                </div>
                <p className="text-text-subtle text-sm mt-1">
                  {course.durationWeeks} weeks • {course.level}
                </p>
              </div>

              {course.isEnrolled ? (
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mb-3"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Enrolled
                  </button>
                  <Link
                    href={`/student/courses/${courseId}`}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Go to Classroom
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-text-main dark:text-white">
                  This course includes:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-text-subtle text-base">
                      schedule
                    </span>
                    <span className="text-text-subtle">
                      {course.durationWeeks} weeks of content
                    </span>
                  </div>
                  {course.modules && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-text-subtle text-base">
                        folder
                      </span>
                      <span className="text-text-subtle">
                        {course.modules.length} modules
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-text-subtle text-base">
                      workspace_premium
                    </span>
                    <span className="text-text-subtle">
                      Certificate upon completion
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-text-subtle text-base">
                      all_inclusive
                    </span>
                    <span className="text-text-subtle">
                      Full lifetime access
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
