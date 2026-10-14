"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface Channel {
  id: string;
  name: string;
  type: string;
  link: string;
  description: string | null;
  iconUrl: string | null;
  createdAt: string;
}

const CHANNEL_TYPES = [
  { value: "WHATSAPP", label: "WhatsApp", icon: "chat", color: "from-green-400 to-green-600", bg: "bg-green-500" },
  { value: "TELEGRAM", label: "Telegram", icon: "send", color: "from-blue-400 to-blue-600", bg: "bg-blue-500" },
  { value: "DISCORD", label: "Discord", icon: "headphones", color: "from-indigo-400 to-indigo-600", bg: "bg-indigo-500" },
  { value: "FACEBOOK", label: "Facebook", icon: "group", color: "from-blue-500 to-blue-700", bg: "bg-blue-600" },
  { value: "INSTAGRAM", label: "Instagram", icon: "photo_camera", color: "from-pink-400 to-purple-600", bg: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500" },
  { value: "TWITTER", label: "X (Twitter)", icon: "tag", color: "from-gray-700 to-gray-900", bg: "bg-gray-800" },
  { value: "OTHER", label: "Other", icon: "link", color: "from-gray-400 to-gray-600", bg: "bg-gray-500" },
];

function getChannelTypeInfo(type: string) {
  return CHANNEL_TYPES.find((t) => t.value === type) || CHANNEL_TYPES[CHANNEL_TYPES.length - 1];
}

export default function ChannelsPage() {
  const { data: channels, isLoading } = useQuery<Channel[]>({
    queryKey: ["public-channels"],
    queryFn: async () => {
      const res = await axiosInstance.get("/channels");
      return res.data.data.channels;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0b0f1a] dark:to-[#101622] font-display">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/5 dark:to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-sm font-bold text-primary dark:text-white mb-6">
              <span className="material-symbols-outlined text-[18px]">diversity_3</span>
              Join Our Community
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Connect with Fellow{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                German Learners
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Join our official communication channels to stay updated, ask questions, 
              share resources, and connect with the GVS community.
            </p>
          </div>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : channels && channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((channel, index) => {
              const typeInfo = getChannelTypeInfo(channel.type);
              return (
                <a
                  key={channel.id}
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white dark:bg-[#1a202c] rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-transparent hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${typeInfo.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative p-6 flex flex-col gap-4 group-hover:text-white transition-colors duration-500">
                    {/* Icon */}
                    <div className={`${typeInfo.bg} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <span className="material-symbols-outlined text-white text-3xl">
                        {typeInfo.icon}
                      </span>
                    </div>
                    
                    {/* Type Label */}
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-white/70 transition-colors">
                      {typeInfo.label}
                    </span>
                    
                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors line-clamp-2">
                      {channel.name}
                    </h3>
                    
                    {/* Description */}
                    {channel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/80 line-clamp-3 transition-colors">
                        {channel.description}
                      </p>
                    )}
                    
                    {/* Join Button */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary group-hover:text-white flex items-center gap-1 transition-colors">
                        Join Channel
                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </span>
                      <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 group-hover:text-white/30 text-3xl transition-colors">
                        open_in_new
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-[#1a202c] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-primary">forum</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No Channels Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Communication channels will be available soon. Check back later or follow us on social media for updates!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">home</span>
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            Ready to Start Learning German?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join German Virtual School today and access world-class German education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">how_to_reg</span>
              Enroll Now
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/30"
            >
              <span className="material-symbols-outlined text-sm">school</span>
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
