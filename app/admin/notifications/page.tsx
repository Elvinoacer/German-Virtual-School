"use client";

import Link from "next/link";

export default function AdminNotificationsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">System Notifications</h1>
        <Link 
          href="/admin/notifications/compose" 
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Compose Broadcast
        </Link>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
        <div className="size-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-slate-400">campaign</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No Broadcast History
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Access the Broadcast Center to send system-wide announcements to students, teachers, or specific courses.
        </p>
        <Link 
          href="/admin/notifications/compose" 
          className="text-primary font-bold hover:underline"
        >
          Go to Broadcast Center
        </Link>
      </div>
    </div>
  );
}
