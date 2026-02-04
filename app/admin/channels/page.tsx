"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { toast } from "sonner";

interface Channel {
  id: string;
  name: string;
  type: string;
  link: string;
  description: string | null;
  iconUrl: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
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

export default function AdminChannelsPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "WHATSAPP",
    link: "",
    description: "",
    isPublic: true,
  });

  const { data: channels, isLoading } = useQuery<Channel[]>({
    queryKey: ["admin-channels"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/channels");
      return res.data.data.channels;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await axiosInstance.post("/api/admin/channels", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-channels"] });
      toast.success(data.message || "Channel created successfully!");
      setIsCreateModalOpen(false);
      setFormData({ name: "", type: "WHATSAPP", link: "", description: "", isPublic: true });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create channel");
    },
  });

  // ... (delete and reactivate mutations remain same)

  const deleteMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await axiosInstance.delete(`/api/admin/channels/${channelId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-channels"] });
      toast.success("Channel deactivated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete channel");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await axiosInstance.patch(`/api/admin/channels/${channelId}`, { isActive: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-channels"] });
      toast.success("Channel reactivated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to reactivate channel");
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      const res = await axiosInstance.patch(`/api/admin/channels/${id}`, { isPublic });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-channels"] });
      toast.success("Channel visibility updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update visibility");
    },
  });

  const getChannelTypeInfo = (type: string) => {
    return CHANNEL_TYPES.find((t) => t.value === type) || CHANNEL_TYPES[CHANNEL_TYPES.length - 1];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
      {/* ... (Header remains same) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white">
            Communication Channels
          </h1>
          <p className="text-[#4c669a] text-sm mt-1">
            Manage WhatsApp, Telegram, and other social media group links for students
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Channel
        </button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels && channels.length > 0 ? (
          channels.map((channel) => {
            const typeInfo = getChannelTypeInfo(channel.type);
            return (
              <div
                key={channel.id}
                className={`bg-white dark:bg-[#1a202c] rounded-2xl border ${
                  channel.isActive
                    ? "border-[#e7ebf3] dark:border-[#2d3748]"
                    : "border-red-200 dark:border-red-900/30 opacity-60"
                } shadow-sm overflow-hidden group hover:shadow-lg transition-all`}
              >
                {/* Header with type badge */}
                <div className={`${typeInfo.color} p-4 flex items-center gap-3`}>
                  <span className="material-symbols-outlined text-white text-2xl">
                    {typeInfo.icon}
                  </span>
                  <div className="flex-1">
                    <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                      {typeInfo.label}
                    </span>
                    <div className="flex gap-1 mt-0.5">
                      {!channel.isActive && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">
                          Inactive
                        </span>
                      )}
                      {!channel.isPublic && (
                        <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded uppercase flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">lock</span>
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3">
                  <h3 className="text-lg font-bold text-[#0d121b] dark:text-white truncate">
                    {channel.name}
                  </h3>
                  {channel.description && (
                    <p className="text-sm text-[#4c669a] line-clamp-2">{channel.description}</p>
                  )}
                  {/* ... (dates/links) */}
                  <div className="text-xs text-[#9ca3af] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Created {format(new Date(channel.createdAt), "MMM d, yyyy")}
                  </div>
                  <div className="text-xs text-[#9ca3af] flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    <a
                      href={channel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      {channel.link}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex flex-col gap-2">
                   <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Public Visibility</span>
                      <button 
                        onClick={() => toggleVisibilityMutation.mutate({ id: channel.id, isPublic: !channel.isPublic })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${channel.isPublic ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                      >
                        <span
                          className={`${channel.isPublic ? 'translate-x-4' : 'translate-x-1'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                   </div>

                   <div className="flex gap-2">
                    <a
                      href={channel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[#4c669a] px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Open Link
                    </a>
                    {channel.isActive ? (
                      <button
                        onClick={() => {
                          if (confirm("Deactivate this channel?")) {
                            deleteMutation.mutate(channel.id);
                          }
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => reactivateMutation.mutate(channel.id)}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // ... (Empty state remains same)
          <div className="col-span-full bg-white dark:bg-[#1a202c] rounded-2xl border border-[#e7ebf3] dark:border-[#2d3748] p-12 text-center">
            {/* ... */}
            <div className="flex flex-col items-center gap-4">
              <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-slate-400">forum</span>
              </div>
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">No channels yet</h3>
              <p className="text-sm text-[#4c669a] max-w-md">
                Create your first communication channel to share WhatsApp groups, Telegram channels,
                or other social media links with students.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Create First Channel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             {/* ... (Header) ... */}
            <div className="p-6 border-b border-[#e7ebf3] dark:border-[#2d3748]">
              <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
                Create Communication Channel
              </h2>
              <p className="text-sm text-[#4c669a] mt-1">
                Add a new social media or messaging group for students to join
              </p>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="p-6 flex flex-col gap-5"
            >
              {/* Channel Type */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">
                  Channel Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CHANNEL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        formData.type === type.value
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-slate-100 dark:bg-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className={`${type.color} p-2 rounded-lg`}>
                        <span className="material-symbols-outlined text-white text-sm">
                          {type.icon}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#4c669a] uppercase tracking-wider">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">
                  Channel Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., German Learners Community"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Channel Link */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">
                  Join Link *
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

               {/* Add Visibility Toggle */}
               <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Public Channel</span>
                    <span className="text-xs text-gray-500">Visible to everyone on the public site</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${formData.isPublic ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span
                      className={`${formData.isPublic ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </button>
               </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0d121b] dark:text-white">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this channel is for..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Info Alert */}
              {/* ... (Actions) ... */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] text-[#4c669a] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">add</span>
                     Create & Notify
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
