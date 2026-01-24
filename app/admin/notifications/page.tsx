"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target: string;
  type: string;
  recipientCount: number;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export default function AdminNotificationsPage() {
  const { data: broadcasts, isLoading } = useQuery<Broadcast[]>({
    queryKey: ["admin-broadcasts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/notifications");
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white">
            System Notifications
          </h1>
          <p className="text-[#4c669a] text-sm mt-1">
            History of system-wide broadcasts and announcements
          </p>
        </div>
        <Link 
          href="/admin/notifications/compose" 
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">edit_square</span>
          Compose Broadcast
        </Link>
      </div>

      {/* Broadcasts Table */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fc] dark:bg-[#2d3748] border-b border-[#e7ebf3] dark:border-[#2d3748]">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">Subject</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">Audience</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">Recipients</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">Sender</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase text-right">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3] dark:divide-[#2d3748]">
              {broadcasts && broadcasts.length > 0 ? (
                broadcasts.map((broadcast) => (
                  <tr key={broadcast.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#0d121b] dark:text-white line-clamp-1">{broadcast.title}</span>
                        <span className="text-xs text-[#4c669a] line-clamp-1 max-w-md">{broadcast.message}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {broadcast.target.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-[#0d121b] dark:text-white">
                        <span className="material-symbols-outlined text-xs text-[#9ca3af]">group</span>
                        {broadcast.recipientCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="size-6 rounded-full bg-cover bg-center bg-gray-200"
                          style={{ backgroundImage: broadcast.sender.avatarUrl ? `url('${broadcast.sender.avatarUrl}')` : undefined }}
                        />
                        <span className="text-sm text-[#4c669a]">{broadcast.sender.firstName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4c669a]">
                      {format(new Date(broadcast.createdAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                        ${broadcast.type === 'ERROR' ? 'bg-red-50 text-red-600 border border-red-100' : 
                          broadcast.type === 'WARNING' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                          broadcast.type === 'SUCCESS' ? 'bg-green-50 text-green-600 border border-green-100' : 
                          'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}
                      >
                        {broadcast.type}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">campaign</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">No broadcasts sent yet</p>
                      <p className="text-sm text-slate-500">Create your first system-wide announcement to see it here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
