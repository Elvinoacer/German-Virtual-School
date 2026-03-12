"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import axios from "axios";
import Link from "next/link";
import { usePublicStats } from "@/hooks/usePublicStats";

const PROGRAMS = [
  { value: "A1", label: "A1 — Elementary I" },
  { value: "A2", label: "A2 — Elementary II" },
  { value: "B1", label: "B1 — Intermediate I" },
  { value: "B2", label: "B2 — Intermediate II" },
  { value: "C1", label: "C1 — Advanced I" },
  { value: "C2", label: "C2 — Advanced II" },
  { value: "REFRESHER", label: "Refresher Course" },
  { value: "KINDERKURSE", label: "Kinderkurse (Children)" },
];

function ReserveSeatContent() {
  const searchParams = useSearchParams();
  const programFromUrl = searchParams.get("program");
  const refFromUrl = searchParams.get("ref");
  const statusFromUrl = searchParams.get("status");

  useEffect(() => {
    if (refFromUrl) {
      axios.post("/api/referral/track", { referralCode: refFromUrl, page: "/reserve-seat" }).catch(console.error);
    }
  }, [refFromUrl]);

  const { stats } = usePublicStats();
  const seatFee = stats.fees?.seatReservationFee ?? 2500;
  const matFee = stats.fees?.materialFee ?? 7500;
  const courseFee = stats.fees?.defaultFee ?? 5000; // Fallback to 5000 if not set
  const matDeadline = stats.fees?.materialFeeDeadline;
  const intakeLabel = stats.fees?.intakeLabel ?? "May";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    program: programFromUrl || "",
    referralCode: refFromUrl?.toUpperCase() || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(statusFromUrl === "success");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await axios.post("/api/seat-reservation", formData);

      if (data.success && data.data?.checkoutUrl) {
        // Save reservation details to localStorage for registration pre-fill
        try {
          localStorage.setItem('gvs_reservation', JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            program: formData.program,
            referralCode: formData.referralCode,
            timestamp: Date.now(),
          }));
        } catch (e) {
          // localStorage might be unavailable — non-blocking
        }
        // Redirect to IntaSend payment
        window.location.href = data.data.checkoutUrl;
      } else {
        setError("Failed to initiate payment. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span
              className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 font-sans">
            Seat Reserved Successfully!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Your seat for the <strong>May intake</strong> has been confirmed.
            You&apos;ll receive a confirmation email shortly with your reservation details.
          </p>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-8 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[18px] text-primary">
                info
              </span>
              <span>
                Your <strong>KSH 2,500</strong> reservation fee will be
                deducted from your total tuition.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[18px] text-primary">
                mail
              </span>
              <span>
                You&apos;ll be notified about <strong>learning material fees</strong> closer
                to the class start date.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[18px] text-primary">
                person_add
              </span>
              <span>
                Create your student account when ready to access the full
                platform.
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register?from=reservation"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center font-sans"
            >
              Create Your Account
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-center font-sans"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest font-sans rounded">
              May Intake
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Reserve Your Seat
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Secure your place in our upcoming May intake with a one-time
              reservation fee. Seats are limited — don&apos;t miss out.
            </p>

            {/* Fee Breakdown Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-sans">
                Reservation Fee Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-xl">
                      event_seat
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white font-sans">
                      KSH {seatFee.toLocaleString()} — Seat Reservation
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Locks your seat for the {intakeLabel} intake. This is deducted from
                      your total tuition fee.
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">
                      menu_book
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white font-sans">
                      KSH {matFee.toLocaleString()} — Learning Materials
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {matDeadline ? `Due by ${new Date(matDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}` : "Due before classes begin"}. You&apos;ll be notified 3 weeks
                      before classes begin. Also deducted from total fee.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="space-y-3">
              {[
                {
                  icon: "lock",
                  text: "Your seat is locked once payment is confirmed",
                },
                {
                  icon: "receipt_long",
                  text: "Both fees are deducted from your total tuition",
                },
                {
                  icon: "block",
                  text: "Seat reservation fee is non-refundable",
                },
                {
                  icon: "school",
                  text: `Classes begin in ${intakeLabel} — limited seats available`,
                },
                {
                  icon: "calendar_month",
                  text: "All fees are structured per semester",
                },
                {
                  icon: "credit_score",
                  text: "Tuition payable in installments — min. KES 9,000 per installment",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans mb-1">
                  Your Details
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Fill in your details to reserve your seat.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    error
                  </span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      First Name <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Johann"
                      className="h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Last Name <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Schmidt"
                      className="h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                  </label>
                </div>

                {/* Email */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Email Address <span className="text-red-500">*</span>
                  </span>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="student@email.com"
                      className="w-full h-12 px-4 pl-10 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">
                        mail
                      </span>
                    </div>
                  </div>
                </label>

                {/* Phone */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Phone Number{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </span>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254 700 000 000"
                      className="w-full h-12 px-4 pl-10 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">
                        phone
                      </span>
                    </div>
                  </div>
                </label>

                {/* Program Selection */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Preferred Program
                  </span>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base appearance-none cursor-pointer"
                  >
                    <option value="">Select a program (optional)</option>
                    {PROGRAMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Referral Code */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Referral Code{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          referralCode: e.target.value.toUpperCase(),
                        }))
                      }
                      readOnly={!!refFromUrl}
                      placeholder="e.g. MARK01"
                      className={`w-full h-12 px-4 pl-10 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base uppercase tracking-wider font-mono ${
                        refFromUrl
                          ? "bg-green-50 dark:bg-green-900/20 cursor-not-allowed border-green-300 dark:border-green-700"
                          : "bg-white dark:bg-slate-700"
                      }`}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">
                        {refFromUrl ? "verified" : "link"}
                      </span>
                    </div>
                  </div>
                  {refFromUrl && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Referral code applied from link
                    </span>
                  )}
                </label>

                {/* Terms Notice */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300 space-y-3">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      Total Tuition Fee:
                    </span>
                    <span className="font-bold text-primary text-lg">
                      KES {courseFee.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white font-sans mb-2">
                      By proceeding, you agree that:
                    </p>
                    <ul className="space-y-1 ml-1 text-xs sm:text-sm">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">
                          check
                        </span>
                        <span>
                          The KES {seatFee.toLocaleString()} seat reservation fee is{" "}
                          <strong>non-refundable</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">
                          check
                        </span>
                        <span>
                          This fee locks your seat for the{" "}
                          <strong>{intakeLabel} intake</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">
                          check
                        </span>
                        <span>
                          The fee will be deducted from your total tuition
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">
                        lock
                      </span>
                      Pay KSH {seatFee.toLocaleString()} — Reserve Your Seat
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-4 font-sans">
                Secure payment powered by IntaSend. Your data is encrypted.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}

// Wrapper for Suspense since useSearchParams requires it
export default function ReserveSeatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ReserveSeatContent />
    </Suspense>
  );
}
