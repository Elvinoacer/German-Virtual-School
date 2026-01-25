'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { BillingAccessGuard } from '@/components/BillingAccessGuard';
import NotificationIcon from '@/components/shared/NotificationIcon';
import NotificationRegistrar from "@/components/shared/NotificationRegistrar";
import { useUnreadCount } from '@/hooks/useNotifications';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count: unreadCount } = useUnreadCount();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsDesktopCollapsed(!isDesktopCollapsed);
    } else {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  const navItems = [
    { href: '/student/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/student/courses', icon: 'book_2', label: 'My Courses' },
    { href: '/student/grades', icon: 'school', label: 'Grades' },
    { href: '/student/assignments', icon: 'assignment', label: 'Assignments' },
    { href: '/student/schedule', icon: 'calendar_month', label: 'Schedule' },
    { href: '/student/attendance', icon: 'fact_check', label: 'Attendance' },
    { href: '/student/billing', icon: 'payments', label: 'Billing' },
    { href: '/student/reports', icon: 'description', label: 'Reports' },
    { href: '/messages', icon: 'chat', label: 'Messages' },
    { href: '/forum', icon: 'forum', label: 'Forum' },
    { href: '/student/feedback', icon: 'reviews', label: 'Feedback' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark relative">
          {/* Sidebar Overlay */}
          {isMobileOpen && (
            <div 
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside 
            className={`fixed inset-y-0 left-0 z-40 flex flex-col h-full bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 transition-all duration-300
            ${isDesktopCollapsed ? 'md:w-[88px]' : 'md:w-72'} w-72
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
             {/* Logo Section */}
             <div className={`flex items-center gap-3 p-4 ${isDesktopCollapsed ? 'md:justify-center md:px-2' : ''} transition-all`}>
                <Link href="/" className="flex items-center gap-3">
                  <img src="/gvs-logo.png" alt="GVS Logo" className="h-10 w-auto dark:brightness-0 dark:invert shrink-0" />
                  <div className={`flex flex-col transition-all duration-300 ${isDesktopCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
                    <h1 className="text-text-main dark:text-white text-lg font-bold leading-tight whitespace-nowrap">
                      German Virtual
                      <br />
                      School
                    </h1>
                  </div>
                </Link>
                <button className="md:hidden text-text-subtle hover:text-primary transition-colors ml-auto" onClick={() => setIsMobileOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {/* Navigation - Scrollable */}
                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto thin-scrollbar px-4 py-2 bg-slate-50/50 dark:bg-slate-900/20 shadow-inner">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 768) setIsMobileOpen(false);
                      }}
                       title={isDesktopCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative
                        ${isActive(item.href)
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-text-subtle hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'}
                        ${isDesktopCollapsed ? 'md:justify-center' : ''}`}
                    >
                      <span className={`material-symbols-outlined shrink-0 ${isActive(item.href) ? 'filled' : ''}`}>
                        {item.icon}
                      </span>
                      <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </nav>

              {/* Bottom Section - Fixed */}
              <div className="flex flex-col border-t border-gray-200 dark:border-gray-800 shrink-0 bg-card-light dark:bg-card-dark">
                 <button 
                  onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                  className={`flex items-center justify-between p-3 text-xs font-semibold text-text-subtle uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors w-full ${isDesktopCollapsed ? 'hidden' : ''}`}
                 >
                   <span>Account & Settings</span>
                   <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isBottomCollapsed ? '' : 'rotate-180'}`}>expand_more</span>
                 </button>
                 
                <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1 ${isBottomCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100 p-2 pb-4'}`}>
                  <Link
                    href="/notifications"
                    onClick={() => {
                      if (window.innerWidth < 768) setIsMobileOpen(false);
                    }}
                    title="Notifications"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive('/notifications')
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-text-subtle hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'}
                      ${isDesktopCollapsed ? 'justify-center' : ''}`}
                  >
                     <div className="relative shrink-0">
                      <span className="material-symbols-outlined">notifications</span>
                      {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 size-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-[#1a202c]">
                          {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                      )}
                     </div>
                    <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                      Notifications
                    </span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => {
                      if (window.innerWidth < 768) setIsMobileOpen(false);
                    }}
                    title="Settings"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-text-subtle hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary transition-colors
                      ${isDesktopCollapsed ? 'justify-center' : ''}`}
                  >
                    <span className="material-symbols-outlined shrink-0">settings</span>
                    <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                      Settings
                    </span>
                  </Link>
                  <a
                    href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@gvs.edu'}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-text-subtle hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary transition-colors
                      ${isDesktopCollapsed ? 'justify-center' : ''}`}
                     title="Get Support"
                  >
                    <span className="material-symbols-outlined shrink-0">help</span>
                    <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                      Get Support
                    </span>
                  </a>

                  <div className="h-px bg-gray-200 dark:bg-gray-800 w-full my-1"></div>

                  <div className={`flex items-center gap-3 px-3 py-2 ${isDesktopCollapsed ? 'md:justify-center' : ''}`}>
                    <div className="relative shrink-0">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-slate-100 dark:bg-slate-800"
                        style={user?.image ? { backgroundImage: `url('${user.image}')` } : {}}
                      >
                        {!user?.image && (
                          <span className="text-[10px] font-bold text-primary uppercase">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1a202c]"></div>
                    </div>
                    <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
                      <p className="text-sm font-semibold text-text-main dark:text-white truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-text-subtle truncate">{user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    title="Log Out"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left
                      ${isDesktopCollapsed ? 'justify-center' : ''}`}
                  >
                    <span className="material-symbols-outlined shrink-0">logout</span>
                    <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isDesktopCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                      Log Out
                    </span>
                  </button>
                </div>
                
                {/* Always show User Profile or handle when collapsed? 
                    Actually, if bottom is collapsed, maybe we show a condensed row? 
                    For now, the request was "collapse it and open it".
                    If user collapses it, they likely want MORE space for nav.
                    So showing nothing is fine, BUT we need a way to open it back.
                    The button above handles expanding.
                    
                    When desktop is collapsed (mini sidebar), we can't show the text accordion.
                    So we hide the accordion toggler in mini mode and just show icons.
                */}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? 'md:ml-[88px]' : 'md:ml-72'}`}>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-card-light dark:bg-card-dark backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <button 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={toggleSidebar}
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                 {/* Only show logo on mobile, on desktop it's in sidebar */}
                <Link href="/student/dashboard" className="flex md:hidden items-center gap-2">
                  <img src="/gvs-logo.png" alt="GVS Logo" className="h-8 w-auto dark:brightness-0 dark:invert" />
                  <span className="font-bold text-lg">GVS</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <NotificationIcon className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-text-subtle hover:text-primary" />
              </div>
            </header>

            {/* Page Content */}
            <BillingAccessGuard>
              <div className="flex-1 overflow-y-auto thin-scrollbar">
                {children}
              </div>
            </BillingAccessGuard>
          </main>
        </div>
        <NotificationRegistrar />
    </>
  );
}
