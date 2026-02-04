"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface EvaluationDetailsData {
  student: {
    name: string;
    id: string;
    class: string;
    email: string;
    avatar: string;
  };
  course: {
    name: string;
    teacher: string;
    teacherAvatar: string;
  };
  stats: {
    averageGrade: string;
    attendancePercentage: number;
    assignmentCompletion: string | number;
    totalAssignments: number;
  };
  metrics: {
    attendanceScore: number;
    assignmentScore: number;
    participationScore: number;
    behaviorScore: number;
    cefrLevel: string;
  };
  timeline: Array<{
    id: string;
    title: string;
    date: string;
    grade: string;
    feedback: string;
  }>;
  comments: Array<{
    id: string;
    text: string;
    date: string;
    teacher: string;
    avatar: string;
  }>;
}

export default function StudentEvaluationDetailsPage() {
  const params = useParams();
  const evaluationId = params.evaluationId as string;
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery<EvaluationDetailsData>({
    queryKey: ['student-evaluation', evaluationId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/student/evaluations/${evaluationId}`);
      return response.data.data;
    },
    enabled: !!evaluationId
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
        <p>Failed to load evaluation details. Please try again later.</p>
        <Link 
          href="/student/reports"
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Back to Reports
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const { student, course, stats, metrics, timeline, comments } = data;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col antialiased transition-colors duration-200 print:bg-white print:text-black">
      {/* Top Navigation - Hidden on Print */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200 print:hidden">
        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-[1440px]">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">German Virtual School</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="/student/dashboard">Dashboard</Link>
              <Link className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="/student/courses">My Courses</Link>
              <Link className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="/student/assignments">Assignments</Link>
              <Link className="text-primary font-medium text-sm" href="/student/reports">Reports</Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 dark:text-slate-400 hover:text-primary">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.firstName || 'Student'}</p>
                  <p className="text-[10px] text-slate-500">Student</p>
                </div>
                <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-surface-dark cursor-pointer shadow-sm"
                  style={{ backgroundImage: user?.image ? `url('${user.image}')` : undefined, backgroundColor: '#e2e8f0' }}>
                  {!user?.image && <span className="flex items-center justify-center h-full text-slate-500 font-bold">{user?.firstName?.charAt(0)}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 print:p-0 print:max-w-none">
        <div className="mb-8 print:mb-4">
          <Link href="/student/reports" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-4 transition-colors print:hidden">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Overview
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Formal Assessment</span>
                <span className="text-xs text-slate-400 font-medium">{format(new Date(), 'MMMM yyyy')}</span>
              </div>
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-[-0.03em] print:text-black">
                {course.name}
              </h1>
            </div>
            <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 hover:border-primary text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm shadow-xl shadow-slate-200/50 dark:shadow-none transition-all print:hidden active:scale-95">
              <span className="material-symbols-outlined text-[20px]">print</span>
              Print Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            
            {/* Subjective Metrics (Decoupled feedback as per user request) */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden print:border-slate-300">
               <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary fill-1">psychology</span>
                  <h3 className="font-black uppercase tracking-[0.15em] text-xs text-slate-500">Teacher's Subjective Assessment</h3>
               </div>
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <MetricIndicator label="Behavior" value={metrics.behaviorScore} icon="sentiment_satisfied" color="emerald" />
                  <MetricIndicator label="Participation" value={metrics.participationScore} icon="forum" color="purple" />
                  <MetricIndicator label="Proficiency" value={metrics.cefrLevel === "N/A" ? metrics.behaviorScore : 85} labelDisplay={metrics.cefrLevel} icon="translate" color="indigo" />
               </div>
            </div>

            {/* Performance Context (Automatic Data) */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden print:border-slate-300 opacity-90">
               <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">database</span>
                  <h3 className="font-black uppercase tracking-[0.15em] text-xs text-slate-400">Supporting Academic Data (Automatic)</h3>
               </div>
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Attendance Record</p>
                          <p className="text-2xl font-black">{stats.attendancePercentage}%</p>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Verified</span>
                     </div>
                     <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.attendancePercentage}%` }}></div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Assignment Average</p>
                          <p className="text-2xl font-black">{stats.averageGrade}%</p>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Data-Driven</span>
                     </div>
                     <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${stats.averageGrade}%` }}></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Feedback Summary */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold px-2">Detailed Feedback</h3>
                <div className="grid grid-cols-1 gap-6">
                   {comments.map((comment, idx) => (
                      <div key={idx} className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                         <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-primary' : 'bg-amber-500'}`}></div>
                         <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-slate-300">{idx === 0 ? 'contract_edit' : 'trending_up'}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                               {idx === 0 ? 'Overall Assessment' : 'Path to Mastery'}
                            </span>
                         </div>
                         <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                            "{comment.text}"
                         </p>
                         <div className="mt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                            <div className="flex items-center gap-3">
                               <div className="size-8 rounded-full bg-slate-200" style={{ backgroundImage: `url('${comment.avatar}')`, backgroundSize: 'cover' }}></div>
                               <span className="text-sm font-bold">{comment.teacher}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{format(parseISO(comment.date), 'MMMM d, yyyy')}</span>
                         </div>
                      </div>
                   ))}
                </div>
            </div>

          </div>

          <div className="space-y-8">
             {/* Report Summary Card */}
             <div className="bg-primary hover:bg-primary-dark transition-colors text-white p-8 rounded-[2.5rem] shadow-2xl shadow-primary/30 sticky top-24">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Final Report Score</p>
                <div className="flex items-baseline gap-2">
                   <h2 className="text-7xl font-black tracking-tighter">{Math.round(Number(stats.averageGrade))}%</h2>
                   <span className="text-xl font-bold opacity-60">Avg</span>
                </div>
                <div className="mt-8 space-y-4">
                   <p className="text-sm font-medium leading-relaxed opacity-90">
                      This report score represents the teacher's combined subjective assessment and academic data.
                   </p>
                   <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                      <div className="flex justify-between text-xs font-bold">
                         <span>Level Achievement</span>
                         <span>{metrics.cefrLevel}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                         <span>Verified Attendance</span>
                         <span>{stats.attendancePercentage}%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
    </div>
  );
}

function MetricIndicator({ label, value, labelDisplay, icon, color }: any) {
  const colorMap: any = {
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-emerald-500/10",
    purple: "text-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-purple-500/10",
    indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-indigo-500/10"
  };

  const progressColor: any = {
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500"
  };

  return (
    <div className="space-y-5">
       <div className="flex items-center gap-4">
          <div className={`size-12 rounded-2xl flex items-center justify-center shadow-lg ${colorMap[color]}`}>
             <span className="material-symbols-outlined fill-1">{icon}</span>
          </div>
          <div>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
             <p className="text-xl font-bold">{labelDisplay || `${value}%`}</p>
          </div>
       </div>
       <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${progressColor[color]}`} style={{ width: `${value}%` }}></div>
       </div>
    </div>
  );
}
