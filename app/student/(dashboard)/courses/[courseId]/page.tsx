"use client";

import { use, useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function StudentCourseClassroomPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const queryClient = useQueryClient();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastSavedTime, setLastPosition] = useState(0);

  // Fetch course details
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course-classroom", courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/courses/${courseId}`);
      return response.data.data;
    },
    enabled: !!courseId,
  });

  // Fetch student progress for this course
  const { data: progressData } = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/student/courses/${courseId}/progress`);
      return response.data.data;
    },
    enabled: !!courseId,
  });

  // Mutation to update progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ resourceId, isCompleted, lastPosition }: { resourceId: string, isCompleted?: boolean, lastPosition?: number }) => {
      const response = await axiosInstance.post(`/api/student/courses/${courseId}/resources/${resourceId}/progress`, {
        isCompleted,
        lastPosition
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] });
    }
  });

  const isResourceCompleted = (resourceId: string) => {
    return progressData?.resourceProgress?.some((p: any) => p.resourceId === resourceId && p.isCompleted);
  };

  const getResourceProgress = (resourceId: string) => {
    return progressData?.resourceProgress?.find((p: any) => p.resourceId === resourceId);
  };

  const handleAction = async (resourceId: string, action: "view" | "download") => {
    try {
      await axiosInstance.patch(`/api/courses/${courseId}/resources`, {
        id: resourceId,
        action,
      });
    } catch (err) {
      console.error("Failed to track action:", err);
    }
  };

  // Auto-save video position
  useEffect(() => {
    if (!selectedResource || selectedResource.type !== 'VIDEO' || !videoRef.current) return;
    
    // Track view when video starts
    handleAction(selectedResource.id, "view");

    const video = videoRef.current;
    
    // Set initial position if saved
    const savedProgress = getResourceProgress(selectedResource.id);
    if (savedProgress?.lastPosition) {
      video.currentTime = savedProgress.lastPosition;
    }

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      // Save every 10 seconds or when significant progress made
      if (Math.abs(currentTime - lastSavedTime) > 10) {
        setLastPosition(currentTime);
        updateProgressMutation.mutate({ 
          resourceId: selectedResource.id, 
          lastPosition: currentTime 
        });
      }

      // Auto-complete if reached 95% of video
      if (video.duration > 0 && (currentTime / video.duration) > 0.95 && !isResourceCompleted(selectedResource.id)) {
        updateProgressMutation.mutate({ 
          resourceId: selectedResource.id, 
          isCompleted: true 
        });
        toast.success("Lesson marked as completed!");
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [selectedResource, videoRef.current]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fc] dark:bg-[#0f1520]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Entering Classroom...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
        <h2 className="text-2xl font-bold mb-2">Classroom Unavailable</h2>
        <p className="text-slate-500 mb-6 max-w-md">We couldn't load the classroom content. Please make sure you are enrolled in this course.</p>
        <Link href="/student/courses" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-primary/25">
          Back to My Courses
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((sum: number, m: any) => sum + (m.resources?.length || 0), 0) || 0;
  const completedLessons = progressData?.resourceProgress?.filter((p: any) => p.isCompleted).length || 0;

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0f1520] flex flex-col transition-colors duration-200">
      {/* Course Header */}
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1a2234]/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <Link href="/student/courses" className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-all group">
              <span className="material-symbols-outlined transition-transform group-hover:-translate-x-0.5">arrow_back</span>
            </Link>
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate" title={course.title}>
                {course.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">{course.level}</span>
                <span>•</span>
                <span>{course.teacher.firstName} {course.teacher.lastName}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end mr-4">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Time Spent</span>
               <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                 {(() => {
                   const totalSeconds = progressData?.resourceProgress?.reduce((acc: number, curr: any) => acc + (curr.lastPosition || 0), 0) || 0;
                   const hours = Math.floor(totalSeconds / 3600);
                   const minutes = Math.floor((totalSeconds % 3600) / 60);
                   return `${hours}h ${minutes}m`;
                 })()}
               </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Overall Progress</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progressData?.progressPercentage || 0}%` }} />
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">{progressData?.progressPercentage || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6 md:gap-8">
        {/* Payment Warning Banner */}
        {course.unpaidInvoice && (
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl shadow-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-5">
              <div className="size-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl">payments</span>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Fee Payment Required</h3>
                <p className="text-white/80 text-sm max-w-md">Your enrollment is pending payment. Please settle the balance of **KES {course.unpaidInvoice.amount.toLocaleString()}** to ensure uninterrupted access.</p>
              </div>
            </div>
            <button 
              onClick={async () => {
                try {
                  const res = await axiosInstance.post('/api/finance/pay', {
                    invoiceId: course.unpaidInvoice.id,
                    amount: course.unpaidInvoice.amount
                  });
                  if (res.data?.data?.checkoutUrl) {
                    window.location.href = res.data.data.checkoutUrl;
                  }
                } catch (err) {
                  toast.error("Failed to initiate payment");
                }
              }}
              className="px-8 py-3 bg-white text-red-600 font-black rounded-xl hover:bg-slate-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              Pay Securely Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Curriculum & Overview */}
        <div className="lg:col-span-8 space-y-8">
          {/* Course Content */}
          <div className="bg-white dark:bg-[#1a2234] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-primary">menu_book</span>
                Course Content
              </h2>
              <span className="text-xs font-bold text-slate-400">{completedLessons} / {totalLessons} Lessons Completed</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {course.modules?.map((module: any, mIndex: number) => {
                const isOpen = activeModule === module.id || (mIndex === 0 && activeModule === null);
                return (
                  <div key={module.id} className="group">
                    <button 
                      onClick={() => setActiveModule(isOpen ? "" : module.id)}
                      className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${
                          isOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {mIndex + 1}
                        </span>
                        <div>
                          <h3 className={`font-bold transition-colors ${isOpen ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                            {module.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">{module.resources?.length || 0} lessons</p>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50/30 dark:bg-slate-900/10"
                        >
                          <div className="px-5 pb-5 pt-2 flex flex-col gap-2">
                            {module.description && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 ml-12 italic">
                                {module.description}
                              </p>
                            )}
                            <div className="ml-12 flex flex-col gap-2">
                              {module.resources?.map((resource: any) => {
                                const completed = isResourceCompleted(resource.id);
                                return (
                                  <button 
                                    key={resource.id}
                                    onClick={() => {
                                      setSelectedResource(resource);
                                      if (resource.type !== 'VIDEO') {
                                        handleAction(resource.id, 'view');
                                      }
                                    }}
                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group/res ${
                                      completed 
                                        ? 'bg-green-50/30 dark:bg-green-900/5 border-green-100 dark:border-green-900/20' 
                                        : 'bg-white dark:bg-[#131b29] border-white dark:border-transparent hover:border-primary/30'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        completed 
                                          ? 'bg-green-500 text-white' 
                                          : resource.type === 'VIDEO' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'
                                      }`}>
                                        <span className="material-symbols-outlined text-[18px]">
                                          {completed ? 'check' : resource.type === 'VIDEO' ? 'play_arrow' : 'description'}
                                        </span>
                                      </div>
                                      <span className={`text-sm font-bold transition-colors ${
                                        completed ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300 group-hover/res:text-primary'
                                      }`}>
                                        {resource.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {completed && <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Completed</span>}
                                      <span className="material-symbols-outlined text-slate-300 group-hover/res:text-primary transition-colors opacity-0 group-hover/res:opacity-100">
                                        {resource.type === 'VIDEO' ? 'play_circle' : 'open_in_new'}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-[#1a2234] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                About this Course
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>

            {course.outcomes && course.outcomes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Learning Outcomes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.outcomes.map((outcome: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="material-symbols-outlined text-green-500 mt-0.5">verified</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Info & Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Progress Statistics Card */}
          <div className="bg-white dark:bg-[#1a2234] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Course Statistics</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{progressData?.progressPercentage || 0}%</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">Completion Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{completedLessons}/{totalLessons}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">Lessons</p>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progressData?.progressPercentage || 0}%` }} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{course.modules?.length || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Modules</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{course.durationWeeks}w</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="bg-white dark:bg-[#1a2234] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Instructor</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-black shadow-inner">
                {course.teacher.firstName[0]}{course.teacher.lastName[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{course.teacher.firstName} {course.teacher.lastName}</h3>
                <p className="text-xs text-slate-500">Course Creator</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {course.teacher.profile?.bio || "No bio available for this instructor."}
            </p>
          </div>
        </div>
        </div>
      </main>

      {/* Resource Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResource(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 flex-shrink-0">
                <div className="flex items-center gap-3 px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isResourceCompleted(selectedResource.id) 
                      ? 'bg-green-500 text-white' 
                      : selectedResource.type === 'VIDEO' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {isResourceCompleted(selectedResource.id) ? 'check' : selectedResource.type === 'VIDEO' ? 'play_arrow' : 'description'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg dark:text-white truncate max-w-[200px] md:max-w-none">{selectedResource.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="flex-1 bg-black overflow-hidden flex items-center justify-center relative min-h-0">
                {selectedResource.type === 'VIDEO' ? (
                  <div className="w-full h-full max-h-full flex items-center justify-center">
                    <div className="w-full max-w-full max-h-full aspect-video">
                      {selectedResource.url.includes('youtube.com') || selectedResource.url.includes('youtu.be') ? (
                        <YouTubePlayer 
                          url={selectedResource.url} 
                          onStart={() => handleAction(selectedResource.id, 'view')}
                          onComplete={() => {
                            if (!isResourceCompleted(selectedResource.id)) {
                              updateProgressMutation.mutate({ resourceId: selectedResource.id, isCompleted: true });
                              toast.success("Video lesson completed!");
                            }
                          }}
                        />
                      ) : (
                        <video 
                          ref={videoRef}
                          src={selectedResource.url} 
                          className="w-full h-full max-h-full object-contain"
                          controls
                          controlsList="nodownload"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                      <span className="material-symbols-outlined text-5xl">description</span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{selectedResource.title}</h4>
                    <p className="text-slate-400 mb-8 max-w-md">This resource is a document or external link. Please open it in a new window to view or download.</p>
                    <a 
                      href={selectedResource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => handleAction(selectedResource.id, 'download')}
                      className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-primary/20"
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                      Open Resource
                    </a>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-8 flex-shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedResource.type} Resource</span>
                {!isResourceCompleted(selectedResource.id) ? (
                  <button 
                    onClick={() => {
                      updateProgressMutation.mutate({ resourceId: selectedResource.id, isCompleted: true });
                      toast.success("Marked as completed!");
                    }}
                    className="flex items-center gap-2 px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-500/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Mark as Completed
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Lesson Completed
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * YouTube Player with API tracking
 */
function YouTubePlayer({ url, onComplete, onStart }: { url: string, onComplete: () => void, onStart?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const videoId = extractYouTubeId(url);
    
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING is 1
            if (event.data === 1 && onStart) {
              onStart();
            }
            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
              onComplete();
            }
          }
        }
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [url]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function extractYouTubeId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}