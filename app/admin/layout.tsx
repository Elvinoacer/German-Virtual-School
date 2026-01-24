"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import NotificationIcon from "@/components/shared/NotificationIcon";
import NotificationRegistrar from "@/components/shared/NotificationRegistrar";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const pathname = usePathname();
  const { count: unreadCount } = useUnreadCount();
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user && user.role !== "ADMIN") {
      router.replace("/student/dashboard"); // Or a 403 page
    }
  }, [user, status, router]);

  if (status === "loading" || (user && user.role !== "ADMIN")) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f1a]">
           <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
     )
  }

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsDesktopCollapsed(!isDesktopCollapsed);
    } else {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/students", label: "Students", icon: "school" },
    { href: "/admin/teachers", label: "Teachers", icon: "person_search" },
    { href: "/admin/courses", label: "Courses", icon: "menu_book" },
    { href: "/admin/notifications/compose", label: "Broadcast", icon: "campaign" },
    { href: "/admin/finance", label: "Finance", icon: "payments" },
    { href: "/admin/reports", label: "Reports", icon: "monitoring" },
    { href: "/messages", label: "Messages", icon: "chat" },
    { href: "/forum", label: "Forum", icon: "forum" },
    { href: "/admin/feedback", label: "Testimonials", icon: "reviews" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-row overflow-hidden bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white font-display transition-colors duration-200">
      {/* Sidebar Overlay */}
      {isMobileOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsMobileOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#1a202c] transition-all duration-300 
        ${isDesktopCollapsed ? 'lg:w-[88px]' : 'lg:w-72'} w-72 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className={`flex items-center gap-3 p-4 ${isDesktopCollapsed ? 'justify-center lg:px-2' : ''} transition-all`}>
          <img src="/gvs-logo.png" alt="GVS Logo" className="h-10 w-auto dark:brightness-0 dark:invert shrink-0" />
          <div className={`flex flex-col transition-all duration-300 ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
            <h1 className="text-lg font-bold leading-tight whitespace-nowrap">GVS Admin</h1>
            <p className="text-[#4c669a] text-xs font-normal whitespace-nowrap">
              Virtual Campus
            </p>
          </div>
          {/* Mobile Close Button */}
          <button className="ml-auto lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setIsMobileOpen(false)}>
              <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto thin-scrollbar px-4 py-2 bg-slate-50/50 dark:bg-slate-900/20 shadow-inner">
          {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                  <Link
                  key={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative
                    ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-[#4c669a] hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748]'}
                    ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isDesktopCollapsed ? link.label : undefined}
                  >
                  <span className="material-symbols-outlined text-xl shrink-0">
                      {link.icon}
                  </span>
                  <p className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
                    {link.label}
                  </p>
                  </Link>
              );
          })}
        </nav>

        {/* Bottom Section - Fixed */}
        <div className="flex flex-col gap-0 border-t border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#1a202c]">
           <button 
            onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
            className={`flex items-center justify-between p-3 text-xs font-semibold text-[#4c669a] uppercase tracking-wider hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748] transition-colors w-full ${isDesktopCollapsed ? 'hidden' : ''}`}
           >
             <span>Account & Settings</span>
             <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isBottomCollapsed ? '' : 'rotate-180'}`}>expand_more</span>
           </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1 ${isBottomCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100 p-2 pb-4'}`}>
            <Link
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all 
                ${pathname === '/notifications' ? 'bg-primary text-white' : 'text-[#4c669a] hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748]'}
                ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
              href="/notifications"
              title="Notifications"
            >
              <div className="relative shrink-0">
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-[#1a202c]">
                    {unreadCount > 9 ? '9' : unreadCount}
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
                Notifications
              </p>
            </Link>

            <Link
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all 
                ${pathname === '/admin/settings' ? 'bg-primary text-white' : 'text-[#4c669a] hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748]'}
                ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
              href="/admin/settings"
              title="Settings"
            >
              <span className="material-symbols-outlined text-xl shrink-0">settings</span>
              <p className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
                Settings
              </p>
            </Link>

            <div className="h-px bg-[#e7ebf3] dark:bg-[#2d3748] w-full my-1"></div>

            {/* User Profile */}
            <div className={`flex items-center gap-3 px-3 py-2 ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="relative shrink-0">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 border border-[#e7ebf3] dark:border-[#2d3748] flex items-center justify-center bg-slate-100 dark:bg-slate-800"
                  style={user?.image ? { backgroundImage: `url('${user.image}')` } : {}}
                >
                  {!user?.image && (
                    <span className="text-xs font-bold text-primary">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1a202c]"></div>
              </div>
              <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                <p className="text-sm font-medium text-[#0d121b] dark:text-white truncate">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                </p>
                <p className="text-xs text-[#4c669a] truncate">{user?.email || 'admin@gvs.edu'}</p>
              </div>
            </div>
            
             {/* Logout Button */}
             <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
             >
              <span className="material-symbols-outlined text-xl shrink-0">logout</span>
              <p className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
                Log Out
              </p>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-screen overflow-y-auto bg-background-light dark:bg-background-dark transition-all duration-300 ${isDesktopCollapsed ? "lg:ml-[88px]" : "lg:ml-72"}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e7ebf3] dark:border-[#2d3748] bg-white/90 dark:bg-[#1a202c]/90 backdrop-blur-md px-8 py-4 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={toggleSidebar}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
                Overview
              </h2>
              <p className="text-sm text-[#4c669a]">
                Welcome back, {user?.firstName || 'Administrator'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="hidden md:flex items-center relative w-80">
              <span className="material-symbols-outlined absolute left-3 text-[#9ca3af]">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white focus:ring-2 focus:ring-primary/50 placeholder:text-[#9ca3af] text-sm font-normal transition-shadow"
                placeholder="Search students, classes..."
                type="text"
              />
            </div>
            {/* Icons */}
            <div className="flex items-center gap-3">
              <NotificationIcon className="p-2.5 rounded-xl" />
              <button className="p-2.5 rounded-xl hover:bg-[#f3f4f6] dark:hover:bg-[#2d3748] text-[#4c669a] transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </div>
        </header>

        {children}
      </main>

      <NotificationRegistrar />
    </div>
  );
}
