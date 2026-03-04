"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface MarketerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
}

export default function MarketerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [marketer, setMarketer] = useState<MarketerData | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/marketer/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data } = await axios.get("/api/marketer/auth/me");
        if (data.success) {
          setMarketer(data.data);
        } else {
          router.push("/marketer/login");
        }
      } catch {
        router.push("/marketer/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await axios.delete("/api/marketer/auth/me");
    } catch {}
    router.push("/marketer/login");
  };

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/marketer/dashboard" className="flex items-center gap-2">
              <img
                src="/gvs-logo.png"
                alt="GVS Logo"
                className="h-8 w-auto dark:brightness-0 dark:invert"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  GVS Partner Portal
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {marketer && (
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
                {marketer.firstName} {marketer.lastName}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
