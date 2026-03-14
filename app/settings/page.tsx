"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NotificationPreferencesSection from "@/components/settings/NotificationPreferencesSection";

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    image: string | null;
    profile: {
        phoneNumber?: string;
        address?: string;
        bio?: string;
        specialization?: string;
        hourlyRate?: number;
        qualifications?: string[];
        emergencyContact?: string;
    } | null;
}

export default function UserSettingsPage() {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      bio: "",
      specialization: "",
      hourlyRate: 0,
      emergencyContact: ""
  });

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
      if (user) {
          setFormData({
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              phoneNumber: user.profile?.phoneNumber || "",
              address: user.profile?.address || "",
              bio: user.profile?.bio || "",
              specialization: user.profile?.specialization || "",
              hourlyRate: Number(user.profile?.hourlyRate) || 0,
              emergencyContact: (user.profile as any)?.emergencyContact || ""
          });
      }
  }, [user]);

  const updateMutation = useMutation({
      mutationFn: async (data: any) => {
          const res = await fetch("/api/users/me", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error("Failed to update settings");
          return res.json();
      },
      onSuccess: () => {
          toast.success("Settings saved successfully!");
          queryClient.invalidateQueries({ queryKey: ["user-settings"] });
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      },
      onError: () => {
          toast.error("Failed to save settings.");
      }
  });

  const handleSave = () => {
      updateMutation.mutate({
          firstName: formData.firstName,
          lastName: formData.lastName,
          avatarUrl: user?.avatarUrl, // Maintain current avatar or provide update mechanism
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          bio: formData.bio,
          specialization: formData.specialization,
          hourlyRate: formData.hourlyRate,
          emergencyContact: formData.emergencyContact
      });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased transition-colors duration-200 min-h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark px-4 md:px-6 py-3 z-20 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button 
             onClick={() => setIsMobileMenuOpen(true)}
             className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2 className="hidden sm:block text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              German Virtual School
            </h2>
            <h2 className="sm:hidden text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">GVS</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex items-center gap-3">
             {user && (
                 <>
                    <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {user.role}
                    </p>
                    </div>
                    <div
                    className="h-10 w-10 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700"
                    style={{
                        backgroundImage: `url('${user.image || "https://ui-avatars.com/api/?name=" + user.firstName + "+" + user.lastName}')`,
                    }}
                    ></div>
                </>
             )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden isolate">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
             <motion.aside 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-surface-dark p-4 flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-2xl"
             >
                <div className="mb-6 px-2 flex justify-between items-center">
                   <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                     Settings
                   </h3>
                   <button onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="material-symbols-outlined text-slate-400">close</span>
                   </button>
                </div>
                <div className="flex flex-col gap-1">
                  <Link
                    className="group flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-colors"
                    href="#general"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[20px] fill-1">
                      settings
                    </span>
                    <span className="text-sm font-medium">General</span>
                  </Link>
                  {/* Add more setting links here if expected */}
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      logout
                    </span>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
             </motion.aside>
          </div>
        )}

        {/* Sidebar Navigation */}
        <nav className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-4 md:flex transition-colors duration-200">
          <div className="mb-6 px-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Settings
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            <Link
              className="group flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-colors"
              href="#general"
            >
              <span className="material-symbols-outlined text-[20px] fill-1">
                settings
              </span>
              <span className="text-sm font-medium">General</span>
            </Link>
          </div>
          <div className="mt-auto">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-10 lg:p-14 transition-colors duration-200">
          <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
            {/* Page Heading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                General Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Manage your profile details.
              </p>
            </div>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>

            {/* Section: Personal Info */}
            <section id="general" className="grid gap-6 grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Personal Information
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Update your personal details here.
                </p>
              </div>
              <div className="md:col-span-8">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-4 md:p-6 shadow-sm transition-colors duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        First Name
                      </span>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        type="text"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Last Name
                      </span>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        type="text"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email Address
                      </span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
                          mail
                        </span>
                        <input
                          disabled
                          value={formData.email}
                          className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 pl-11 pr-4 cursor-not-allowed"
                          type="email"
                        />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Phone Number
                      </span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
                          call
                        </span>
                        <input
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-11 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          type="tel"
                        />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Address
                      </span>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        type="text"
                      />
                    </label>

                    {user?.role === 'TEACHER' && (
                      <>
                        <label className="flex flex-col gap-2 md:col-span-2">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Bio
                          </span>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={(e: any) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            rows={3}
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Specialization
                          </span>
                          <input
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            type="text"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Hourly Rate (USD)
                          </span>
                          <input
                            name="hourlyRate"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                            className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            type="number"
                          />
                        </label>
                      </>
                    )}

                    {user?.role === 'STUDENT' && (
                      <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Emergency Contact
                        </span>
                        <input
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          type="text"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-6"></div>

            {/* Section: Notification Preferences */}
            <NotificationPreferencesSection />

            {/* Footer Actions */}
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
              <button 
                onClick={() => router.back()}
                className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
            {/* Bottom padding for scroll */}
            <div className="h-10"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
