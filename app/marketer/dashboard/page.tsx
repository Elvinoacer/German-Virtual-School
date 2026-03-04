"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

interface DashboardData {
  marketer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    referralUrl: string;
  };
  stats: {
    totalStudentsReferred: number;
    totalReservationsPaid: number;
    totalFullPayments: number;
    totalCommissionEarned: number;
    totalCommissionPaid: number;
    outstandingBalance: number;
    totalClicks: number;
    conversionRate: number;
  };
  students: {
    name: string;
    email: string;
    reservationPaid: boolean;
    fullFeePaid: boolean;
    status: string;
    commission: number;
  }[];
  commissions: {
    reservation: { count: number; ratePerStudent: number; total: number };
    fullPayment: { count: number; ratePerStudent: number; total: number };
    totalEarned: number;
  };
  payouts: {
    id: string;
    amount: number;
    note: string | null;
    paidAt: string;
    studentsCovered: string[];
  }[];
}

function StatCard({
  icon,
  label,
  value,
  color = "primary",
}: {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    slate: "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function MarketerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await axios.get("/api/marketer/dashboard");
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const copyReferralLink = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.marketer.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = data.marketer.referralUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-500">
        Failed to load dashboard data.
      </div>
    );
  }

  const { marketer, stats, students, commissions, payouts } = data;

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Welcome, {marketer.firstName}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s your referral performance overview.
        </p>
      </motion.div>

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-200 mb-1">
              Your Referral Link
            </p>
            <p className="text-xs text-blue-100 break-all font-mono bg-white/10 rounded-lg px-3 py-2">
              {marketer.referralUrl}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-blue-200">Code</p>
              <p className="font-bold text-lg tracking-widest font-mono">
                {marketer.referralCode}
              </p>
            </div>
            <button
              onClick={copyReferralLink}
              className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Section 1: Overview Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            analytics
          </span>
          Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon="group"
            label="Students Referred"
            value={stats.totalStudentsReferred}
            color="primary"
          />
          <StatCard
            icon="event_seat"
            label="Reservations Paid"
            value={stats.totalReservationsPaid}
            color="green"
          />
          <StatCard
            icon="ads_click"
            label="Total Clicks"
            value={stats.totalClicks || 0}
            color="purple"
          />
          <StatCard
            icon="trending_up"
            label="Conversion"
            value={`${(stats.conversionRate || 0).toFixed(1)}%`}
            color="blue"
          />
          <StatCard
            icon="payments"
            label="Full Payments"
            value={stats.totalFullPayments}
            color="purple"
          />
          <StatCard
            icon="savings"
            label="Total Earned"
            value={fmt(stats.totalCommissionEarned)}
            color="green"
          />
          <StatCard
            icon="account_balance"
            label="Total Paid"
            value={fmt(stats.totalCommissionPaid)}
            color="slate"
          />
          <StatCard
            icon="account_balance_wallet"
            label="Outstanding"
            value={fmt(stats.outstandingBalance)}
            color="amber"
          />
        </div>
      </motion.div>

      {/* Section 2: Student Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            people
          </span>
          Student Breakdown
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {students.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">
                person_search
              </span>
              No students referred yet. Share your referral link to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      Student
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      Reservation
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      Full Fee
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      Commission
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map((student, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            student.reservationPaid
                              ? "text-green-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {student.reservationPaid
                            ? "check_circle"
                            : "radio_button_unchecked"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            student.fullFeePaid
                              ? "text-green-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {student.fullFeePaid
                            ? "check_circle"
                            : "radio_button_unchecked"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === "Full Payment Complete"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : student.status === "Reservation Paid"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                        {fmt(student.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Section 3: Commission Calculation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            calculate
          </span>
          Commission Breakdown
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Reservation Commissions
                </p>
                <p className="text-sm text-slate-500">
                  {commissions.reservation.count} confirmed ×{" "}
                  {fmt(commissions.reservation.ratePerStudent)}
                </p>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {fmt(commissions.reservation.total)}
              </p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Full Payment Bonuses
                </p>
                <p className="text-sm text-slate-500">
                  {commissions.fullPayment.count} confirmed ×{" "}
                  {fmt(commissions.fullPayment.ratePerStudent)}
                </p>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {fmt(commissions.fullPayment.total)}
              </p>
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Total Earned
              </p>
              <p className="text-2xl font-black text-green-600 dark:text-green-400">
                {fmt(commissions.totalEarned)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 4: Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            receipt_long
          </span>
          Payment History
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {payouts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">
                account_balance
              </span>
              No payouts yet. Your commissions will be paid out by the admin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      Date
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      Students Covered
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {payouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-white">
                        {new Date(payout.paidAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {payout.note && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {payout.note}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                        {fmt(payout.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {payout.studentsCovered.join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
