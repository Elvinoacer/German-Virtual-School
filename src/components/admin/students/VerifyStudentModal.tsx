
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface StudentProfile {
  dateOfBirth: string | null;
  phoneNumber: string | null;
  address: string | null;
  emergencyContact: string | null;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  onboardingComplete?: boolean;
  profile?: StudentProfile | null;
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

  const hasProfile = student.profile && (student.profile.dateOfBirth || student.profile.phoneNumber);

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

            <div className="px-6 pb-6 pt-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                Verify Student?
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                Are you sure you want to verify <span className="font-semibold text-slate-700 dark:text-slate-300">{student.firstName} {student.lastName}</span>? 
                This will grant them full access to the platform.
              </p>

              {/* Profile Information */}
              {hasProfile && (
                <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Student Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {student.profile?.dateOfBirth && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-xs">Date of Birth</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {format(new Date(student.profile.dateOfBirth), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    {student.profile?.phoneNumber && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-xs">Phone</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {student.profile.phoneNumber}
                        </span>
                      </div>
                    )}
                    {student.profile?.address && (
                      <div className="col-span-2">
                        <span className="text-slate-400 dark:text-slate-500 block text-xs">Address</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {student.profile.address}
                        </span>
                      </div>
                    )}
                    {student.profile?.emergencyContact && (
                      <div className="col-span-2">
                        <span className="text-slate-400 dark:text-slate-500 block text-xs">Emergency Contact</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {student.profile.emergencyContact}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Profile Warning */}
              {!hasProfile && (
                <div className="mt-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 text-lg shrink-0">warning</span>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This student hasn&apos;t completed their profile yet. You can still verify them, but consider requesting profile completion first.
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
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
