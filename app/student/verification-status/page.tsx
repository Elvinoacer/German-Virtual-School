"use client";

import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerificationStatusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log("[CLIENT DEBUG] VerificationStatusPage render - status:", status, ", session:", JSON.stringify(session?.user, null, 2));

  useEffect(() => {
    console.log("[CLIENT DEBUG] useEffect triggered - status:", status, ", isVerified:", session?.user?.isVerified);
    if (status === "authenticated" && session?.user?.isVerified) {
      console.log("[CLIENT DEBUG] User is verified, redirecting to dashboard");
      router.push("/student/dashboard");
    }
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      console.log("[CLIENT DEBUG] User is unauthenticated, redirecting to login");
      router.push("/login");
    }
  }, [session, status, router]);

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
          {/* Illustration/Icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 mb-8">
            <span className="material-symbols-outlined text-5xl">pending_actions</span>
            <motion.div
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-amber-500"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Account Verification Pending
            </h1>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left">
            <p>
              Thank you for registering! Your account is currently being reviewed by our administration. 
              This process typically takes 24-48 hours.
            </p>
            <p className="mt-4">
              During this time, you will have limited access to the classroom features. Once verified, 
              you will gain full access to your dashboard and courses.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log Out
            </Button>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              Logged in as: {session?.user?.email}
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center text-slate-400">
          Benötigen Sie Hilfe? Erreichen Sie uns unter support@gvs.de
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
