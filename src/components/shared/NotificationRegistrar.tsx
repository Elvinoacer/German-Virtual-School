
"use client";

import { useEffect, useState } from "react";
import { requestNotificationPermission } from "@/lib/firebase-client";
import axiosInstance from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function NotificationRegistrar() {
  const [showModal, setShowModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Check permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      const status = Notification.permission;
      setPermissionStatus(status);

      const hasDismissed = sessionStorage.getItem("notification_modal_dismissed");

      if (status === "granted") {
        registerToken();
      } else if (!hasDismissed && (status === "default" || status === "denied")) {
        // Delay slightly for smooth entrance after layout load
        setTimeout(() => setShowModal(true), 1500);
      }
    }
  }, []);

  const registerToken = async () => {
    try {
      setIsRegistering(true);
      const token = await requestNotificationPermission();
      if (token) {
        await axiosInstance.post("/api/notifications/register-push", { token });
        console.log("[NotificationRegistrar] Token registered");
        // Ensure modal is closed if it was open
        setShowModal(false);
      } else {
        // Token null means permission issues usually
        setPermissionStatus(Notification.permission);
      }
    } catch (error) {
      console.error("[NotificationRegistrar] Failed to register token", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEnable = async () => {
    if (permissionStatus === "denied") {
        // We cannot programmatically re-request if denied, we must instruct user
        toast.info("Notifications are blocked. Please enable them in your browser settings.");
        handleDismiss(); // Close modal so they can go to settings
        return;
    }

    try {
        const result = await Notification.requestPermission();
        setPermissionStatus(result);
        if (result === 'granted') {
            await registerToken();
            toast.success("Notifications enabled!");
        } else {
            toast.error("Permission denied.");
        }
    } catch (error) {
        console.error("Permission request failed", error);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    sessionStorage.setItem("notification_modal_dismissed", "true");
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 md:max-w-sm"
        >
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-full shrink-0">
                <span className="material-symbols-outlined filled">notifications</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  Enable Notifications?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {permissionStatus === 'denied' 
                    ? "Notifications are currently blocked. We need your permission to send you important class updates." 
                    : "Stay updated with real-time class alerts, assignments, and messages from your teachers."}
                </p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleDismiss}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 px-3 py-2 transition-colors"
                  >
                    {permissionStatus === 'denied' ? "Close" : "Not Now"}
                  </button>
                  <button 
                    onClick={handleEnable}
                    disabled={isRegistering}
                    className="flex-1 bg-primary text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? "Enabling..." : (permissionStatus === 'denied' ? "I Understand" : "Enable Notifications")}
                  </button>
                </div>
              </div>
            </div>
            {/* Close X corner */}
            <button 
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
