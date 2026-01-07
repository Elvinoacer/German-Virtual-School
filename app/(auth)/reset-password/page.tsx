"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!token) {
      return (
          <div className="text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
                <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
                  error
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-text-main dark:text-text-dark-main">
                Invalid Link
              </h1>
              <p className="mt-3 text-base text-text-subtle dark:text-text-dark-subtle">
                This password reset link is invalid or missing.
              </p>
              <div className="mt-8">
                <Link
                  className="inline-flex justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
                  href="/forgot-password"
                >
                  Request a new link
                </Link>
              </div>
          </div>
      )
  }

  return (
    <>
        <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary">
            <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px" }}
            >
                lock_reset
            </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main dark:text-text-dark-main">
            Set New Password
            </h1>
            <p className="mt-3 text-base text-text-subtle dark:text-text-dark-subtle leading-relaxed">
            Please enter your new password below.
            </p>
        </div>

        <form
            onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const password = formData.get("password");
            const confirmPassword = formData.get("confirmPassword");

            if (password !== confirmPassword) {
                setMessage({ type: 'error', text: 'Passwords do not match.' });
                return;
            }
            
            setIsLoading(true);
            setMessage({ type: '', text: '' });
            
            try {
                await axios.post('/api/auth/reset-password', { token, password });
                setMessage({ type: 'success', text: 'Password reset successfully!' });
                setTimeout(() => router.push('/login'), 2000);
            } catch (err: any) {
                setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to reset password.' });
            } finally {
                setIsLoading(false);
            }
            }}
            className="space-y-6"
        >
            <div className="space-y-4">
                <div>
                    <label
                        className="block text-sm font-semibold leading-6 text-text-main dark:text-text-dark-main"
                        htmlFor="password"
                    >
                        New Password
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <input
                        className="block w-full rounded-lg border-0 py-3 pl-4 text-text-main dark:text-text-dark-main shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-[#151b26] sm:text-sm sm:leading-6 transition-all"
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        />
                    </div>
                </div>
                <div>
                    <label
                        className="block text-sm font-semibold leading-6 text-text-main dark:text-text-dark-main"
                        htmlFor="confirmPassword"
                    >
                        Confirm Password
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <input
                        className="block w-full rounded-lg border-0 py-3 pl-4 text-text-main dark:text-text-dark-main shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-[#151b26] sm:text-sm sm:leading-6 transition-all"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        />
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {message.text}
                </div>
            )}

            <div>
            <button
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-bold leading-6 text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading || message.type === 'success'}
            >
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            </div>
        </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-text-main dark:text-text-dark-main overflow-x-hidden transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-solid border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3 text-text-main dark:text-text-dark-main cursor-pointer">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                school
              </span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              German Virtual School
            </h2>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
         {/* Background Pattern (Subtle) */}
         <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#135bec 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] relative z-10"
        >
          {/* Card Container */}
          <div className="bg-card-light dark:bg-card-dark shadow-xl rounded-xl border border-border-light dark:border-border-dark p-6 sm:p-10 transition-colors duration-200">
             <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                <ResetPasswordForm />
             </Suspense>
          </div>
        </motion.div>
      </main>

       {/* Simple Footer for copyright */}
       <footer className="py-6 text-center text-xs text-text-subtle dark:text-text-dark-subtle">
        <p>© 2023 German Virtual School. All rights reserved.</p>
      </footer>
    </div>
  );
}
