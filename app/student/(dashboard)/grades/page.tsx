'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { 
  BarChart, 
  Award, 
  FileText, 
  BookOpen, 
  ChevronRight, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface GradesData {
  stats: {
    averageGrade: number;
    assignmentsCompleted: number;
    evaluationsReceived: number;
    activeCourses: number;
  };
  courses: Array<{
    id: string;
    title: string;
    level: string;
    progress: number;
    status: string;
  }>;
  recentGrades: Array<{
    id: string;
    assignmentTitle: string;
    courseTitle: string;
    grade: number;
    maxPoints: number;
    feedback: string | null;
    gradedAt: string;
  }>;
  evaluations: Array<{
    id: string;
    type: 'COURSE' | 'TERM';
    title: string;
    teacherName: string;
    createdAt: string;
    overallScore: number | null;
  }>;
}

export default function StudentGradesPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'evaluations'>('assignments');

  const { data, isLoading, isError } = useQuery<GradesData>({
    queryKey: ['student-grades'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/student/grades');
      return res.data.data;
    }
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">Failed to load grades</h2>
        <p className="text-text-subtle mb-4">Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 text-slate-900 dark:text-white">
        
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight">My Academic Space</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Independent tracking of your <span className="text-primary font-bold">assignment data</span> and <span className="text-purple-500 font-bold">teacher assessments</span>.</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Academic Avg." 
            value={`${data.stats.averageGrade}%`}
            subtext="From Assignments"
            icon={<TrendingUp className="w-5 h-5" />}
            colorClass="bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
          />
          <StatCard 
            title="Assignments" 
            value={data.stats.assignmentsCompleted}
            subtext="Graded & Verified"
            icon={<FileText className="w-5 h-5" />}
            colorClass="bg-blue-500 text-white shadow-xl shadow-blue-500/20"
          />
          <StatCard 
            title="Teacher Reports" 
            value={data.stats.evaluationsReceived}
            subtext="Subjective Reviews"
            icon={<Award className="w-5 h-5" />}
            colorClass="bg-purple-500 text-white shadow-xl shadow-purple-500/20"
          />
          <StatCard 
            title="Active Courses" 
            value={data.stats.activeCourses}
            icon={<BookOpen className="w-5 h-5" />}
            colorClass="bg-amber-500 text-white shadow-xl shadow-amber-500/20"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Details (Takes 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
              <TabButton 
                active={activeTab === 'assignments'} 
                onClick={() => setActiveTab('assignments')}
                label="Academic Data"
                count={data.recentGrades.length}
              />
              <TabButton 
                active={activeTab === 'evaluations'} 
                onClick={() => setActiveTab('evaluations')}
                label="Teacher Assessments"
                count={data.evaluations.length}
              />
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px]">
              {activeTab === 'assignments' ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {data.recentGrades.length > 0 ? (
                    data.recentGrades.map((grade) => (
                      <div key={grade.id} className="p-6 md:p-8 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">Assignment</span>
                               <span className="text-xs text-slate-400 font-medium">{format(new Date(grade.gradedAt), 'MMM d, yyyy')}</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-xl leading-tight mb-1 group-hover:text-primary transition-colors">
                              {grade.assignmentTitle}
                            </h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{grade.courseTitle}</p>
                            
                            {grade.feedback && (
                              <div className="mt-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 relative">
                                <span className="absolute -top-2 left-6 px-2 bg-white dark:bg-surface-dark text-[9px] font-black text-slate-400 border border-slate-100 dark:border-slate-800 rounded">FEEDBACK</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{grade.feedback}"</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="inline-flex flex-col items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                              <span className={`text-3xl font-black ${grade.grade >= 80 ? 'text-emerald-500' : grade.grade >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {grade.grade}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                Points
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState message="Your academic assignment history is currently empty." />
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                   {data.evaluations.length > 0 ? (
                    data.evaluations.map((evalItem) => (
                      <div key={evalItem.id} className="p-6 md:p-8 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                evalItem.type === 'TERM' 
                                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' 
                                  : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
                              }`}>
                                {evalItem.type === 'TERM' ? 'Term Report' : 'Subjective Review'}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                {format(new Date(evalItem.createdAt), 'MMMM d, yyyy')}
                              </span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-2xl group-hover:text-primary transition-colors">
                              {evalItem.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                              By <span className="font-black text-slate-700 dark:text-slate-300">{evalItem.teacherName}</span>
                            </p>
                          </div>
                          
                          <Link href={`/student/evaluations/${evalItem.id}`}>
                            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                              View Report
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))
                   ) : (
                    <EmptyState message="No subjective reports from teachers yet." />
                   )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Insights */}
          <div className="space-y-8">
            <div>
               <h2 className="text-xl font-black mb-6">Subject Progress</h2>
               <div className="bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
                 {data.courses.length > 0 ? (
                   data.courses.map((course) => (
                     <div key={course.id} className="space-y-3">
                       <div className="flex justify-between items-baseline">
                         <h3 className="font-black text-sm truncate pr-4">{course.title}</h3>
                         <span className="text-[10px] font-black text-slate-400 uppercase">{course.level}</span>
                       </div>
                       <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div 
                           className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                           style={{ width: `${course.progress || 0}%` }}
                         />
                       </div>
                       <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>Syllabus covered</span>
                          <span>{course.progress || 0}%</span>
                       </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-center py-6 text-slate-500 text-sm font-medium italic">No active courses tracking progress.</p>
                 )}
               </div>
            </div>
            
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Award size={120} />
               </div>
               <h3 className="text-lg font-black mb-4 relative z-10">Learning Tip</h3>
               <p className="text-sm leading-relaxed opacity-70 mb-6 relative z-10">
                 Teacher assessments provide qualitative context to your quantitative grades. Review behavior feedback to understand how you can improve your classroom presence.
               </p>
               <Link href="/student/reports">
                 <button className="text-xs font-black uppercase tracking-widest border border-white/20 px-4 py-2 rounded-lg hover:bg-white hover:text-slate-900 transition-all">
                    View Overall Trends
                 </button>
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtext, icon, colorClass }: any) {
  return (
    <div className={`p-6 md:p-8 rounded-[2.5rem] border border-transparent transition-all hover:translate-y-[-4px] ${colorClass}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
          {icon}
        </div>
      </div>
      <h3 className="text-4xl font-black mb-1">{value}</h3>
      <p className="text-xs font-black uppercase tracking-[0.1em] opacity-80">{title}</p>
      {subtext && <p className="text-[10px] uppercase font-bold opacity-60 mt-1">{subtext}</p>}
    </div>
  );
}

function TabButton({ active, onClick, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
        active 
          ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' 
          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
      }`}>
        {count}
      </span>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center px-10">
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-full mb-6">
        <BarChart className="w-10 h-10 text-slate-300" />
      </div>
      <h4 className="text-slate-400 font-medium">{message}</h4>
    </div>
  );
}
