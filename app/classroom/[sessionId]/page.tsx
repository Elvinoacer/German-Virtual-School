"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";

interface SessionData {
  id: string;
  title: string;
  startTime: string;
  status: string;
  course: {
    title: string;
    level: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    image: string | null;
  };
  attendance: {
    status: string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      image: string | null;
    };
  }[];
}

export default function LiveSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [showJoiningModal, setShowJoiningModal] = useState(true);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  const { data: session, isLoading, error } = useQuery<SessionData>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "Failed to fetch session");
      }
      const json = await res.json();
      return json.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (session && sessionData?.user && !jitsiApi && jitsiContainerRef.current) {
      // Load Jitsi script
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        const domain = "meet.jit.si";
        const options = {
          roomName: `gvsv2-${session.course.title.replace(/\s+/g, '-')}-${session.id}`,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: `${sessionData.user.firstName} ${sessionData.user.lastName}`,
            email: sessionData.user.email,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            disableModeratorIndicator: false,
            enableEmailInStats: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            TILE_VIEW_MAX_COLUMNS: 8,
          },
        };
        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        setJitsiApi(api);

        // Add Event Listeners
        api.addEventListener('videoConferenceJoined', async () => {
          try {
            await axios.post(`/api/sessions/${sessionId}/check-in`);
          } catch (err) {
            console.error('Failed to log check-in:', err);
          }
        });

        api.addEventListener('videoConferenceLeft', async () => {
          try {
            await axios.post(`/api/sessions/${sessionId}/check-out`);
          } catch (err) {
            console.error('Failed to log check-out:', err);
          }
        });

        api.addEventListener('recordingLinkAvailable', async (event: any) => {
          try {
            await axios.patch(`/api/sessions/${sessionId}`, {
              recordingUrl: event.link
            });
            toast.success("Meeting recording saved successfully!");
          } catch (err) {
            console.error('Failed to save recording link:', err);
          }
        });
        
        // Mark as joined after Jitsi is ready
        setTimeout(() => setShowJoiningModal(false), 2000);
      };
      document.body.appendChild(script);

      return () => {
        if (jitsiApi) jitsiApi.dispose();
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [session, sessionData]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111722] text-white flex-col gap-4 text-center p-6">
        <span className="material-symbols-outlined text-6xl text-red-500">error</span>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-[#92a4c9] max-w-md">{(error as Error).message || "You do not have permission to join this session."}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const participants = session?.attendance.map(a => a.student) || [];
  const teacher = session?.teacher;
  const currentUser = sessionData?.user;

  return (
    <div className="bg-background-dark text-white font-display overflow-hidden h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#232f48] bg-[#111722] px-4 md:px-6 py-3 shrink-0 h-14 md:h-16 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 bg-primary rounded-lg text-white">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight hidden sm:block">
              GVS Classroom
            </h2>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 bg-[#232f48] px-4 py-1.5 rounded-full border border-white/5">
          <span className={`w-2 h-2 rounded-full ${session?.status === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
          <span className="text-sm font-medium text-white/90 truncate max-w-[200px]">
            {session?.title || "Connecting..."}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[#92a4c9] text-xs">
            <span className="material-symbols-outlined text-green-500 text-[18px]">wifi</span>
            <span>Secure</span>
          </div>
          <div className="h-6 w-px bg-[#232f48] hidden md:block"></div>
          <Link href="/student/dashboard">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">logout</span>
              Exit
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Stage Area */}
        <div className="flex-1 flex flex-col relative bg-black">
          <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>

        {/* Sidebar (Optional info) */}
        <aside className="w-80 bg-[#111722] border-l border-[#232f48] flex flex-col shrink-0 z-10 hidden xl:flex">
          <div className="p-6 border-b border-[#232f48]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Course Info</h3>
            <p className="text-lg font-bold text-white mb-1">{session?.course.title}</p>
            <p className="text-sm text-primary font-medium">{session?.course.level} Level</p>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Instructor</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {teacher?.firstName[0]}{teacher?.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{teacher?.firstName} {teacher?.lastName}</p>
                <p className="text-xs text-slate-500">Host</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Session Validation Loader Modal */}
      {(showJoiningModal || isLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1520] backdrop-blur-md">
          <div className="w-full max-w-md flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="size-24 rounded-3xl bg-primary/10 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-primary text-5xl animate-pulse">security</span>
              </div>
              <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2.5rem] animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-white text-2xl font-bold tracking-tight">
                {isLoading ? "Validating Session..." : "Initializing Jitsi..."}
              </h3>
              <p className="text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                We're setting up your secure encrypted connection to the classroom.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}