"use client";

import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import Link from "next/link";

function VerifyEmailContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  
  // Get email from query params (for just-registered users) or session (for logged-in users)
  const emailFromParams = searchParams.get("email");
  const email = session?.user?.email || emailFromParams;

  useEffect(() => {
    // If already verified and logged in, redirect to appropriate page
    if (status === "authenticated" && session?.user?.emailVerified) {
      if (session.user.role === "STUDENT" && !session.user.isVerified) {
        router.push("/student/verification-status");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("No email address provided");
      return;
    }
    
    setIsResending(true);
    try {
      await axiosInstance.post('/api/auth/resend-verification', {
        email: email
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
            <p className="font-semibold text-primary break-all">
              {email || "your email address"}
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
              disabled={isResending || !email}
              className="w-full h-11 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
            
            {session ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Log Out
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Go to Login
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center text-slate-400">
          Need help? Contact us at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com'}
        </div>
      </motion.div>

      {/* Material Symbols Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
