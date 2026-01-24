"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface Resource {
    id: string;
    title: string;
    type: string;
    url: string;
    fileSize: number | null;
}

interface SessionData {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  objectives: string[];
  homework: string | null;
  course: {
    id: string;
    title: string;
    level: string;
    resources: Resource[];
  };
  teacher: {
    firstName: string;
    lastName: string;
    image: string | null;
  };
  attendance: {
    student: {
        id: string;
        firstName: string;
        lastName: string;
        image: string | null;
    }
  }[];
}

export default function LiveClassDetailsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const courseId = params.courseId as string;
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  const { data: session, isLoading, error } = useQuery<SessionData>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch session");
      }
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
  }

  if (error || !session) {
    return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark flex-col gap-4 text-slate-900 dark:text-white">
          <h2 className="text-xl font-bold">Error Loading Session Details</h2>
          <p className="text-slate-500">{(error as Error)?.message || "Session not found."}</p>
          <Link href="/student/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      );
  }
  
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden h-screen flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0 z-20 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            German Virtual School
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              className="text-slate-600 dark:text-slate-300 hover:text-primary text-sm font-medium leading-normal transition-colors"
              href="/student/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="text-primary text-sm font-medium leading-normal transition-colors"
              href="/student/courses"
            >
              My Classes
            </Link>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-3">
             {user && (
                 <>
                    <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.role === 'STUDENT' ? 'Student' : 'Teacher'}
                    </p>
                    </div>
                    <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-slate-100 dark:border-slate-800"
                    style={{
                        backgroundImage: `url('${user.image || "https://ui-avatars.com/api/?name=" + user.name}')`,
                    }}
                    ></div>
                </>
             )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Video & Controls */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-black/20 p-4 md:p-6 gap-6 transition-colors duration-200">
          {/* Breadcrumbs & Heading */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link
                className="hover:text-primary transition-colors"
                href="/student/dashboard"
              >
                Home
              </Link>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <Link
                className="hover:text-primary transition-colors"
                href={`/courses/${courseId}`}
              >
                {session.course.title}
              </Link>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <span className="text-slate-900 dark:text-white font-medium">
                Live Session
              </span>
            </div>
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {session.title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    schedule
                  </span>{" "}
                  {durationMinutes} min Duration
                  <span className="mx-1">•</span>
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>{" "}
                  Instructor: {session.teacher.firstName} {session.teacher.lastName}
                </p>
              </div>
              <div className="flex gap-2">
                  {session.status === 'LIVE' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                    <span className="size-2 rounded-full bg-red-600 dark:bg-red-500"></span>{" "}
                    LIVE
                    </span>
                  )}
                  {session.status === 'SCHEDULED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      SCHEDULED
                      </span>
                  )}
              </div>
            </div>
          </div>

          {/* Main Video Stage (Placeholder/Preview) */}
          <div className="flex-1 min-h-[400px] flex flex-col gap-4">
            {/* Primary Video Feed (Teacher) */}
            <div className="relative w-full flex-1 bg-black rounded-xl overflow-hidden shadow-lg group">
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{
                  backgroundImage: session.teacher.image 
                    ? `url('${session.teacher.image}')` 
                    : "linear-gradient(to bottom right, #1f2937, #111827)",
                }}
              ></div>
               {!session.teacher.image && (
                  <div className="flex items-center justify-center h-full text-white/20">
                      <span className="material-symbols-outlined text-9xl">person</span>
                  </div>
               )}
              {/* Network Indicator */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-green-400 text-[18px]">
                  signal_cellular_alt
                </span>
                <span className="text-white text-xs font-medium">HD</span>
              </div>
              {/* Speaker Name Label */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-[18px]">
                  mic
                </span>
                <span className="text-white text-sm font-medium">
                   {session.teacher.firstName} {session.teacher.lastName} (Host)
                </span>
              </div>
            </div>
          </div>

          {/* Session Controls Bar (Bottom) */}
          <div className="sticky bottom-0 z-10 mx-auto w-full max-w-2xl">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-4 py-3 flex items-center justify-between gap-4 transition-colors duration-200">
               <Link href={`/classroom/${sessionId}`} className="w-full">
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-3 rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/25">
                    <span className="material-symbols-outlined">videocam</span>
                    Join Live Class
                </button>
               </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 hidden lg:flex transition-colors duration-200">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button className="flex-1 py-4 text-sm font-medium text-primary border-b-2 border-primary bg-primary/5">
              Class Details
            </button>
            <button className="flex-1 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              Participants ({session.attendance.length})
            </button>
          </div>
          {/* Tab Content: Details */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
            {/* Objectives */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Lesson Objectives
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                {session.objectives && session.objectives.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {session.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500 italic">No specific objectives listed.</p>
                )}
              </div>
            </div>
            {/* Homework */}
            {session.homework && (
                <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Homework
                </h3>
                <div className="flex items-start gap-3">
                    <div className="size-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                        assignment
                    </span>
                    </div>
                    <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {session.homework}
                    </p>
                    </div>
                </div>
                </div>
            )}
            {/* Resources */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Resources
              </h3>
              <div className="space-y-3">
                {session.course.resources && session.course.resources.length > 0 ? (
                    session.course.resources.map(resource => (
                        <Link
                        key={resource.id}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                        href={resource.url}
                        target="_blank"
                        >
                        <div className="size-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                            <span className="material-symbols-outlined">
                                {resource.type === 'PDF' ? 'picture_as_pdf' : 'link'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {resource.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                            {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Link'}
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">
                            open_in_new
                        </span>
                        </Link>
                    ))
                ) : (
                     <p className="text-sm text-slate-500 italic">No resources attached.</p>
                )}
              </div>
            </div>
            {/* Notes Area (Mini) */}
            <div className="mt-auto">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                My Notes
              </h3>
              <textarea
                className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 resize-none focus:ring-1 focus:ring-primary placeholder-slate-400"
                placeholder="Type your quick notes here..."
              ></textarea>
            </div>
          </div>
        </aside>
      </main>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #475569;
        }
      `}</style>
    </div>
  );
}

