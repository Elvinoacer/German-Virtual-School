"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const [meetingData, setMeetingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate meeting access
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const validateMeeting = async () => {
      try {
        const res = await axiosInstance.get(`/meetings/${meetingId}`);
        setMeetingData(res.data.data);
      } catch (err: any) {
        const msg = err.response?.data?.error || "Failed to load meeting";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    validateMeeting();
  }, [meetingId, session, status, router]);

  // Initialize Jitsi
  const initJitsi = useCallback(() => {
    if (!jitsiContainerRef.current || !session?.user || !meetingData) return;

    // Clean up previous instance
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }

    const user = session.user as any;
    const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Participant";

    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName: `gvs-meeting-${meetingId}`,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName,
        email: user.email || "",
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        toolbarButtons: [
          "microphone", "camera", "desktop", "chat",
          "raisehand", "participants-pane", "tileview",
          "fullscreen", "hangup", "settings",
        ],
        hideConferenceSubject: false,
        hideConferenceTimer: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: "#0b0f1a",
        TOOLBAR_ALWAYS_VISIBLE: true,
        HIDE_INVITE_MORE_HEADER: true,
        MOBILE_APP_PROMO: false,
      },
    });

    apiRef.current = api;

    api.addEventListener("readyToClose", () => {
      router.back();
    });
  }, [session, meetingData, meetingId, router]);

  // Load Jitsi script and initialize
  useEffect(() => {
    if (!meetingData) return;

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => initJitsi();
    document.body.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      document.body.removeChild(script);
    };
  }, [meetingData, initJitsi]);

  // Loading state
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f1a] text-white gap-6">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold">Joining Meeting...</h2>
          <p className="text-sm text-slate-400 mt-1">Validating your access</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f1a] text-white gap-6 px-4">
        <div className="size-20 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-red-400">error</span>
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0b0f1a] border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              {meetingData?.title || "Meeting"}
            </h1>
            <p className="text-white/40 text-xs">
              Hosted by {meetingData?.createdBy?.firstName} {meetingData?.createdBy?.lastName} • Admin Meeting
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full flex items-center gap-1.5">
            <span className="size-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Jitsi Container */}
      <div ref={jitsiContainerRef} className="flex-1 w-full" style={{ minHeight: "calc(100vh - 60px)" }} />
    </div>
  );
}
