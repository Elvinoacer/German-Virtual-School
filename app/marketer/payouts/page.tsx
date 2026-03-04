"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { FileText } from "lucide-react";

interface CommissionSummary {
  studentName: string | null;
  amount: number;
  type: string;
}

interface Payout {
  id: string;
  amount: number;
  transactionReference: string | null;
  payoutMethod: "MPESA" | "BANK" | null;
  note: string | null;
  paidAt: string;
  commissions: CommissionSummary[];
}

export default function MarketerPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const { data } = await axios.get("/api/marketer/payouts");
        if (data.success) {
          setPayouts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch payouts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

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
          Payout History
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          A historical log of all successfully processed commission payouts.
        </p>
      </motion.div>

      {payouts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Payouts Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Once you earn commissions and the administration processes your payment, the receipt details will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {payouts.map((payout, i) => (
            <motion.div
              key={payout.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      KES {Number(payout.amount).toLocaleString()}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                      PAID
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Processed on {format(new Date(payout.paidAt), 'MMMM do, yyyy')}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1 md:text-right text-sm">
                  {payout.transactionReference && (
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Ref:</span> <span className="font-mono">{payout.transactionReference}</span>
                    </p>
                  )}
                  {payout.payoutMethod && (
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Method:</span> <span className="font-semibold">{payout.payoutMethod}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">Commissions Included in this Payout</p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {payout.commissions.map((comm, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-sm border border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{comm.studentName || 'Unknown'}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-slate-500 text-xs">{comm.type === 'RESERVATION' ? 'Reservation' : 'Full Course'}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">KES {Number(comm.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
