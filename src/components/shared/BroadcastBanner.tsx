"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

interface Channel {
  id: string;
  name: string;
  type: string;
  link: string;
}

interface BroadcastBannerProps {
  maxBroadcasts?: number;
}

export default function BroadcastBanner({ maxBroadcasts = 3 }: BroadcastBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("gvs_dismissed_broadcasts");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDismissedIds(parsed);
      } catch {
        // Ignore parse errors
      }
    }
    setIsLoaded(true);
  }, []);

  // Fetch recent broadcasts (in-app notifications with type INFO or WARNING)
  const { data: broadcasts } = useQuery<Broadcast[]>({
    queryKey: ["recent-broadcasts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/notifications?limit=5&onlyBroadcasts=true");
      return res.data.data?.notifications || [];
    },
    enabled: isLoaded,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch recently created channels (last 7 days)
  const { data: recentChannels } = useQuery<Channel[]>({
    queryKey: ["recent-channels-banner"],
    queryFn: async () => {
      const res = await axiosInstance.get("/channels");
      const channels = res.data.data?.channels || [];
      // Only show channels created in last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return channels.filter((ch: any) => new Date(ch.createdAt) > weekAgo);
    },
    enabled: isLoaded,
    staleTime: 1000 * 60 * 5,
  });

  const dismissBroadcast = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem("gvs_dismissed_broadcasts", JSON.stringify(newDismissed));
  };

  const dismissAll = () => {
    const allIds = [
      ...(broadcasts?.map((b) => b.id) || []),
      ...(recentChannels?.map((c) => `channel-${c.id}`) || []),
    ];
    setDismissedIds((prev) => [...prev, ...allIds]);
    localStorage.setItem("gvs_dismissed_broadcasts", JSON.stringify([...dismissedIds, ...allIds]));
  };

  // Filter out dismissed items
  const visibleBroadcasts =
    broadcasts?.filter((b) => !dismissedIds.includes(b.id)).slice(0, maxBroadcasts) || [];
  const visibleChannels =
    recentChannels?.filter((c) => !dismissedIds.includes(`channel-${c.id}`)) || [];

  const hasAnyVisible = visibleBroadcasts.length > 0 || visibleChannels.length > 0;

  if (!isLoaded || !hasAnyVisible) {
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "WARNING":
        return "bg-amber-500";
      case "ERROR":
        return "bg-red-500";
      case "SUCCESS":
        return "bg-green-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-indigo-500/5 dark:from-primary/10 dark:via-blue-500/10 dark:to-indigo-500/10 rounded-2xl border border-primary/10 dark:border-primary/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 dark:border-primary/20">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">campaign</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Announcements & Updates
              </span>
            </div>
            <button
              onClick={dismissAll}
              className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Dismiss All
            </button>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-3">
            {/* New Channels */}
            {visibleChannels.length > 0 && (
              <Link
                href="/channels"
                className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors group relative"
              >
                <div className="size-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white">diversity_3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                      New Channels
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold">
                      {visibleChannels.length} NEW
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    Join our new communication channels:{" "}
                    <span className="text-primary">
                      {visibleChannels.map((c) => c.name).join(", ")}
                    </span>
                  </p>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">
                  arrow_forward
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    visibleChannels.forEach((c) => dismissBroadcast(`channel-${c.id}`));
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <span className="material-symbols-outlined text-[14px] text-gray-500">close</span>
                </button>
              </Link>
            )}

            {/* Broadcasts */}
            {visibleBroadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 relative group"
              >
                <div
                  className={`size-10 rounded-xl ${getTypeColor(broadcast.type)} flex items-center justify-center shrink-0`}
                >
                  <span className="material-symbols-outlined text-white text-sm">
                    {broadcast.type === "WARNING" ? "warning" : "info"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {broadcast.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                    {broadcast.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissBroadcast(broadcast.id)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px] text-gray-500">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
