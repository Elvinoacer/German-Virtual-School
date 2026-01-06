"use client";

import Link from "next/link";
import { useUnreadCount } from "@/hooks/useNotifications";

interface NotificationIconProps {
  className?: string;
}

export default function NotificationIcon({ className = "" }: NotificationIconProps) {
  const { count, isLoading } = useUnreadCount();

  return (
    <Link
      href="/notifications"
      className={`relative flex items-center justify-center transition-colors ${className}`}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
    >
      <span className="material-symbols-outlined">notifications</span>
      {!isLoading && count > 0 && (
        <span className="absolute -top-1 -right-1 size-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-[#1a202c]">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
