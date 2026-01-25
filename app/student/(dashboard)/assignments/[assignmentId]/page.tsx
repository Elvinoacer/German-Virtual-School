"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useParams } from "next/navigation";
import { useAssignment } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, isPast, differenceInSeconds } from "date-fns";
import { useEffect } from "react";

export default function AssignmentDetailsPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const { data: assignment, isLoading, isError } = useAssignment(assignmentId);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'text' | 'file'>('file');
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data: { content?: string, attachmentUrls?: string[] }) => {
      await axiosInstance.post(`/api/assignments/${assignmentId}/submit`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      toast.success("Assignment submitted successfully!");
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || "Failed to submit assignment");
    }
  });

  const handleSubmit = () => {
    setError("");
    if (activeTab === 'text' && !submissionText.trim()) {
      setError("Please enter some text.");
      return;
    }
    if (activeTab === 'file' && !submissionUrl.trim()) {
      setError("Please enter a file URL.");
      return;
    }

    const payload = activeTab === 'text' 
       ? { content: submissionText } 
       : { attachmentUrls: [submissionUrl] };
    
    submitMutation.mutate(payload);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      let url = "";
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'submissions');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      url = result.data.url;

      setSubmissionUrl(url);
      toast.success("File uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Upload error:", err);
      setError("File upload failed. Please try again.");
      toast.error("Upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const remainingTime = useMemo(() => {
    if (!assignment?.dueDate) return null;
    const due = new Date(assignment.dueDate);
    const diff = due.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  }, [assignment?.dueDate, now]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-300">
        <div className="relative">
          <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl animate-pulse">school</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-main dark:text-white px-6 text-center">
        <div className="size-20 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
          <span className="material-symbols-outlined text-4xl">warning</span>
        </div>
        <h2 className="text-3xl font-black mb-3 tracking-tight">Assignment not found</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
          The assignment you are looking for might have been removed or you don't have access to it.
        </p>
        <Link 
          href="/student/assignments" 
          className="px-8 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Assignments
        </Link>
      </div>
    );
  }

  const submission = assignment.submissions?.[0];
  const isSubmitted = !!submission;
  const isGraded = isSubmitted && submission.grade !== null;
  const isLate = isSubmitted && new Date(submission.submittedAt) > new Date(assignment.dueDate);
  const isMissing = !isSubmitted && isPast(new Date(assignment.dueDate));

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white font-display min-h-screen transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/student/dashboard" className="flex items-center gap-2 group">
              <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </div>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-0.5">Course</span>
              <span className="text-sm font-bold truncate max-w-[150px] sm:max-w-[300px]">{assignment.course?.title}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/student/dashboard" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/student/courses" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Courses</Link>
              <Link href="/student/assignments" className="text-sm font-bold text-primary">Assignments</Link>
            </div>
            <div className="size-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden bg-slate-200">
              {user?.image ? (
                <img src={user.image} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-slate-100 uppercase">
                  {user?.firstName?.[0]}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Side: Assignment Content (8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Content */}
            <div className="relative overflow-hidden bg-white dark:bg-[#1a2234] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/5 dark:shadow-none transition-colors duration-300">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {isGraded ? (
                    <span className="px-3 py-1 bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-200 dark:border-green-500/20">Graded</span>
                  ) : isSubmitted ? (
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-200 dark:border-blue-500/20">Submitted</span>
                  ) : isMissing ? (
                    <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-200 dark:border-red-500/20">Missing</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-500/20">Pending</span>
                  )}
                  {isLate && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-200 dark:border-red-500/20">Late Submission</span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-[1.1]">{assignment.title}</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined text-[24px]">event</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Due Date</p>
                      <p className="text-sm font-bold">{format(new Date(assignment.dueDate), 'MMM d, yyyy • HH:mm')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-500">
                      <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Max Score</p>
                      <p className="text-sm font-bold">{assignment.maxPoints} Points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl flex items-center justify-center ${isSubmitted ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                      <span className="material-symbols-outlined text-[24px]">{isSubmitted ? 'task_alt' : 'hourglass_empty'}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time Limit</p>
                      <p className={`text-sm font-bold ${isPast(new Date(assignment.dueDate)) && !isSubmitted ? 'text-red-500' : ''}`}>{remainingTime}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative side accent */}
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent hidden md:block"></div>
            </div>

            {/* Instructions & Details */}
            <div className="bg-white dark:bg-[#1a2234] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300 overflow-hidden">
                <div className="px-6 md:px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Assignment Instructions
                  </h3>
               </div>
               <div className="p-8">
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black">
                    {assignment.description ? (
                       <div className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 text-lg">
                          {assignment.description}
                       </div>
                    ) : (
                       <p className="text-slate-400 italic">No detailed instructions provided for this assignment.</p>
                    )}
                  </div>
                  
                  {/* Resources Sub-section */}
                  {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                     <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Learning Resources</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {assignment.attachmentUrls.map((url: string, idx: number) => (
                              <a 
                                key={idx} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-all flex items-center justify-between"
                              >
                                 <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="size-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100 dark:border-slate-700">
                                       <span className="material-symbols-outlined">attachment</span>
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                       <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-4">Resource {idx + 1}</span>
                                       <span className="text-[10px] text-slate-400 truncate pr-4">{url}</span>
                                    </div>
                                 </div>
                                 <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">open_in_new</span>
                              </a>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Rubric Criteria */}
                   {assignment.rubric?.criteria && assignment.rubric.criteria.length > 0 && (
                     <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Grading Rubric</h4>
                        <div className="space-y-3">
                           {assignment.rubric.criteria.map((criterion: any, idx: number) => (
                              <div key={criterion?.id || idx} className="flex items-start gap-3 p-4 bg-amber-50/30 dark:bg-amber-500/5 rounded-2xl border border-amber-100/50 dark:border-amber-500/10">
                                 <div className="size-6 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                                    <span className="text-[12px] font-black">{idx + 1}</span>
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                       {typeof criterion === 'string' ? criterion : criterion?.name || 'Criterion'}
                                    </p>
                                    {typeof criterion === 'object' && criterion?.maxPoints && (
                                       <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{criterion.maxPoints} points</p>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Evaluation & Feedback (If Graded) */}
            {isGraded && (
               <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-1 shadow-xl shadow-green-500/20">
                  <div className="bg-white dark:bg-[#0f172a] rounded-[22px] overflow-hidden">
                     <div className="px-6 md:px-8 py-6 bg-green-50/50 dark:bg-green-500/5 border-b border-green-100 dark:border-green-500/10 flex items-center justify-between">
                        <h3 className="text-xl font-black text-green-700 dark:text-green-400 flex items-center gap-2">
                           <span className="material-symbols-outlined">stars</span>
                           Performance Evaluation
                        </h3>
                        <div className="px-4 py-2 bg-green-600 text-white rounded-xl font-black text-lg">
                           {submission.grade} / {assignment.maxPoints}
                        </div>
                     </div>
                     <div className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                           <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor Feedback</span>
                              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-600 dark:text-slate-300 leading-relaxed">
                                 "{submission.feedback || "Great work on this assignment!"}"
                              </div>
                           </div>
                           <div className="flex flex-wrap gap-6 items-center pt-4 border-t border-slate-50 dark:border-slate-900">
                             <div className="flex items-center gap-2">
                               <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
                               <span className="text-xs font-bold text-slate-500">Graded on {format(new Date(submission.gradedAt || new Date()), 'MMM d, yyyy')}</span>
                             </div>
                             {submission.gradedBy && (
                               <div className="flex items-center gap-2">
                                 <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                                 <span className="text-xs font-bold text-slate-500">Evaluated by Instructor</span>
                               </div>
                             )}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </div>

          {/* Right Side: Submission Panel (4 columns) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            
            <div className="bg-white dark:bg-[#1a2234] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/5 dark:shadow-none overflow-hidden transition-colors duration-300">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black">Your Submission</h3>
              </div>
              <div className="p-6 md:p-8">
                {isSubmitted ? (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="size-20 bg-green-50 dark:bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 mb-6 group relative">
                       <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">verified</span>
                       <div className="absolute -top-1 -right-1 size-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                    </div>
                    <h4 className="text-2xl font-black mb-2">Work Turned In</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                       Your assignment was successfully submitted on <br/>
                       <span className="font-bold text-slate-700 dark:text-slate-200">{format(new Date(submission.submittedAt), 'MMMM d • HH:mm')}</span>
                    </p>
                    
                    <div className="w-full space-y-4">
                       {submission.content && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Submitted Text</p>
                             <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{submission.content}</p>
                          </div>
                       )}
                       {submission.attachmentUrls && submission.attachmentUrls.length > 0 && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attached Files</p>
                             <div className="flex flex-col gap-2">
                                {submission.attachmentUrls.map((url: string, i: number) => (
                                   <a 
                                     key={i} 
                                     href={url} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="flex items-center gap-2 text-primary font-bold text-xs truncate hover:underline group"
                                   >
                                      <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">file_present</span>
                                      <span className="truncate">{url.split('/').pop()}</span>
                                      <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                                   </a>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>

                    {!isGraded && (
                      <button 
                         className="mt-10 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full"
                         onClick={() => toast.info("Unsubmit functionality is coming soon.")}
                      >
                        Unsubmit Assignment
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Mode Selector */}
                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                      <button 
                        onClick={() => setActiveTab('file')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'file' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        Upload
                      </button>
                      <button 
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'text' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        Text
                      </button>
                    </div>

                    {activeTab === 'file' ? (
                       <div className="space-y-6">
                         <div className="relative group">
                            <input 
                               type="file" 
                               id="file-upload-main"
                               className="hidden"
                               onChange={handleFileUpload}
                               disabled={isUploading}
                            />
                            <label 
                               htmlFor="file-upload-main"
                               className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all ${
                                  isUploading 
                                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 animate-pulse' 
                                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:bg-primary/5 hover:border-primary/50'
                               }`}
                            >
                               {isUploading ? (
                                  <div className="flex flex-col items-center gap-3">
                                     <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                                     <span className="text-xs font-black text-primary uppercase tracking-widest">Uploading Asset...</span>
                                  </div>
                               ) : (
                                  <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform text-slate-400 group-hover:text-primary">
                                     <div className="size-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 mb-2">
                                        <span className="material-symbols-outlined text-4xl">add_circle</span>
                                     </div>
                                     <span className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Select File</span>
                                     <span className="text-[10px] opacity-60">PDF, DOCX, JPG, PNG supported</span>
                                  </div>
                               )}
                            </label>
                         </div>

                         {submissionUrl && (
                            <div className="group animate-in fade-in slide-in-from-top-2 duration-300">
                               <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/10 rounded-[2rem] flex items-center justify-between">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                     <div className="size-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-50">
                                        <span className="material-symbols-outlined text-[20px]">attach_file</span>
                                     </div>
                                     <div className="flex flex-col overflow-hidden">
                                        <span className="text-xs font-bold truncate max-w-[120px]">{submissionUrl.split('/').pop()}</span>
                                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Ready to submit</span>
                                     </div>
                                  </div>
                                  <button 
                                     onClick={() => setSubmissionUrl("")}
                                     className="size-8 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center transition-all group-hover:rotate-90"
                                  >
                                     <span className="material-symbols-outlined text-[18px]">close</span>
                                  </button>
                               </div>
                            </div>
                         )}

                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Manual Link Fallback</label>
                            <div className="relative group">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                  <span className="material-symbols-outlined text-[20px]">link</span>
                               </div>
                               <input 
                                  type="url" 
                                  className="w-full h-12 pl-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-4 font-medium"
                                  placeholder="Paste cloud storage link..."
                                  value={submissionUrl}
                                  onChange={(e) => setSubmissionUrl(e.target.value)}
                               />
                            </div>
                         </div>
                       </div>
                    ) : (
                       <div className="space-y-4 animate-in fade-in duration-300">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Content Submission</label>
                          <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                             <textarea 
                                className="w-full p-6 text-sm bg-transparent border-none focus:ring-0 min-h-[250px] font-medium leading-relaxed"
                                placeholder="Draft your submission or notes here..."
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                             />
                          </div>
                          {error && <p className="text-red-500 text-xs font-bold pl-2">{error}</p>}
                       </div>
                    )}

                    <button 
                      onClick={handleSubmit} 
                      disabled={submitMutation.isPending || isUploading}
                      className="group relative w-full h-14 bg-primary hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      <div className="relative z-10 flex items-center gap-3">
                         {submitMutation.isPending ? (
                            <>
                               <div className="size-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                               <span className="tracking-tight">Handing in...</span>
                            </>
                         ) : isUploading ? (
                            <>
                               <span className="material-symbols-outlined animate-bounce">upload</span>
                               <span className="tracking-tight">Waiting for Upload</span>
                            </>
                         ) : (
                            <>
                               <span className="tracking-tight uppercase tracking-wider text-xs">Turn In Assignment</span>
                               <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                            </>
                         )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                    
                    <p className="text-[10px] text-center text-slate-400 font-bold px-4">
                       By clicking "Turn In", you acknowledge that this is your own original work.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Helper Info Card */}
            <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-3xl p-6 border border-amber-100 dark:border-amber-500/10 flex items-start gap-4 transition-colors">
               <div className="size-10 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <span className="material-symbols-outlined">lightbulb</span>
               </div>
               <div>
                  <h5 className="font-black text-amber-700 dark:text-amber-400 text-sm mb-1 uppercase tracking-tight">Student Tip</h5>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/60 leading-relaxed font-medium">
                     Make sure to double check the grading rubric before submitting. Late submissions might be subject to point deductions.
                  </p>
               </div>
            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
        
        :root {
          --font-display: 'Outfit', sans-serif;
        }

        .font-display {
          font-family: var(--font-display);
        }

        .prose h1, .prose h2, .prose h3, .prose h4 {
           font-family: var(--font-display);
           letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
