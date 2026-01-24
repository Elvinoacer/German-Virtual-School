
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

interface VerifyStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: Student | null;
  isProcessing: boolean;
}

export default function VerifyStudentModal({
  isOpen,
  onClose,
  onConfirm,
  student,
  isProcessing
}: VerifyStudentModalProps) {
  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            {/* Header with decorative background */}
            <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20"></div>
              <div className="size-16 rounded-full bg-white p-1 shadow-lg mt-8 border-4 border-white dark:border-slate-800 z-10">
                <div 
                  className="size-full rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: student.avatarUrl
                      ? `url('${student.avatarUrl}')`
                      : 'url(https://ui-avatars.com/api/?name=' + encodeURIComponent(`${student.firstName} ${student.lastName}`) + ')'
                  }}
                />
              </div>
            </div>

            <div className="px-6 pb-6 pt-10 text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Verify Student?
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to verify <span className="font-semibold text-slate-700 dark:text-slate-300">{student.firstName} {student.lastName}</span>? 
                This will grant them full access to the platform.
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">gavel</span>
                      Verify Access
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
