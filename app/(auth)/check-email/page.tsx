"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

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
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 mb-8">
            <span className="material-symbols-outlined text-5xl">mark_email_read</span>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border-2 border-green-500/30"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Check Your Email
            </h1>
            <p className="text-slate-500">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-primary break-all">
              {email}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left">
            <p>
              Please check your inbox and click the verification link to activate your account.
              The link will expire in 24 hours.
            </p>
            <p className="mt-4 text-slate-400 text-xs">
              Didn't receive the email? Check your spam folder or try registering again.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link href="/login">
              <button className="w-full h-11 flex items-center justify-center gap-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-[20px]">login</span>
                Go to Login
              </button>
            </Link>
            
            <Link href="/register">
              <button className="w-full h-11 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to Register
              </button>
            </Link>
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

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
