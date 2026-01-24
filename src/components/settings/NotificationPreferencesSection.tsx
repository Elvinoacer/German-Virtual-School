"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface NotificationPreferences {
  id: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  classReminders: boolean;
  assignmentAlerts: boolean;
  gradeNotifications: boolean;
  messageAlerts: boolean;
  paymentReminders: boolean;
  forumUpdates: boolean;
}

function ToggleSwitch({ 
  enabled, 
  onChange, 
  disabled 
}: { 
  enabled: boolean; 
  onChange: () => void; 
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function PreferenceRow({
  icon,
  label,
  description,
  enabled,
  onChange,
  disabled,
}: {
  icon: string;
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export default function NotificationPreferencesSection() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const json = await res.json();
      return json.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const res = await fetch("/api/users/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preference updated");
    },
    onError: () => {
      toast.error("Failed to update preference");
    },
  });

  const togglePreference = (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    updateMutation.mutate({ [key]: !preferences[key] });
  };

  if (isLoading) {
    return (
      <section id="notifications" className="grid gap-6 grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Notification Preferences
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure how you receive notifications.
          </p>
        </div>
        <div className="md:col-span-8">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-6 shadow-sm">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!preferences) return null;

  return (
    <section id="notifications" className="grid gap-6 grid-cols-1 md:grid-cols-12">
      <div className="md:col-span-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Notification Preferences
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure how you receive notifications.
        </p>
      </div>
      <div className="md:col-span-8 space-y-6">
        {/* Channels */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
            Notification Channels
          </h4>
          <PreferenceRow
            icon="notifications"
            label="In-App Notifications"
            description="Show notifications in the app"
            enabled={preferences.inAppNotifications}
            onChange={() => togglePreference("inAppNotifications")}
            disabled={updateMutation.isPending}
          />
          <PreferenceRow
            icon="mail"
            label="Email Notifications"
            description="Send notifications to your email"
            enabled={preferences.emailNotifications}
            onChange={() => togglePreference("emailNotifications")}
            disabled={updateMutation.isPending}
          />
          <PreferenceRow
            icon="phone_android"
            label="Push Notifications"
            description="Browser push notifications"
            enabled={preferences.pushNotifications}
            onChange={() => togglePreference("pushNotifications")}
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
            Notification Categories
          </h4>
          <PreferenceRow
            icon="event"
            label="Class Reminders"
            description="Upcoming class and session alerts"
            enabled={preferences.classReminders}
            onChange={() => togglePreference("classReminders")}
            disabled={updateMutation.isPending}
          />
          <PreferenceRow
            icon="assignment"
            label="Assignment Alerts"
            description="New assignments and due date reminders"
            enabled={preferences.assignmentAlerts}
            onChange={() => togglePreference("assignmentAlerts")}
            disabled={updateMutation.isPending}
          />
          <PreferenceRow
            icon="grade"
            label="Grade Notifications"
            description="When your work has been graded"
            enabled={preferences.gradeNotifications}
            onChange={() => togglePreference("gradeNotifications")}
            disabled={updateMutation.isPending}
          />
          <PreferenceRow
            icon="chat"
            label="Message Alerts"
            description="New messages from teachers and students"
            enabled={preferences.messageAlerts}
            onChange={() => togglePreference("messageAlerts")}
            disabled={updateMutation.isPending}
          />
          <PreferenceRow
            icon="payments"
            label="Payment Reminders"
            description="Invoice and payment due alerts"
            enabled={preferences.paymentReminders}
            onChange={() => togglePreference("paymentReminders")}
            disabled={updateMutation.isPending}
          />
          <PreferenceRow
            icon="forum"
            label="Forum Updates"
            description="New posts and replies in forums"
            enabled={preferences.forumUpdates}
            onChange={() => togglePreference("forumUpdates")}
            disabled={updateMutation.isPending}
          />
        </div>
      </div>
    </section>
  );
}
