
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { deleteAndUnregisterToken } from "@/lib/firebase-client";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useNotifications";

export default function TeacherSidebar({ mobileOpen, desktopCollapsed, onMobileClose }: { mobileOpen: boolean; desktopCollapsed: boolean; onMobileClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count: unreadCount } = useUnreadCount();
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Delete FCM token before logout to prevent notifications going to wrong user
      await deleteAndUnregisterToken();
    } catch (err) {
      console.error("[Logout] Failed to delete FCM token:", err);
    }
    signOut({ callbackUrl: '/login' });
  };


  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-card-light dark:bg-card-dark transition-all duration-300 ${
        desktopCollapsed ? "lg:w-[88px]" : "lg:w-64"
      } w-64 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className={`p-4 pb-2 shrink-0 ${desktopCollapsed ? 'lg:px-2 lg:justify-center' : ''}`}>
        <div className="flex gap-3 items-center mb-4 justify-between">
          <Link href="/" className="flex gap-3 items-center">
            <img src="/gvs-logo.png" alt="GVS Logo" className="h-10 w-auto dark:brightness-0 dark:invert shrink-0" />
            <div className={`flex flex-col transition-all duration-300 ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none whitespace-nowrap">
                GVS Platform
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-normal mt-1 whitespace-nowrap">
                Instructor Portal
              </p>
            </div>
          </Link>
          <button className="lg:hidden text-slate-500 hover:text-primary" onClick={onMobileClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto thin-scrollbar py-2 bg-slate-50/50 dark:bg-slate-900/20 shadow-inner">
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/teacher/dashboard")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
             ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "Dashboard" : undefined}
          href="/teacher/dashboard"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span
            className={`material-symbols-outlined shrink-0 ${
              isActive("/teacher/dashboard") ? "fill" : ""
            }`}
          >
            dashboard
          </span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            Dashboard
          </span>
        </Link>
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/teacher/courses")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
              ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "My Courses" : undefined}
          href="/teacher/courses"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span className="material-symbols-outlined shrink-0">book_2</span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            My Courses
          </span>
        </Link>
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/teacher/assignments")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
               ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "Assignments" : undefined}
          href="/teacher/assignments"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span className="material-symbols-outlined shrink-0">assignment</span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            Assignments
          </span>
        </Link>
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/teacher/students")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
               ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "Students" : undefined}
          href="/teacher/students"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span className="material-symbols-outlined shrink-0">groups</span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            Students
          </span>
        </Link>
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/teacher/calendar")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
               ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "Calendar" : undefined}
          href="/teacher/calendar"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span className="material-symbols-outlined shrink-0">calendar_month</span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            Calendar
          </span>
        </Link>
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/teacher/grading")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
               ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "Grading" : undefined}
          href="/teacher/grading"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span className="material-symbols-outlined shrink-0">
            assignment_turned_in
          </span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            Grading
          </span>
        </Link>
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/messages")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
               ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "Messages" : undefined}
          href="/messages"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span className="material-symbols-outlined shrink-0">chat</span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            Messages
          </span>
        </Link>
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/forum")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
               ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "Forum" : undefined}
          href="/forum"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span className="material-symbols-outlined shrink-0">forum</span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            Forum
          </span>
        </Link>
        <Link
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative
            ${isActive("/channels")
              ? "bg-primary/10 text-primary"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
               ${desktopCollapsed ? 'lg:justify-center' : ''}
          `}
          title={desktopCollapsed ? "Channels" : undefined}
          href="/channels"
          onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
        >
          <span className="material-symbols-outlined shrink-0">diversity_3</span>
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            Channels
          </span>
        </Link>

      </nav>

      {/* Bottom Section - Fixed */}
      <div className="flex flex-col border-t border-slate-200 dark:border-slate-800 shrink-0 bg-card-light dark:bg-card-dark">
        <button 
          onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
          className={`flex items-center justify-between p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-full ${desktopCollapsed ? 'hidden' : ''}`}
        >
          <span>Account & Settings</span>
          <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isBottomCollapsed ? '' : 'rotate-180'}`}>expand_more</span>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1 ${isBottomCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100 p-2 pb-4'}`}>
          <Link
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative
              ${isActive("/notifications")
                ? "bg-primary/10 text-primary"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
                ${desktopCollapsed ? 'lg:justify-center' : ''}
            `}
            title={desktopCollapsed ? "Notifications" : undefined}
            href="/notifications"
            onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
          >
            <div className="relative shrink-0">
               <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-[#1a202c]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                  )}
            </div>
            <span className={`text-sm font-medium flex-1 transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
              Notifications
            </span>
          </Link>
          
          <Link
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative
              ${isActive("/settings")
                ? "bg-primary/10 text-primary"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}
                ${desktopCollapsed ? 'lg:justify-center' : ''}
            `}
            title={desktopCollapsed ? "Settings" : undefined}
            href="/settings"
            onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
          >
            <span className="material-symbols-outlined shrink-0">settings</span>
            <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
              Settings
            </span>
          </Link>
          
          <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-1"></div>

          <div className={`flex items-center gap-3 px-3 py-2 ${desktopCollapsed ? 'lg:justify-center' : ''}`}>
            <div
              className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-center bg-cover shrink-0 flex items-center justify-center"
              data-alt="Profile picture"
              style={{
                backgroundImage: user?.image ? `url('${user.image}')` : undefined,
              }}
            >
              {!user?.image && (
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              )}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${desktopCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.role || 'Teacher'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Log Out"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left disabled:opacity-50
              ${desktopCollapsed ? 'lg:justify-center' : ''}`}
          >
            <span className="material-symbols-outlined shrink-0">{isLoggingOut ? 'sync' : 'logout'}</span>
            <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${desktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

