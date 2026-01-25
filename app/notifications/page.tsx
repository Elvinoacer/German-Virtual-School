"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  useNotifications, 
  useMarkAllAsRead, 
  useDeleteAllNotifications, 
  useMarkAsRead, 
  useDeleteNotification,
  type Notification 
} from "@/hooks/useNotifications";
import { useState } from "react";
import { format, parseISO } from "date-fns";

const TYPE_ICONS: Record<string, string> = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  error: "error",
  assignment: "assignment",
  grade: "grade",
  course: "school",
  payment: "payments",
  system: "settings_suggest",
  default: "notifications"
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const dashboardLink = userRole === 'ADMIN' ? '/admin/dashboard' : userRole === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard';

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading, isError } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const deleteAll = useDeleteAllNotifications();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteAll = () => {
    deleteAll.mutate();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
        markAsRead.mutate(notification.id);
    }
    if (notification.data?.link) {
        router.push(notification.data.link);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Notifications</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
                onClick={() => router.push(dashboardLink)}
                className="w-full sm:w-auto justify-center px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                Dashboard
            </button>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markAllAsRead.isPending}
              className="w-full sm:w-auto justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">done_all</span>
              Mark All Read
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={notifications?.length === 0 || deleteAll.isPending}
              className="w-full sm:w-auto justify-center px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
              Delete All
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              filter === "all" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              filter === "unread" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="size-5 flex items-center justify-center bg-white/20 rounded-full text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification List */}
        <div className="flex flex-col gap-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative p-6 rounded-3xl border transition-all cursor-pointer ${
                  notification.isRead 
                    ? "bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    : "bg-primary/5 dark:bg-primary/10 border-primary/30 hover:border-primary/50 shadow-lg shadow-primary/5"
                }`}
              >
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="absolute top-6 right-6 size-3 bg-primary rounded-full animate-pulse"></div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Icon */}
                  <div className={`size-14 flex items-center justify-center rounded-2xl shrink-0 ${
                    notification.isRead 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      : "bg-primary/10 text-primary"
                  }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {TYPE_ICONS[notification.type] || TYPE_ICONS.default}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-bold text-lg truncate ${
                        notification.isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"
                      }`}>
                        {notification.title}
                      </h3>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      notification.isRead ? "text-slate-500" : "text-slate-600 dark:text-slate-400"
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {format(parseISO(notification.createdAt), "MMM d, h:mm a")}
                      </span>
                      {notification.data?.link && (
                        <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                          View Details
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, notification.id)}
                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Delete notification"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
              <div className="size-20 flex items-center justify-center bg-white dark:bg-slate-800 rounded-3xl shadow-sm mb-6 text-slate-300">
                <span className="material-symbols-outlined text-4xl">notification_add</span>
              </div>
              <h3 className="text-xl font-bold text-slate-500 mb-2">
                {filter === "unread" ? "No Unread Notifications" : "No Notifications Yet"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm">
                {filter === "unread" 
                  ? "You're all caught up! Check the 'All' tab to see past notifications."
                  : "When you receive updates about your courses, assignments, or payments, they will appear here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
