"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    phoneNumber: "",
    address: "",
    emergencyContact: "",
  });

  const completeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await axiosInstance.post("/api/student/complete-profile", data);
      return res.data;
    },
    onSuccess: async () => {
      toast.success("Profile completed successfully!");
      // Update session to reflect onboardingComplete = true
      await updateSession({ onboardingComplete: true });
      // Redirect to verification-status (admin needs to approve)
      router.push("/student/verification-status");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to complete profile";
      toast.error(errorMessage);
      console.error("Profile completion error:", error.response?.data || error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dateOfBirth || !formData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    completeMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/gvs-logo.png" alt="GVS Logo" className="h-16 dark:brightness-0 dark:invert" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please provide the following information to complete your registration
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+254 7XX XXX XXX"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, Country"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Emergency contact phone number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
              <span className="material-symbols-outlined text-blue-500 shrink-0">info</span>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                After completing your profile, an administrator will review and verify your account.
                You&apos;ll receive an email once your account is approved.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={completeMutation.isPending}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {completeMutation.isPending ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Complete Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Need help? Contact us at{" "}
          <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com'}`} className="text-primary hover:underline">
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com'}
          </a>
        </p>
      </div>
    </div>
  );
}
