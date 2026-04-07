"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";

// Helper to format date for input
const formatDateForInput = (date: string | null | undefined): string => {
  if (!date) return "";
  try {
    return format(new Date(date), "yyyy-MM-dd");
  } catch {
    return "";
  }
};

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    systemName: "",
    supportEmail: "",
    maxStudentsPerClass: 25,
    defaultCurrency: "USD",
    notifications: {
      emailNotifications: true,
      paymentReminders: true,
      sessionReminders: true,
    },
    integrations: {
      jitsiDomain: "meet.jit.si",
      intasendPublicKey: "",
    },
    // School Calendar Fields
    enrollmentStartDate: "",
    enrollmentEndDate: "",
    orientationDate: "",
    firstClassDate: "",
    lastClassDate: "",
    // Seat Reservation & Material Fee Fields
    seatReservationFee: "",
    materialFee: "",
    materialFeeDeadline: "",
    intakeLabel: "",
    reservationCommission: "",
    fullPaymentCommission: "",
    minInstallmentAmount: "",
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/settings");
      return response.data.data;
    },
  });

  useEffect(() => {
    if (settingsData) {
      setFormData({
        systemName: settingsData.systemName || "",
        supportEmail: settingsData.supportEmail || "",
        maxStudentsPerClass: settingsData.maxStudentsPerClass || 25,
        defaultCurrency: settingsData.defaultCurrency || "USD",
        notifications: (settingsData.notifications as any) || {
          emailNotifications: true,
          paymentReminders: true,
          sessionReminders: true,
        },
        integrations: (settingsData.integrations as any) || {
          jitsiDomain: "meet.jit.si",
          intasendPublicKey: "",
        },
        // School Calendar Fields
        enrollmentStartDate: formatDateForInput(
          settingsData.enrollmentStartDate,
        ),
        enrollmentEndDate: formatDateForInput(settingsData.enrollmentEndDate),
        orientationDate: formatDateForInput(settingsData.orientationDate),
        firstClassDate: formatDateForInput(settingsData.firstClassDate),
        lastClassDate: formatDateForInput(settingsData.lastClassDate),
        // Seat Reservation & Material Fee Fields
        seatReservationFee:
          settingsData.seatReservationFee?.toString() || "2500",
        materialFee: settingsData.materialFee?.toString() || "7500",
        materialFeeDeadline: formatDateForInput(
          settingsData.materialFeeDeadline,
        ),
        intakeLabel: settingsData.intakeLabel || "May 2026",
        reservationCommission:
          settingsData.reservationCommission?.toString() || "5",
        fullPaymentCommission:
          settingsData.fullPaymentCommission?.toString() || "15",
        minInstallmentAmount:
          settingsData.minInstallmentAmount?.toString() || "9000",
      });
    }
  }, [settingsData]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await axiosInstance.patch("/admin/settings", settings);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
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
              onChange={(e) =>
                setFormData({ ...formData, systemName: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, supportEmail: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxStudentsPerClass: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Default Currency
            </label>
            <select
              value={formData.defaultCurrency}
              onChange={(e) =>
                setFormData({ ...formData, defaultCurrency: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="KES">KES - Kenyan Shilling</option>
            </select>
          </div>
        </div>
      </div>

      {/* School Calendar Settings */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary">
            calendar_month
          </span>
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
            School Calendar
          </h2>
        </div>
        <p className="text-[#4c669a] text-sm mb-6">
          Set enrollment periods, orientation date, and class schedule. Student
          registrations will be blocked outside the enrollment period.
        </p>

        {/* Enrollment Status Indicator */}
        {(() => {
          const now = new Date();
          const enrollmentStart = formData.enrollmentStartDate
            ? new Date(formData.enrollmentStartDate)
            : null;
          const enrollmentEnd = formData.enrollmentEndDate
            ? new Date(formData.enrollmentEndDate)
            : null;

          let statusColor = "green";
          let statusText = "Enrollment Open";
          let statusDescription = "Students can register for the school.";

          if (enrollmentStart && now < enrollmentStart) {
            statusColor = "amber";
            statusText = "Enrollment Not Started";
            statusDescription = `Registration opens on ${format(enrollmentStart, "MMM d, yyyy")}`;
          } else if (enrollmentEnd && now > enrollmentEnd) {
            statusColor = "red";
            statusText = "Enrollment Closed";
            statusDescription = `Registration ended on ${format(enrollmentEnd, "MMM d, yyyy")}`;
          } else if (enrollmentEnd) {
            statusDescription = `Registration closes on ${format(enrollmentEnd, "MMM d, yyyy")}`;
          }

          return (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
                statusColor === "green"
                  ? "bg-green-50 dark:bg-green-900/10"
                  : statusColor === "amber"
                    ? "bg-amber-50 dark:bg-amber-900/10"
                    : "bg-red-50 dark:bg-red-900/10"
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  statusColor === "green"
                    ? "text-green-600"
                    : statusColor === "amber"
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {statusColor === "green"
                  ? "check_circle"
                  : statusColor === "amber"
                    ? "schedule"
                    : "cancel"}
              </span>
              <div>
                <p
                  className={`text-sm font-medium ${
                    statusColor === "green"
                      ? "text-green-700 dark:text-green-400"
                      : statusColor === "amber"
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {statusText}
                </p>
                <p className="text-xs text-[#4c669a]">{statusDescription}</p>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Enrollment Start Date
            </label>
            <input
              type="date"
              value={formData.enrollmentStartDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  enrollmentStartDate: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              When registration opens
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Enrollment End Date
            </label>
            <input
              type="date"
              value={formData.enrollmentEndDate}
              onChange={(e) =>
                setFormData({ ...formData, enrollmentEndDate: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              When registration closes
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Orientation Date
            </label>
            <input
              type="date"
              value={formData.orientationDate}
              onChange={(e) =>
                setFormData({ ...formData, orientationDate: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Student orientation day
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#e7ebf3] dark:border-[#2d3748]">
            <div>
              <label className="block text-sm font-medium text-[#4c669a] mb-2">
                First Class Date
              </label>
              <input
                type="date"
                value={formData.firstClassDate}
                onChange={(e) =>
                  setFormData({ ...formData, firstClassDate: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
              />
              <p className="text-xs text-[#4c669a] mt-1">Classes begin</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4c669a] mb-2">
                Last Class Date
              </label>
              <input
                type="date"
                value={formData.lastClassDate}
                onChange={(e) =>
                  setFormData({ ...formData, lastClassDate: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
              />
              <p className="text-xs text-[#4c669a] mt-1">Classes end</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Reservation & Payment Settings */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary">
            event_seat
          </span>
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
            Seat Reservation & Fees
          </h2>
        </div>
        <p className="text-[#4c669a] text-sm mb-6">
          Configure seat reservation fees, learning material fees, and intake
          labels. These values are used on the public reservation page and for
          automated billing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Seat Reservation Fee (USD)
            </label>
            <input
              type="number"
              value={formData.seatReservationFee}
              onChange={(e) =>
                setFormData({ ...formData, seatReservationFee: e.target.value })
              }
              placeholder="2500"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Non-refundable fee to lock a seat. Deducted from total tuition.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Learning Material Fee (USD)
            </label>
            <input
              type="number"
              value={formData.materialFee}
              onChange={(e) =>
                setFormData({ ...formData, materialFee: e.target.value })
              }
              placeholder="7500"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Fee for purchasing learning materials. Prompted 3 weeks before
              classes.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Material Fee Deadline
            </label>
            <input
              type="date"
              value={formData.materialFeeDeadline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  materialFeeDeadline: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Deadline for material fee payment (e.g. end of April)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Intake Label
            </label>
            <input
              type="text"
              value={formData.intakeLabel}
              onChange={(e) =>
                setFormData({ ...formData, intakeLabel: e.target.value })
              }
              placeholder="May 2026"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Label shown on the public reservation page (e.g. &quot;May
              2026&quot;)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Minimum Installment Amount (USD)
            </label>
            <input
              type="number"
              value={formData.minInstallmentAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minInstallmentAmount: e.target.value,
                })
              }
              placeholder="9000"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Minimum amount for flexible installment plans (default: $9,000)
            </p>
          </div>
        </div>
      </div>

      {/* Marketer Commission Settings */}
      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d3748] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary">
            handshake
          </span>
          <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
            Marketer Commission Rates
          </h2>
        </div>
        <p className="text-[#4c669a] text-sm mb-6">
          Set the commission amounts marketers earn per referred student.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Reservation Commission (USD)
            </label>
            <input
              type="number"
              value={formData.reservationCommission}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reservationCommission: e.target.value,
                })
              }
              placeholder="5"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Commission per confirmed seat reservation (default: $5)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Full Payment Commission (USD)
            </label>
            <input
              type="number"
              value={formData.fullPaymentCommission}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullPaymentCommission: e.target.value,
                })
              }
              placeholder="15"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-white dark:bg-[#2d3748] dark:text-white text-sm"
            />
            <p className="text-xs text-[#4c669a] mt-1">
              Commission per confirmed full fee payment (default: $15)
            </p>
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notifications: {
                    ...formData.notifications,
                    emailNotifications: e.target.checked,
                  },
                })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notifications: {
                    ...formData.notifications,
                    paymentReminders: e.target.checked,
                  },
                })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notifications: {
                    ...formData.notifications,
                    sessionReminders: e.target.checked,
                  },
                })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  integrations: {
                    ...formData.integrations,
                    jitsiDomain: e.target.value,
                  },
                })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  integrations: {
                    ...formData.integrations,
                    intasendPublicKey: e.target.value,
                  },
                })
              }
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
            <span className="material-symbols-outlined text-green-600">
              check_circle
            </span>
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
            <span className="material-symbols-outlined text-primary">
              security
            </span>
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
          {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
