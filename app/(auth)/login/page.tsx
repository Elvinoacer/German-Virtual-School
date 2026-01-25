"use client";

import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import LanguageSelector from '@/components/auth/LanguageSelector';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-200">
      {/* Left Section: Hero Image (Desktop only) */}
      <div className="hidden lg:block w-1/2 relative bg-primary/5">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUcAWLnWzv0ACPJJoYUFVj65RVbewO_g_fbawHYz3p2rdg0u931RHluwggn6fpvK3IQMqXuSYmIMgNxJFZ6_iA1Qkb3yhcn7oc1yt3omC4Hibf4oBQFj8lNcv2j7oW5Hd8w5LLq4Qg_Ngd8Czj2pyGL66VJpOUrjSjEDv2xrsrG0XhBN94h0f6GEgxwBCDqW3fzDb3aaTZ3_VWQlOu3tHBwd5aZUXd7yTkV2manY4LHf_8i7ZmllQ6ut-FHkT6AkdHgDceHCGjPlg')",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 mix-blend-multiply"></div>

        {/* Content Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute inset-0 flex flex-col justify-between p-16 z-10"
        >
          <Link href="/" className="flex items-center gap-3 text-white">
            <img src="/gvs-logo.png" alt="GVS Logo" className="h-10 w-auto brightness-0 invert" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight font-display">
                German Virtual School
              </span>
              <span className="text-[10px] opacity-80 uppercase tracking-widest font-sans">
                Excellence in German Education
              </span>
            </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white max-w-lg"
          >
            <h2 className="text-4xl font-bold leading-tight mb-4 font-display">
              Master the German language from anywhere.
            </h2>
            <p className="text-lg opacity-90 font-light">
            Experience world-class education through immersive, high-performance virtual classrooms.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Section: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-background-light dark:bg-background-dark">
        {/* Top Navigation (Mobile Logo + Language Toggle) */}
        <div className="flex items-center justify-between p-4 lg:p-6 lg:justify-end">
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <img src="/gvs-logo.png" alt="GVS Logo" className="h-8 w-auto dark:brightness-0 dark:invert" />
            <span className="font-bold text-lg font-display text-primary dark:text-white">GVS</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No account?
              </span>
              <Link href="/register">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary/10 hover:bg-primary/20 text-primary dark:text-white dark:bg-primary/20 dark:hover:bg-primary/30 text-sm font-bold leading-normal transition-colors">
                  <span className="truncate">Register</span>
                </button>
              </Link>
            </div>
            {/* Language Selector */}
            <LanguageSelector />
          </div>
        </div>

        {/* Login Container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-12 md:px-20 lg:px-24 xl:px-32 py-8">
          <div className="w-full max-w-[440px] space-y-8">
            {/* Headings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight font-display">
                Guten Tag!
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Please enter your details to access your classroom.
              </p>
            </motion.div>

            {/* Form */}
            <Suspense fallback={<div>Loading...</div>}>
              <LoginForm />
            </Suspense>

            {/* Footer Links */}
            <div className="pt-8 flex justify-center gap-6 text-xs font-medium text-gray-400 dark:text-gray-500 font-sans border-t border-gray-100 dark:border-gray-800">
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Material Symbols Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
