"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AdminMeeting {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  audience: string;
  status: string;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  _count: { invitees: number };
}

const AUDIENCE_OPTIONS = [
  { value: "ALL_USERS", label: "All Users", icon: "groups", desc: "Every student, teacher, and admin" },
  { value: "ALL_STUDENTS", label: "All Students", icon: "school", desc: "All enrolled students" },
  { value: "ALL_TEACHERS", label: "All Teachers", icon: "person_search", desc: "All teachers" },
  { value: "SPECIFIC_STUDENTS", label: "Specific Students", icon: "person_pin", desc: "Select individual students" },
  { value: "SPECIFIC_TEACHERS", label: "Specific Teachers", icon: "supervisor_account", desc: "Select individual teachers" },
] as const;

export default function AdminMeetingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("ALL_USERS");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users for specific audience
  const targetRole = audience === "SPECIFIC_STUDENTS" ? "STUDENT" : audience === "SPECIFIC_TEACHERS" ? "TEACHER" : null;
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users-for-meeting", targetRole],
    queryFn: async () => {
      const endpoint = targetRole === "STUDENT" ? "students" : "teachers";
      const res = await axiosInstance.get(`/admin/${endpoint}`);
      // APIs return { data: { students: [...] } } or { data: { teachers: [...] } }
      const data = res.data.data;
      if (targetRole === "STUDENT") {
        return data?.students || [];
      } else {
        return data?.teachers || [];
      }
    },
    enabled: !!targetRole,
  });

  // Fetch meeting history
  const { data: meetings = [], refetch: refetchMeetings } = useQuery<AdminMeeting[]>({
    queryKey: ["admin-meetings"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/meetings");
      return res.data.data || [];
    },
  });

  const filteredUsers = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName} ${u.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post("/admin/meetings", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Meeting created successfully!");
      setTitle("");
      setDescription("");
      setAudience("ALL_USERS");
      setStartTime("");
      setEndTime("");
      setSelectedUserIds([]);
      refetchMeetings();
      setActiveTab("history");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Failed to create meeting");
    },
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`/admin/meetings/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Meeting deleted successfully");
      refetchMeetings();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Failed to delete meeting");
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete(`/admin/meetings?confirm=true`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Meeting history cleared");
      refetchMeetings();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Failed to clear history");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !audience || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      title,
      description,
      audience,
      startTime,
      endTime,
      inviteeIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
    });
  };

  const audienceLabel = (val: string) =>
    AUDIENCE_OPTIONS.find((a) => a.value === val)?.label || val;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Broadcast Meetings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and broadcast live meetings to students or teachers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "create"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span className="material-symbols-outlined text-lg align-middle mr-1">add_circle</span>
          Create Meeting
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "history"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span className="material-symbols-outlined text-lg align-middle mr-1">history</span>
          History ({meetings.length})
        </button>
      </div>

      {/* Create Meeting Form */}
      {activeTab === "create" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Meeting Details
            </h3>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Meeting Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monthly All-Hands Meeting"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Meeting agenda and notes..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Audience Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">group_add</span>
              Target Audience
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUDIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setAudience(opt.value);
                    setSelectedUserIds([]);
                  }}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    audience === opt.value
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                      audience === opt.value
                        ? "bg-primary text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    <span className="material-symbols-outlined">{opt.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {opt.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* User Picker for Specific Audiences */}
            {(audience === "SPECIFIC_STUDENTS" || audience === "SPECIFIC_TEACHERS") && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Select {audience === "SPECIFIC_STUDENTS" ? "Students" : "Teachers"} ({selectedUserIds.length} selected)
                  </p>
                  {selectedUserIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedUserIds([])}
                      className="text-xs text-red-500 hover:text-red-600 font-bold"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm"
                />
                <div className="max-h-60 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-700 rounded-xl p-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-4">No users found</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                          selectedUserIds.includes(user.id)
                            ? "bg-primary/5 dark:bg-primary/10"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {createMutation.isPending ? (
              <>
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Meeting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">video_call</span>
                Create & Broadcast Meeting
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            Meeting will be hosted via the integrated Jitsi platform. All selected participants will receive notifications.
          </p>
        </form>
      )}

      {/* Meeting History */}
      {activeTab === "history" && (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
             {meetings.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear ALL meeting history? This cannot be undone.")) {
                      clearHistoryMutation.mutate();
                    }
                  }}
                  disabled={clearHistoryMutation.isPending}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  {clearHistoryMutation.isPending ? (
                     <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
                  )}
                  Clear History
                </button>
             )}
            </div>

          {meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">videocam_off</span>
              </div>
              <h3 className="text-lg font-bold text-slate-500">No Meetings Yet</h3>
              <p className="text-sm text-slate-400 mt-1">
                Create your first broadcast meeting to get started.
              </p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">video_call</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {meeting.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {format(new Date(meeting.startTime), "MMM d, h:mm a")}
                    </span>
                    <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                      {audienceLabel(meeting.audience)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      meeting.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : meeting.status === "LIVE"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {meeting.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                    href={`/meeting/${meeting.id}`}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                    <span className="material-symbols-outlined text-lg">videocam</span>
                    Join
                    </Link>
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this meeting?")) {
                                deleteMeetingMutation.mutate(meeting.id);
                            }
                        }}
                        disabled={deleteMeetingMutation.isPending}
                        className="size-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors dark:bg-slate-800 dark:hover:bg-red-900/20"
                        title="Delete Meeting"
                    >
                         {deleteMeetingMutation.isPending && deleteMeetingMutation.variables === meeting.id ? ( // This check might need adjustment if react-query doesn't expose variables easily in map, but usually isPending is global for mutation. Better to track deleting Id separately or acceptable UX for now to disable all or just look spinning.
                            <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                         ) : (
                            <span className="material-symbols-outlined">delete</span>
                         )}
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
