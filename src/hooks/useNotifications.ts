"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: {
    link?: string;
    [key: string]: any;
  } | null;
  isRead: boolean;
  createdAt: string;
}

const NOTIFICATIONS_KEY = "notifications";

/**
 * Fetch all notifications for the current user
 */
export function useNotifications(options?: { isRead?: boolean; limit?: number }) {
  return useQuery<Notification[]>({
    queryKey: [NOTIFICATIONS_KEY, options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.isRead !== undefined) params.set("isRead", String(options.isRead));
      if (options?.limit) params.set("limit", String(options.limit));
      
      const res = await axiosInstance.get(`/api/notifications/me?${params.toString()}`);
      return res.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get the count of unread notifications
 */
export function useUnreadCount() {
  const { data, isLoading } = useNotifications({ isRead: false });
  return {
    count: data?.length ?? 0,
    isLoading,
  };
}

/**
 * Mark a single notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await axiosInstance.patch(`/api/notifications/${notificationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/api/notifications/mark-all-read");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

/**
 * Delete a single notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await axiosInstance.delete(`/api/notifications/${notificationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

/**
 * Delete all notifications
 */
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete("/api/notifications/delete-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}
