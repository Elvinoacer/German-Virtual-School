"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import NotificationRegistrar from "@/components/shared/NotificationRegistrar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsDesktopCollapsed(!isDesktopCollapsed);
    } else {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden font-display relative">
      <TeacherSidebar 
        mobileOpen={isMobileOpen} 
        desktopCollapsed={isDesktopCollapsed} 
        onMobileClose={() => setIsMobileOpen(false)} 
      />
      <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 ${isDesktopCollapsed ? 'lg:ml-[88px]' : 'lg:ml-64'}`}>
        <TeacherHeader onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark thin-scrollbar">
          {children}
        </main>
      </div>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <NotificationRegistrar />
    </div>
  );
}
