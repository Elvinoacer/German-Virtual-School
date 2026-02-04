"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui"; // Assuming generic UI components exist

interface GradeSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  description?: string;
  isAutomatic?: boolean;
}

const GradeSlider = ({ label, value, onChange, description, isAutomatic }: GradeSliderProps) => {
  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isAutomatic 
        ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800' 
        : 'bg-white dark:bg-slate-900 border-primary/20 dark:border-primary/30 shadow-sm'
    }`}>
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">
              {label}
            </label>
            {isAutomatic && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                <span className="material-symbols-outlined text-[10px]">database</span>
                Data Driven
              </span>
            )}
            {!isAutomatic && (
               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                 <span className="material-symbols-outlined text-[10px] fill-1">edit</span>
                 Teacher Assessment
               </span>
            )}
          </div>
          {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
        </div>
        <span className={`text-2xl font-black ${value >= 80 ? 'text-emerald-500' : value >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => !isAutomatic && onChange(Number(e.target.value))}
        disabled={isAutomatic}
        className={`w-full h-2 rounded-full appearance-none ${
          isAutomatic 
            ? 'cursor-not-allowed bg-slate-200 dark:bg-slate-800 accent-slate-400' 
            : 'cursor-pointer bg-slate-100 dark:bg-slate-800 accent-primary'
        }`}
      />
      <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>Poor</span>
        <span>Average</span>
        <span>Excellent</span>
      </div>
    </div>
  );
};

export default function EvaluateStudentPage({ params }: { params: Promise<{ studentId: string; courseId: string }> }) {
  const { studentId, courseId } = use(params);
  const router = useRouter();

  // Form State
  const [attendanceScore, setAttendanceScore] = useState(100);
  const [participationScore, setParticipationScore] = useState(80);
  const [assignmentScore, setAssignmentScore] = useState(100);
  const [languageProficiency, setLanguageProficiency] = useState(70);
  const [behaviorScore, setBehaviorScore] = useState(85);
  const [overallComment, setOverallComment] = useState("");
  const [improvements, setImprovements] = useState("");
  const [category, setCategory] = useState("Monthly Evaluation");

  // Fetch Context Data
  const { data: contextData, isLoading: isContextLoading } = useQuery({
    queryKey: ["evaluation-context", studentId, courseId],
    queryFn: async () => {
      const [studentRes, courseRes] = await Promise.all([
        axiosInstance.get(`/teacher/students/${studentId}`),
        axiosInstance.get(`/teacher/courses/${courseId}`)
      ]);
      return {
        student: studentRes.data.data,
        course: courseRes.data.data
      };
    },
  });

  // Fetch Automated Stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["evaluation-stats", studentId, courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/teacher/students/${studentId}/evaluate/${courseId}/stats`);
      return response.data.data;
    },
  });

  // Sync automated values
  useEffect(() => {
    if (statsData) {
      setAttendanceScore(statsData.attendancePercentage);
      setAssignmentScore(statsData.assignmentAverage);
    }
  }, [statsData]);

  const overallGrade = useMemo(() => {
    // Evaluation grade is a summary of all metrics, but emphasizing it as a "Report Score"
    return Math.round((attendanceScore + participationScore + assignmentScore + languageProficiency + behaviorScore) / 5);
  }, [attendanceScore, participationScore, assignmentScore, languageProficiency, behaviorScore]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return axiosInstance.post("/teacher/evaluations", data);
    },
    onSuccess: () => {
      toast.success("Evaluation submitted successfully!");
      router.push(`/teacher/students/${studentId}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit evaluation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      studentId,
      courseId,
      attendanceScore,
      participationScore,
      assignmentScore,
      languageProficiency,
      behaviorScore,
      overallComment,
      improvements,
      category,
    });
  };

  const isLoading = isContextLoading || isStatsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-xl"></div>
          <p className="text-sm font-black uppercase tracking-widest animate-pulse">Preparing Evaluation Workspace...</p>
        </div>
      </div>
    );
  }

  const { student, course } = contextData || {};

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-10">
        
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <Link href={`/teacher/students/${studentId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-4 transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Student Profile
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-2 leading-tight">Evaluation Report</h1>
              <p className="text-slate-500 text-sm md:text-lg leading-relaxed">
                Subjective teacher assessment for <span className="font-bold text-slate-900 dark:text-white">{student?.firstName} {student?.lastName}</span> in <span className="font-bold text-primary">{course?.title}</span>
              </p>
            </div>
            <div className="text-right bg-white dark:bg-surface-dark px-6 py-4 md:px-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Report Score</p>
               <p className={`text-3xl md:text-5xl font-black ${overallGrade >= 80 ? 'text-emerald-500' : overallGrade >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                 {overallGrade}%
               </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Metadata */}
          <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Report Type</label>
                 <select
                   value={category}
                   onChange={(e) => setCategory(e.target.value)}
                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                 >
                   <option value="Monthly Evaluation">Monthly Evaluation</option>
                   <option value="Mid-Term Report">Mid-Term Report</option>
                   <option value="End of Term Report">End of Term Report</option>
                   <option value="Ad-hoc Assessment">Ad-hoc Assessment</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Date of Assessment</label>
                 <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-500 cursor-not-allowed">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                 </div>
               </div>
             </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
              Subjective Assessment
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GradeSlider 
                label="Behavior" 
                value={behaviorScore} 
                onChange={setBehaviorScore}
                description="Conduct and classroom manners"
              />
              <GradeSlider 
                label="Participation" 
                value={participationScore} 
                onChange={setParticipationScore}
                description="Engagement in live sessions"
              />
              <GradeSlider 
                label="Proficiency" 
                value={languageProficiency} 
                onChange={setLanguageProficiency}
                description="Speaking and comprehension"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
              Performance Context (Automatic)
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
              <GradeSlider 
                label="Attendance" 
                value={attendanceScore} 
                onChange={setAttendanceScore}
                isAutomatic={true}
                description={`Based on ${statsData?.totalSessions || 0} sessions`}
              />
              <GradeSlider 
                label="Academic Average" 
                value={assignmentScore} 
                onChange={setAssignmentScore}
                isAutomatic={true}
                description={`Avg. of ${statsData?.gradedAssignments || 0} graded items`}
              />
            </div>
          </div>

          {/* Qualitative Feedback */}
          <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
             <div className="space-y-3">
               <label className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary fill-1">edit_note</span>
                 Teacher's Summary Feedback
               </label>
               <textarea
                 value={overallComment}
                 onChange={(e) => setOverallComment(e.target.value)}
                 required
                 placeholder="Summarize the student's overall progress and attitude..."
                 className="w-full h-36 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-medium shadow-inner focus:ring-2 focus:ring-primary outline-none resize-none transition-all"
               />
             </div>
             
             <div className="space-y-3">
               <label className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 fill-1">trending_up</span>
                  Support & Improvement Plan
               </label>
               <textarea
                 value={improvements}
                 onChange={(e) => setImprovements(e.target.value)}
                 required
                 placeholder="List specific goals or areas where the student needs focus..."
                 className="w-full h-36 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-medium shadow-inner focus:ring-2 focus:ring-primary outline-none resize-none transition-all"
               />
             </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
             <Link href={`/teacher/students/${studentId}`} className="flex-1">
                <Button variant="outline" type="button" className="w-full h-16 text-base font-bold rounded-2xl border-2 hover:bg-slate-50 transition-all">Cancel</Button>
             </Link>
             <Button 
               type="submit" 
               className="flex-[2] h-16 text-base font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
               disabled={mutation.isPending}
             >
               {mutation.isPending ? (
                 <span className="flex items-center gap-2">
                   <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                   Saving Evaluation...
                 </span>
               ) : "Generate Final Report"}
             </Button>
          </div>

        </form>
      </div>
      
      {/* Verify Icons Load */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
    </div>
  );
}
