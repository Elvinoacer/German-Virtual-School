"use client";

import { useAuth } from "@/hooks/useAuth";
import NotificationIcon from "@/components/shared/NotificationIcon";

export default function TeacherHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark flex-shrink-0 z-10 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button className="text-slate-500 hover:text-primary p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={onMenuClick}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        {/* Only show logo in header on mobile */}
        <div className="flex items-center gap-2 lg:hidden">
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <img src="/gvs-logo.png" alt="GVS Logo" className="h-8 w-auto dark:brightness-0 dark:invert" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                GVS Teacher
            </h2>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <NotificationIcon />
      </div>
    </header>
  );
}
