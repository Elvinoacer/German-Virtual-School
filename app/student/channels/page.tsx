"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Channel {
  id: string;
  name: string;
  type: string;
  link: string;
  description: string | null;
  iconUrl: string | null;
  isPublic: boolean;
  createdAt: string;
}

const CHANNEL_TYPES = [
  { value: "WHATSAPP", label: "WhatsApp", icon: "chat", color: "bg-green-500" },
  { value: "TELEGRAM", label: "Telegram", icon: "send", color: "bg-blue-500" },
  { value: "DISCORD", label: "Discord", icon: "headphones", color: "bg-indigo-500" },
  { value: "FACEBOOK", label: "Facebook", icon: "group", color: "bg-blue-600" },
  { value: "INSTAGRAM", label: "Instagram", icon: "photo_camera", color: "bg-pink-500" },
  { value: "TWITTER", label: "X (Twitter)", icon: "tag", color: "bg-gray-800" },
  { value: "OTHER", label: "Other", icon: "link", color: "bg-gray-500" },
];

function getChannelTypeInfo(type: string) {
  return CHANNEL_TYPES.find((t) => t.value === type) || CHANNEL_TYPES[CHANNEL_TYPES.length - 1];
}

export default function StudentChannelsPage() {
  const { user } = useAuth();
  const { data: channels, isLoading } = useQuery<Channel[]>({
    queryKey: ["student-channels"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/student/channels");
      return res.data.data.channels;
    },
  });

  return (
    <div className="flex flex-col w-full min-h-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-4 border-b border-gray-200/50 dark:border-gray-800/50">
        <h2 className="text-2xl font-black text-text-main dark:text-white tracking-tight">
          Channels
        </h2>
        <p className="text-text-subtle text-sm">
          Connect with your classmates and join official groups
        </p>
      </header>

      <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : channels && channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {channels.map((channel) => {
              const typeInfo = getChannelTypeInfo(channel.type);
              return (
                <div
                  key={channel.id}
                  className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${typeInfo.color} text-white`}>
                      <span className="material-symbols-outlined text-2xl">{typeInfo.icon}</span>
                    </div>
                    {!channel.isPublic && (
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase rounded-lg border border-amber-200 dark:border-amber-800">
                        Private Group
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                      {channel.name}
                    </h3>
                    {channel.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {channel.description}
                      </p>
                    )}
                  </div>

                  <a
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-center text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Join Group</span>
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-400">
                diversity_3
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No Channels Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2">
              There are no active communication channels available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
