"use client";

import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display">
      {/* Material Symbols */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Navigation Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 bg-white dark:bg-[#101622] px-4 lg:px-10 py-4 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/gvs-logo.png"
            alt="GVS Logo"
            className="h-10 w-auto dark:brightness-0 dark:invert"
          />
          <div className="flex flex-col">
            <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              German Virtual School
            </h2>
            <span className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 font-sans uppercase tracking-widest">
              Excellence in German Education
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400">
            Already have an account?
          </span>
          <Link href="/login">
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary/10 hover:bg-primary/20 text-primary dark:text-white dark:bg-primary/20 dark:hover:bg-primary/30 text-sm font-bold leading-normal transition-colors">
              <span className="truncate">Login</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content Split Layout */}
      <main className="flex flex-1 w-full h-full">
        {/* Left Side: Registration Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 py-8 lg:px-20 lg:py-12 bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-[520px] flex flex-col gap-6">
            {/* Header Text */}
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-900 dark:text-white text-2xl lg:text-3xl font-black leading-tight tracking-[-0.033em] lg:text-4xl">
                Create your Account
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                Willkommen! Join the German Virtual School today and access
                secure, scalable education online.
              </p>
            </div>

            {/* The Form Component */}
            <RegisterForm />

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed font-sans">
              By creating an account, you agree to our{" "}
              <br className="sm:hidden" />
              <Link
                href="/terms"
                className="text-primary hover:underline font-bold"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:underline font-bold"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Right Side: Visual Image */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-200 dark:bg-gray-800">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA3HdvC9V0Tu6ALGzpthbuXqz6oxq4_B38yAR6cNJtBAutoMltYWcGtaBDBvFz0Hp8K4ovMihyj_gH6eFC0xmnq-ISpgQj_kCh5p8U8l5rGPo9ovLGIIVBaz3DZEeJYZKZfms-opQ8YNNKkXWzwC-0K0HDAY_5xbyUCiZNQI6teHspZvdmkkrP3EO7tO9u77LvtAi-34muC-Oof6_LACUoCmo8i7zTf0yO3KsH8hIkMmFbT6hjzWejtI5cHnHr1jNUkeYgI39A71jM')",
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-12 text-white z-10">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider mb-4">
                <span className="material-symbols-outlined text-[16px]">
                  verified_user
                </span>
                Secure Platform
              </div>
              <h3 className="text-3xl font-bold mb-3 leading-tight">
                Master the German language from anywhere.
              </h3>
              <p className="text-lg text-white/90 leading-relaxed">
                Join our founding cohort and help shape the future of virtual
                learning.
              </p>

              {/* Feature Tags */}
              <div className="flex gap-3 mt-6">
                <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                  <span className="material-symbols-outlined text-[18px]">
                    language
                  </span>
                  <span>Qualified Instructors</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                  <span className="material-symbols-outlined text-[18px]">
                    schedule
                  </span>
                  <span>Flexible Schedule</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
