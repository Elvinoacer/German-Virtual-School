"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface Commission {
  id: string;
  studentName: string | null;
  studentEmail: string | null;
  type: "RESERVATION" | "FULL_PAYMENT";
  amount: number;
  status: "EARNED" | "PAID" | "VOIDED";
  createdAt: string;
}

export default function MarketerReferralsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const { data } = await axios.get("/api/marketer/commissions");
        if (data.success) {
          setCommissions(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch commissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  const StatusBadge = ({ status }: { status: Commission["status"] }) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </span>
        );
      case "EARNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "VOIDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full border border-red-200 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5" /> Voided
          </span>
        );
    }
  };

  const TypeBadge = ({ type }: { type: Commission["type"] }) => {
    if (type === "RESERVATION") {
      return <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">Reservation</span>;
    }
    return <span className="text-purple-600 dark:text-purple-400 font-medium text-sm">Full Course</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          My Referrals
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          A complete log of every student you have successfully referred.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No referrals yet. Share your link to get started!
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {format(new Date(comm.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{comm.studentName || 'Unknown Student'}</p>
                      <p className="text-xs text-slate-500">{comm.studentEmail}</p>
                    </td>
                    <td className="p-4">
                      <TypeBadge type={comm.type} />
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      KES {Number(comm.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={comm.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
