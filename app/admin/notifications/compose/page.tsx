
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
}

export default function ComposeNotificationPage() {
  const router = useRouter();
  const [target, setTarget] = useState<"ALL_USERS" | "ALL_STUDENTS" | "ALL_TEACHERS" | "COURSE_STUDENTS">("ALL_STUDENTS");
  const [courseId, setCourseId] = useState("");
  const [type, setType] = useState("INFO");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/courses");
      return res.data.data; // Assuming API returns { data: [...] }
    },
    enabled: target === "COURSE_STUDENTS",
  });

  const broadcastMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post("/api/admin/notifications/broadcast", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Broadcast sent successfully");
      router.push("/admin/notifications");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send broadcast");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !message) {
      toast.error("Title and message are required");
      return;
    }

    if (target === "COURSE_STUDENTS" && !courseId) {
      toast.error("Please select a course");
      return;
    }

    broadcastMutation.mutate({
      target,
      courseId: target === "COURSE_STUDENTS" ? courseId : undefined,
      type,
      title,
      message,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background-dark/50 p-4 md:p-6 lg:p-10 font-display transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="size-10 rounded-full bg-white dark:bg-card-dark border border-slate-200 dark:border-gray-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all shadow-sm group"
              >
                <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              </Link>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Broadcast Center</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Create and distribute system-wide announcements</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
               Admin Exclusive
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 md:p-10 border border-slate-200/60 dark:border-gray-800/60 shadow-2xl shadow-slate-200/20 dark:shadow-none">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Target Audience Selection Cards */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="size-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Select Audience</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "ALL_USERS", label: "Everyone", icon: "groups_3", color: "blue" },
                      { id: "ALL_STUDENTS", label: "Students", icon: "school", color: "indigo" },
                      { id: "ALL_TEACHERS", label: "Teachers", icon: "person_search", color: "purple" },
                      { id: "COURSE_STUDENTS", label: "Course", icon: "bookmarks", color: "orange" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTarget(opt.id as any)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-[20px] border transition-all duration-300 ${
                          target === opt.id
                            ? `border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary`
                            : "border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 hover:border-slate-200 dark:hover:border-gray-700"
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl ${target === opt.id ? 'text-primary scale-110' : 'text-slate-400'} transition-all`}>
                          {opt.icon}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${target === opt.id ? 'text-primary' : 'text-slate-500'}`}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {target === "COURSE_STUDENTS" && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                      >
                        <option value="">-- Choose Target Course --</option>
                        {courses?.map((course) => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100 dark:bg-gray-800 w-full"></div>

                {/* 2. Notification Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="size-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Message Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Broadcast Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Important Security Update"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:font-normal"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Alert Level</label>
                      <div className="relative">
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full appearance-none px-5 py-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        >
                          <option value="INFO">Information</option>
                          <option value="WARNING">Warning</option>
                          <option value="SUCCESS">Success Alert</option>
                          <option value="ERROR">Critical Issue</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Broadcast Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter the detailed announcement content here..."
                      rows={6}
                      className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed transition-all"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={broadcastMutation.isPending}
                    className="w-full py-5 bg-primary hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:grayscale flex items-center justify-center gap-3 group"
                  >
                    {broadcastMutation.isPending ? (
                      <span className="size-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5">send</span>
                        TRANSMIT BROADCAST
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5 sticky top-32 hidden lg:block">
             <div className="space-y-6">
               <div className="flex items-center gap-2 px-1">
                  <span className="material-symbols-outlined text-primary">visibility</span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Live Preview</h3>
               </div>
               
               <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-primary/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="material-symbols-outlined text-9xl">campaign</span>
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                        type === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        type === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                        type === 'SUCCESS' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}>
                        {type} Notification
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">In-App Preview</span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xl font-black leading-tight">
                        {title || "Broadcast Title Placeholder"}
                      </h4>
                      <p className="text-slate-400 text-sm leading-relaxed min-h-[100px] whitespace-pre-wrap">
                        {message || "The notification content will appear here in real-time as you compose your message. Make sure your announcements are clear and professional."}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                             <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sent from System Admin</span>
                       </div>
                       <div className="text-[10px] font-bold text-slate-500">
                         {target.replace('_', ' ')}
                       </div>
                    </div>
                  </div>
               </div>

               <div className="p-6 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary text-xl mt-1">info</span>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Broadcasting Tip</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
                      Ensure your title is concise. Broadcasts are sent via in-app notifications and, if configured, push notifications to the selected audience.
                    </p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
