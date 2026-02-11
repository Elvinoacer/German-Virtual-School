"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import Link from "next/link";

export default function ClassroomPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { data: authSession, status } = useSession();

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate session access
  useEffect(() => {
    if (status === "loading") return;
    if (!authSession) {
      router.push("/login");
      return;
    }

    const validateSession = async () => {
      try {
        const res = await axiosInstance.get(`/sessions/${sessionId}`);
        setSessionData(res.data.data);
      } catch (err: any) {
        const msg = err.response?.data?.error?.message || err.response?.data?.error || "Failed to load session";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [sessionId, authSession, status, router]);

  const user = authSession?.user as any;
  const displayName = user
    ? `${user.firstName || ""}${user.lastName ? " " + user.lastName : ""}`.trim() || user.name || "Participant"
    : "Participant";

  // Determine exit route based on role
  const exitRoute = user?.role === "TEACHER"
    ? "/teacher/calendar"
    : user?.role === "ADMIN"
    ? "/admin/dashboard"
    : "/student/dashboard";

  // Build Jitsi direct URL with config params
  const courseTitle = sessionData?.course?.title?.replace(/\s+/g, "-") || "class";
  const roomName = `gvsv2-${courseTitle}-${sessionId}`;
  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si";

  const jitsiParams = new URLSearchParams({
    "config.startWithAudioMuted": "true",
    "config.startWithVideoMuted": "true",
    "config.prejoinPageEnabled": "true",
    "config.disableDeepLinking": "true",
    "config.hideConferenceSubject": "false",
    "config.hideConferenceTimer": "false",
    "config.enableInsecureRoomNameWarning": "false",
    "config.p2p.enabled": "false",
    "config.disableInviteFunctions": "true",
    "config.channelLastN": "5",
    "config.resolution": "480",
    "interfaceConfig.SHOW_JITSI_WATERMARK": "false",
    "interfaceConfig.SHOW_WATERMARK_FOR_GUESTS": "false",
    "interfaceConfig.HIDE_INVITE_MORE_HEADER": "true",
    "interfaceConfig.MOBILE_APP_PROMO": "false",
    "interfaceConfig.APP_NAME": "GVS Classroom",
    "userInfo.displayName": displayName,
    "lang": "en",
  });

  if (sessionData?.title) {
    jitsiParams.set("config.subject", sessionData.title);
  }

  const jitsiUrl = `https://${jitsiDomain}/${roomName}#${jitsiParams.toString()}`;

  // Loading state
  if (loading || status === "loading") {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-[#0b0f1a] text-white gap-6">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold">Preparing Classroom...</h2>
          <p className="text-sm text-slate-400 mt-1">Validating your access</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-[#0b0f1a] text-white gap-6 px-4">
        <div className="size-20 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <svg className="size-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
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

  const teacher = sessionData?.teacher;

  // Classroom launch page
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-[#0b0f1a] text-white px-4">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Classroom icon */}
        <div className="flex justify-center">
          <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center ring-4 ring-primary/20">
            <svg className="size-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
        </div>

        {/* Session details */}
        <div>
          <h1 className="text-3xl font-black tracking-tight">{sessionData?.title || "Classroom"}</h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            {sessionData?.course?.title} • {sessionData?.course?.level} Level
          </p>
          <p className="text-slate-500 text-xs mt-3">
            Hosted by{" "}
            <span className="text-slate-300 font-semibold">
              {teacher?.firstName} {teacher?.lastName}
            </span>
            {" "}• Class Session
          </p>
        </div>

        {/* Info card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-left">
          <div className="flex items-center gap-3 text-sm">
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="size-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="text-slate-300">Joining as <strong className="text-white">{displayName}</strong></span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="size-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-slate-300">
              {sessionData?.isModerator
                ? <span className="text-amber-400 font-semibold">You have moderator access</span>
                : "Secure classroom"
              }
            </span>
          </div>
          {sessionData?.attendance?.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <svg className="size-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <span className="text-slate-300">
                {sessionData.attendance.length} student{sessionData.attendance.length !== 1 ? "s" : ""} enrolled
              </span>
            </div>
          )}
        </div>

        {/* Join button */}
        <a
          href={jitsiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
        >
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Join Classroom
          <svg className="size-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>

        <p className="text-slate-500 text-xs">
          Classroom opens in a new tab on Jitsi Meet. The teacher who created the session is the moderator.
        </p>

        {/* Back link */}
        <button
          onClick={() => router.push(exitRoute)}
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}