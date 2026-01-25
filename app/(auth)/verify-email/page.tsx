"use client";

import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

export default function VerifyEmailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // If already verified, redirect to appropriate page
    if (status === "authenticated" && session?.user?.emailVerified) {
      if (session.user.role === "STUDENT" && !session.user.isVerified) {
        router.push("/student/verification-status");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleResendEmail = async () => {
    if (!session?.user?.email) return;
    
    setIsResending(true);
    try {
      await axiosInstance.post('/api/auth/resend-verification', {
        email: session.user.email
      });
      toast.success("Verification email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-6 md:p-8 text-center space-y-6">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 mb-8">
            <span className="material-symbols-outlined text-5xl">mark_email_unread</span>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border-2 border-blue-500/30"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Verify Your Email
            </h1>
            <p className="text-slate-500">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-primary">
              {session?.user?.email}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left">
            <p>
              Please check your inbox and click the verification link to continue.
              The link will expire in 24 hours.
            </p>
            <p className="mt-4 text-slate-400 text-xs">
              Didn't receive the email? Check your spam folder or click below to resend.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full h-11 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log Out
            </Button>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center text-slate-400">
          Need help? Contact us at support@gvs.edu.de
        </div>
      </motion.div>
    </div>
  );
}
