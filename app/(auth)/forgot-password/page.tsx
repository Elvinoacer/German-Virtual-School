"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
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
          <button className="hidden sm:flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-border-dark hover:bg-[#e7ebf3] dark:hover:bg-[#374151] text-text-main dark:text-text-dark-main text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
            <span className="truncate">Contact Support</span>
          </button>
          <button className="sm:hidden flex items-center justify-center size-10 rounded-full hover:bg-background-light dark:hover:bg-border-dark text-text-main dark:text-text-dark-main">
            <span className="material-symbols-outlined">help</span>
          </button>
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
            {/* Icon & Header */}
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
                Forgot Password?
              </h1>
              <p className="mt-3 text-base text-text-subtle dark:text-text-dark-subtle leading-relaxed">
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const email = formData.get("email");
                
                setIsLoading(true);
                setMessage({ type: '', text: '' });
                
                try {
                   await axios.post('/api/auth/forgot-password', { email });
                   setMessage({ type: 'success', text: 'If an account exists with this email, you will receive a reset link shortly.' });
                } catch (err) {
                   setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
                } finally {
                   setIsLoading(false);
                }
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold leading-6 text-text-main dark:text-text-dark-main"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span
                      className="material-symbols-outlined text-text-subtle dark:text-text-dark-subtle"
                      style={{ fontSize: "20px" }}
                    >
                      mail
                    </span>
                  </div>
                  <input
                    className="block w-full rounded-lg border-0 py-3 pl-10 text-text-main dark:text-text-dark-main shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-[#151b26] sm:text-sm sm:leading-6 transition-all"
                    id="email"
                    name="email"
                    placeholder="name@school.de"
                    required
                    type="email"
                  />
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
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark text-center">
              <p className="text-sm text-text-subtle dark:text-text-dark-subtle">
                Remember your password?
                <Link
                  className="font-bold text-primary hover:text-primary-hover dark:text-blue-400 dark:hover:text-blue-300 ml-1 transition-colors"
                  href="/login"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Contextual Help */}
          <div className="mt-8 text-center">
            <Link
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-subtle dark:text-text-dark-subtle hover:text-text-main dark:hover:text-white transition-colors"
              href="/"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                arrow_back
              </span>
              Back to Home
            </Link>
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
