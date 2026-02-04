"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/Tabs";

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  price: string;
  status: string;
  createdAt: string;
  enrollmentCount: number;
  outcomes: string[];
  modules: any[];
  enrollments: any[];
}

export default function TeacherCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["teacher-course", courseId],
    queryFn: async () => {
      const response = await axios.get(`/courses/${courseId}`);
      return response.data.data as CourseDetail;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Course not found</h2>
        <Link href="/teacher/courses" className="text-primary hover:underline mt-4 inline-block">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header implementation remains the same */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/teacher/courses" className="hover:text-primary">Courses</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span>Course Details</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {course.title}
            <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
              course.status === 'PUBLISHED' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {course.status}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/teacher/courses/${course.id}/edit`}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            Edit Course
          </Link>
          <Link
            href={`/courses/${course.id}`}
            target="_blank"
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
            Preview Public
          </Link>
        </div>
      </div>

      {/* Stats Cards implementation remains same */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total Students</p>
          <p className="text-2xl font-bold">{course.enrollmentCount}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Price</p>
          <p className="text-2xl font-bold">KES {course.price}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Level</p>
          <p className="text-2xl font-bold">{course.level}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Created</p>
          <p className="text-2xl font-bold">{format(new Date(course.createdAt), "MMM d, yy")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {["overview", "curriculum", "students"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold capitalize transition-colors relative whitespace-nowrap ${
                activeTab === tab 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{course.description}</p>
              </section>

              <section className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Learning Outcomes</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            
            <div className="space-y-6">
              <section className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Course Info</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Modules</span>
                    <span className="font-bold">{course.modules?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Language</span>
                    <span className="font-bold">German</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Category</span>
                    <span className="font-bold">General</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="max-w-3xl space-y-4">
            {course.modules?.map((module, i) => {
              const isExpanded = expandedModules.includes(module.id);
              return (
                <div key={module.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </span>
                      <h3 className="font-bold text-left">{module.title}</h3>
                    </div>
                    <span className={`material-symbols-outlined transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1">
                      {module.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">
                          {module.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        {module.resources?.length > 0 ? (
                          module.resources.map((resource: any) => (
                            <button 
                              key={resource.id} 
                              onClick={() => setSelectedResource(resource)}
                              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-[20px] ${
                                  resource.type === 'VIDEO' ? 'text-red-500' : 'text-blue-500'
                                }`}>
                                  {resource.type === 'VIDEO' ? 'play_circle' : 'description'}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                                    {resource.title}
                                  </span>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">visibility</span>
                                      {resource.viewCount ?? 0} views
                                    </span>
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">download</span>
                                      {resource.downloadCount ?? 0} downloads
                                    </span>
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">history</span>
                                      v{resource.version ?? 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="material-symbols-outlined text-slate-400 text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
                                open_in_new
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic text-center py-2">No resources in this module</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "students" && (
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled At</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {course.enrollments?.map((enrollment: any) => (
                  <tr key={enrollment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                          {enrollment.student.firstName[0]}{enrollment.student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{enrollment.student.firstName} {enrollment.student.lastName}</p>
                          <p className="text-xs text-slate-500">{enrollment.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {format(new Date(enrollment.enrolledAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${enrollment.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{enrollment.progressPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!course.enrollments || course.enrollments.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic">
                      No students enrolled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resource Preview Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${selectedResource.type === 'VIDEO' ? 'text-red-500' : 'text-blue-500'}`}>
                  {selectedResource.type === 'VIDEO' ? 'play_circle' : 'description'}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white">{selectedResource.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedResource(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-0 bg-slate-900">
              {selectedResource.type === 'VIDEO' ? (
                <div className="aspect-video w-full h-full">
                  <iframe 
                    src={selectedResource.url.includes('youtube.com') ? selectedResource.url.replace('watch?v=', 'embed/') : selectedResource.url} 
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full h-[60vh] flex flex-col items-center justify-center text-white p-10 gap-6">
                  <span className="material-symbols-outlined text-7xl opacity-20">description</span>
                  <div className="text-center">
                    <p className="text-lg font-medium mb-4">Resource: {selectedResource.title}</p>
                    <a 
                      href={selectedResource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary rounded-xl font-bold hover:bg-blue-600 transition-colors"
                    >
                      <span className="material-symbols-outlined">download</span>
                      Open / Download Resource
                    </a>
                  </div>
                  <p className="text-sm opacity-50 max-w-md text-center">
                    Note: For security and optimal viewing, documents and external links open in a new tab.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedResource(null)}
                className="px-6 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

