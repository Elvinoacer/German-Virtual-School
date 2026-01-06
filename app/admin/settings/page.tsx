"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    systemName: "",
    supportEmail: "",
    maxStudentsPerClass: 25,
    defaultCurrency: "KES",
    notifications: {
      emailNotifications: true,
      paymentReminders: true,
      sessionReminders: true
    },
    integrations: {
      jitsiDomain: "meet.jit.si",
      intasendPublicKey: ""
    }
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/admin/settings');
      return response.data.data;
    }
  });

  useEffect(() => {
    if (settingsData) {
      setFormData({
        systemName: settingsData.systemName || "",
        supportEmail: settingsData.supportEmail || "",
        maxStudentsPerClass: settingsData.maxStudentsPerClass || 25,
        defaultCurrency: settingsData.defaultCurrency || "KES",
        notifications: (settingsData.notifications as any) || {
          emailNotifications: true,
          paymentReminders: true,
          sessionReminders: true
        },
        integrations: (settingsData.integrations as any) || {
          jitsiDomain: "meet.jit.si",
          intasendPublicKey: ""
        }
      });
    }
  }, [settingsData]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await axiosInstance.patch('/api/admin/settings', settings);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
    },
    onError: () => {
      toast.error("Failed to save settings");
    }
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white">
          System Settings
        </h1>
        <p className="text-[#4c669a] text-sm mt-1">
          Configure system-wide settings, integrations, and compliance
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
          General Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              System Name
            </label>
            <input
              type="text"
              value={formData.systemName}
              onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Max Students Per Class
            </label>
            <input
              type="number"
              value={formData.maxStudentsPerClass}
              onChange={(e) => setFormData({ ...formData, maxStudentsPerClass: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Default Currency
            </label>
            <select
              value={formData.defaultCurrency}
              onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            >
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
          Notification Settings
        </h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                Email Notifications
              </p>
              <p className="text-xs text-[#4c669a]">
                Send system emails to users
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.emailNotifications}
              onChange={(e) => setFormData({ 
                ...formData, 
                notifications: { ...formData.notifications, emailNotifications: e.target.checked } 
              })}
              className="size-5 rounded border-[#e7ebf3] dark:border-[#2d3748] text-primary focus:ring-primary"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                Payment Reminders
              </p>
              <p className="text-xs text-[#4c669a]">
                Automatically send payment due notifications
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.paymentReminders}
              onChange={(e) => setFormData({ 
                ...formData, 
                notifications: { ...formData.notifications, paymentReminders: e.target.checked } 
              })}
              className="size-5 rounded border-[#e7ebf3] dark:border-[#2d3748] text-primary focus:ring-primary"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                Session Reminders
              </p>
              <p className="text-xs text-[#4c669a]">
                Send reminders before live classes
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.sessionReminders}
              onChange={(e) => setFormData({ 
                ...formData, 
                notifications: { ...formData.notifications, sessionReminders: e.target.checked } 
              })}
              className="size-5 rounded border-[#e7ebf3] dark:border-[#2d3748] text-primary focus:ring-primary"
            />
          </label>
        </div>
      </div>

      {/* Integration Settings */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
          Integration Settings
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Jitsi Meet Server Domain
            </label>
            <input
              type="text"
              value={formData.integrations.jitsiDomain}
              onChange={(e) => setFormData({ 
                ...formData, 
                integrations: { ...formData.integrations, jitsiDomain: e.target.value } 
              })}
              placeholder="meet.jit.si"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Domain for video conferencing sessions
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              IntaSend Public Key
            </label>
            <input
              type="password"
              value={formData.integrations.intasendPublicKey}
              onChange={(e) => setFormData({ 
                ...formData, 
                integrations: { ...formData.integrations, intasendPublicKey: e.target.value } 
              })}
              placeholder="ISPubKey_***"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Payment gateway public key for processing payments
            </p>
          </div>
        </div>
      </div>

      {/* Compliance & Security */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4">
          Compliance & Security
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <div>
              <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                GDPR Compliance Enabled
              </p>
              <p className="text-xs text-[#4c669a]">
                All user data is encrypted and handled per GDPR standards
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
            <span className="material-symbols-outlined text-primary">security</span>
            <div>
              <p className="text-sm font-medium text-[#0d121b] dark:text-white">
                Audit Logs Active
              </p>
              <p className="text-xs text-[#4c669a]">
                All critical actions are logged for compliance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
