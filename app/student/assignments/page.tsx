'use client';

import { useState } from 'react';
import { useAssignments } from '@/hooks/useAssignments';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function StudentAssignmentsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const { data: assignments, isLoading } = useAssignments();
  const { user } = useAuth();

  // Calculate stats
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const dueThisWeek = assignments?.filter((a: any) => 
    !a.submissions?.length && 
    new Date(a.dueDate) <= oneWeekFromNow &&
    new Date(a.dueDate) > now
  ).length || 0;

  const missing = assignments?.filter((a: any) => 
    !a.submissions?.length && new Date(a.dueDate) < now
  ).length || 0;

  const graded = assignments?.filter((a: any) => 
    a.submissions?.some((s: any) => s.grade !== null)
  ) || [];
  
  const avgGrade = graded.length > 0
    ? graded.reduce((sum: number, a: any) => sum + (a.submissions[0]?.grade || 0), 0) / graded.length
    : 0;

  // Filter assignments
  const filteredAssignments = assignments?.filter((a: any) => {
    if (filter === 'pending') return !a.submissions?.length;
    if (filter === 'submitted') return a.submissions?.length > 0 && !a.submissions[0]?.grade;
    if (filter === 'graded') return a.submissions?.some((s: any) => s.grade !== null);
    return true;
  }) || [];

  const getAssignmentStatus = (assignment: any) => {
    const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
    const isGraded = hasSubmission && assignment.submissions[0].grade !== null;
    const isPastDue = new Date(assignment.dueDate) < now;

    if (isGraded) return { label: 'Graded', color: 'green', icon: 'check_circle' };
    if (hasSubmission) return { label: 'Submitted', color: 'blue', icon: 'upload' };
    if (isPastDue) return { label: 'Missing', color: 'red', icon: 'warning' };
    if (new Date(assignment.dueDate) <= oneWeekFromNow) return { label: 'Due Soon', color: 'orange', icon: 'schedule' };
    return { label: 'To Do', color: 'gray', icon: 'assignment' };
  };

  return (
    <div className="bg-background-light dark:bg-background-dark h-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-main dark:text-white mb-2">
              My Assignments
            </h1>
            <p className="text-text-subtle">
              Track and submit your coursework
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-subtle text-sm font-medium">Due This Week</p>
                <span className="material-symbols-outlined text-orange-500">schedule</span>
              </div>
              <p className="text-3xl font-bold text-text-main dark:text-white">{dueThisWeek}</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-subtle text-sm font-medium">Missing</p>
                <span className="material-symbols-outlined text-red-500">warning</span>
              </div>
              <p className="text-3xl font-bold text-text-main dark:text-white">{missing}</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-subtle text-sm font-medium">Avg. Grade</p>
                <span className="material-symbols-outlined text-primary">trending_up</span>
              </div>
              <p className="text-3xl font-bold text-text-main dark:text-white">
                {avgGrade > 0 ? `${avgGrade.toFixed(0)}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'pending', 'submitted', 'graded'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-text-subtle hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Assignments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">
                assignment
              </span>
              <h3 className="text-xl font-semibold text-text-main dark:text-white mb-2">
                No assignments found
              </h3>
              <p className="text-text-subtle">
                {filter === 'all' ? 'You have no assignments yet.' : `No ${filter} assignments.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment: any) => {
                const status = getAssignmentStatus(assignment);
                const submission = assignment.submissions?.[0];

                return (
                  <div
                    key={assignment.id}
                    className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded bg-${status.color}-100 dark:bg-${status.color}-900/20 text-${status.color}-600 dark:text-${status.color}-400`}>
                            {status.label}
                          </span>
                          <span className="text-sm text-text-subtle">
                            {assignment.course?.title || 'Course'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-text-main dark:text-white mb-1">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-text-subtle line-clamp-2">
                          {assignment.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-text-subtle">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">star</span>
                            <span>{assignment.maxPoints} points</span>
                          </div>
                          {submission && submission.grade != null && (
                            <div className="flex items-center gap-1 text-primary font-semibold">
                              <span>Grade: {submission.grade}/{assignment.maxPoints}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Link href={`/student/assignments/${assignment.id}`}>
                          <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                            {submission ? 'View Submission' : 'Submit'}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
