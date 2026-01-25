"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef } from "react";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    image: string | null;
    isVerified: boolean;
    stats: {
        courses: number;
        attendanceRate: number;
    };
    profile: {
        phoneNumber?: string;
        address?: string;
    } | null;
}

export default function UserProfilePage() {
  const { data: sessionData } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      return json.data;
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setIsUploading(true);
    const toastId = toast.loading("Uploading avatar...");

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      const result = await uploadRes.json();
      const newAvatarUrl = result.data.url;

      // Update profile with new avatar URL
      const updateRes = await fetch("/api/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      });

      if (!updateRes.ok) throw new Error("Failed to update profile");

      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Avatar updated successfully", { id: toastId });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload avatar", { id: toastId });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f1a] gap-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f1a] gap-6 text-center p-6">
        <span className="material-symbols-outlined text-6xl text-slate-300">person_off</span>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">User Not Found</h2>
          <p className="text-slate-500 max-w-xs mx-auto">We couldn't retrieve your profile data. Please try logging in again.</p>
        </div>
        <Link href="/login" className="px-8 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
          Back to Login
        </Link>
      </div>
    );
  }

  const roleLabel = user.role === 'ADMIN' ? 'School Administrator' : user.role === 'TEACHER' ? 'Faculty Member' : 'Language Student';
  const roleColor = user.role === 'ADMIN' ? 'bg-purple-500' : user.role === 'TEACHER' ? 'bg-indigo-500' : 'bg-primary';

  return (
    <div className="bg-slate-50 dark:bg-[#0b0f1a] font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-row transition-colors duration-300 relative overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20 fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Side Navigation (Desktop) */}
      <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-6 sticky top-0 h-screen z-20 transition-all duration-300">
        <div className="space-y-10">
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white text-2xl">school</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black uppercase tracking-tighter leading-none">GVS Online</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Virtual Campus</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { label: 'Dashboard', icon: 'dashboard', href: '/student/dashboard' },
              { label: 'Courses', icon: 'auto_stories', href: '/courses' },
              { label: 'Calendar', icon: 'calendar_today', href: '/calendar' },
              { label: 'Profile', icon: 'account_circle', href: '/profile', active: true },
              { label: 'Settings', icon: 'settings', href: '/settings' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  link.active
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${link.active ? 'fill-1' : ''}`}>
                  {link.icon}
                </span>
                <p className="text-sm font-bold">{link.label}</p>
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all group"
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">logout</span>
            <p className="text-sm font-bold">Log Out</p>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden isolate">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-[#111827] p-6 flex flex-col justify-between shadow-2xl"
           >
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-white text-2xl">school</span>
                        </div>
                        <h1 className="text-sm font-black uppercase tracking-tighter">GVS Online</h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                 </div>
                 <nav className="space-y-2">
                    {[
                      { label: 'Dashboard', icon: 'dashboard', href: '/student/dashboard' },
                      { label: 'Courses', icon: 'auto_stories', href: '/courses' },
                      { label: 'Calendar', icon: 'calendar_today', href: '/calendar' },
                      { label: 'Profile', icon: 'account_circle', href: '/profile', active: true },
                      { label: 'Settings', icon: 'settings', href: '/settings' },
                    ].map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          link.active
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-xl ${link.active ? 'fill-1' : ''}`}>
                          {link.icon}
                        </span>
                        <p className="text-sm font-bold">{link.label}</p>
                      </Link>
                    ))}
                  </nav>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold group"
                >
                    <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">logout</span>
                    Log Out
                </button>
              </div>
           </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 z-10">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-lg">school</span>
            </div>
            <span className="font-black text-xs uppercase tracking-tighter">GVS Online</span>
          </div>
          <button 
             onClick={() => setIsMobileMenuOpen(true)}
             className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6 md:space-y-10">
          
          {/* Page Heading */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Personal <span className="text-primary">Profile</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2">
                <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
                Secure Account Dashboard
              </p>
            </div>
            <Link href="/settings" className="w-full md:w-auto">
              <button className="w-full md:w-auto px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 group text-sm">
                <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-45">edit_square</span>
                MODIFY INFO
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Left Column: Identity Card */}
            <div className="lg:col-span-4 space-y-6 md:space-y-8">
              <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group">
                {/* Accent Circle */}
                <div className={`absolute top-0 right-0 size-24 ${roleColor} opacity-[0.03] rounded-bl-full`}></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative group/avatar mb-6">
                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
                    <div
                      className="size-24 md:size-32 rounded-3xl bg-cover bg-center border-[4px] border-slate-50 dark:border-slate-800 shadow-xl relative z-10 transition-transform duration-500 group-hover/avatar:scale-105"
                      style={{
                        backgroundImage: `url('${user.image || "https://ui-avatars.com/api/?name=" + user.firstName + "+" + user.lastName}')`,
                      }}
                    ></div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/gif"
                      className="hidden"
                    />
                    <button 
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                      className="absolute -bottom-2 -right-2 bg-primary text-white size-8 md:size-10 rounded-xl shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center z-20 group-hover/avatar:translate-y-[-2px] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined text-lg md:text-xl">add_a_photo</span>
                      )}
                    </button>
                  </div>

                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-none">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className={`px-3 py-1 rounded-full ${roleColor}/10 border border-${roleColor}/20 mb-3`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      {roleLabel}
                    </p>
                  </div>
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.15em] mb-8">
                    UID: {user.id.slice(0, 12).toUpperCase()}
                  </p>

                  <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                      <p className="text-lg font-black text-primary mb-0.5">
                        {user.stats.attendanceRate}%
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                      <p className="text-lg font-black text-slate-900 dark:text-white mb-0.5 tracking-tighter">
                        {user.stats.courses}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enrolled</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicator Widget */}
              <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 transition-transform duration-700 group-hover:rotate-45 group-hover:scale-110">
                   <span className="material-symbols-outlined text-8xl">shield_person</span>
                </div>
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="size-9 bg-green-500 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-lg">verified</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Account Status</p>
                      <p className="text-xs font-black uppercase tracking-widest text-green-400">
                        Active Profile
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-bold italic">
                    "Your account status is currently verified. All academic privileges are active."
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Info Sections */}
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
              <section className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden h-fit">
                <div className="px-6 py-6 md:px-8 md:py-8 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                  <div className="size-9 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    Personal Information
                  </h3>
                </div>
                
                <div className="p-6 md:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-10 gap-y-6 md:gap-y-8">
                  {[
                    { label: 'First Name', value: user.firstName, icon: 'badge' },
                    { label: 'Last Name', value: user.lastName, icon: 'badge' },
                    { label: 'Email Address', value: user.email, icon: 'mail', wide: true },
                    { label: 'Phone Number', value: user.profile?.phoneNumber || 'Not provided', icon: 'call' },
                    { label: 'Residential Address', value: user.profile?.address || 'Not provided', icon: 'location_on', wide: true },
                  ].map((field) => (
                    <div key={field.label} className={`space-y-3 ${field.wide ? 'md:col-span-2' : ''} group/field`}>
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 group-hover/field:text-primary transition-colors">
                        {field.label}
                      </span>
                      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent group-hover/field:border-primary/20 transition-all flex items-center gap-3">
                         <span className="material-symbols-outlined text-slate-400 text-lg">{field.icon}</span>
                         <span className="text-slate-900 dark:text-white font-bold text-sm truncate">{field.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 md:px-8 pb-8 md:pb-10">
                   <div className="bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl p-5 border border-blue-500/10 flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                         <span className="material-symbols-outlined text-white text-lg">help_outline</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                        Only you and authorized school administrators can view this detailed information. Your data is protected under GDPR guidelines.
                      </p>
                   </div>
                </div>
              </section>

              {/* Account Security Widget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 flex flex-col gap-4">
                  <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Security Center</h4>
                  <button className="w-fit text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Access Settings →</button>
                </div>
                <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 flex flex-col gap-4">
                  <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-lg">notifications_active</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Notifications</h4>
                  <button className="w-fit text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Manage Prefs →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
