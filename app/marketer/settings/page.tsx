"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Copy, Wallet, Check, ChevronRight, User, Phone, Save } from "lucide-react";

export default function MarketerSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [termsSaving, setTermsSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    payoutMethod: "MPESA",
    payoutDetails: {
      accountNumber: "",
      bankName: "",
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: res } = await axios.get("/api/marketer/settings");
      if (res.success) {
        setData(res.data);
        setFormData({
          phone: res.data.phone || "",
          payoutMethod: res.data.payoutMethod || "MPESA",
          payoutDetails: {
            accountNumber: res.data.payoutDetails?.accountNumber || "",
            bankName: res.data.payoutDetails?.bankName || "",
          },
        });
      }
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: res } = await axios.patch("/api/marketer/settings", {
        phone: formData.phone,
        payoutMethod: formData.payoutMethod,
        payoutDetails: formData.payoutDetails,
      });
      if (res.success) {
        toast.success("Settings saved successfully!");
        setData(res.data);
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptTerms = async () => {
    setTermsSaving(true);
    try {
      const { data: res } = await axios.patch("/api/marketer/settings", {
        acceptTerms: true,
      });
      if (res.success) {
        toast.success("Terms accepted successfully!");
        setData(res.data);
      }
    } catch (error) {
      toast.error("Failed to accept terms");
    } finally {
      setTermsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal information and how you get paid.
        </p>
      </motion.div>

      {/* Setup Warnings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {!data.termsAcceptedAt && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-400">
            <span className="material-symbols-outlined mt-0.5">warning</span>
            <div>
              <p className="font-bold">Affiliate Terms not accepted</p>
              <p className="text-sm mt-1">
                You need to accept the Partner Program Terms before you can receive any payouts.
              </p>
              <button
                onClick={handleAcceptTerms}
                disabled={termsSaving}
                className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {termsSaving ? "Accepting..." : "Read & Accept Terms"}
              </button>
            </div>
          </div>
        )}

        {(!data.payoutMethod || !data.payoutDetails?.accountNumber) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 text-blue-800 dark:text-blue-400">
            <span className="material-symbols-outlined mt-0.5">info</span>
            <div>
              <p className="font-bold">Payout details missing</p>
              <p className="text-sm mt-1">
                Please configure your payout method below so we can send your commissions.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
        >
          {/* Profile Section */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={data.firstName}
                  readOnly
                  className="w-full form-input bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={data.lastName}
                  readOnly
                  className="w-full form-input bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={data.email}
                  readOnly
                  className="w-full form-input bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +254712345678"
                  className="w-full form-input bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Payout Section */}
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Payout Configuration
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Preferred Payout Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, payoutMethod: "MPESA" })}
                    className={`flex flex-col items-center p-4 border rounded-xl transition-all ${
                      formData.payoutMethod === "MPESA"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl mb-2">payments</span>
                    <span className="font-bold text-sm">M-Pesa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, payoutMethod: "BANK" })}
                    className={`flex flex-col items-center p-4 border rounded-xl transition-all ${
                      formData.payoutMethod === "BANK"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl mb-2">account_balance</span>
                    <span className="font-bold text-sm">Bank Transfer</span>
                  </button>
                </div>
              </div>

              {formData.payoutMethod === "MPESA" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    M-Pesa Number
                  </label>
                  <input
                    type="text"
                    value={formData.payoutDetails.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutDetails: { ...formData.payoutDetails, accountNumber: e.target.value },
                      })
                    }
                    placeholder="07XX XXX XXX"
                    className="w-full form-input bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Earnings will be sent to this number automatically via IntaSend.
                  </p>
                </div>
              )}

              {formData.payoutMethod === "BANK" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.payoutDetails.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payoutDetails: { ...formData.payoutDetails, bankName: e.target.value },
                        })
                      }
                      placeholder="e.g. Equity Bank"
                      className="w-full form-input bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.payoutDetails.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payoutDetails: { ...formData.payoutDetails, accountNumber: e.target.value },
                        })
                      }
                      placeholder="Enter account number"
                      className="w-full form-input bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Bank transfers may take 2-3 business days to clear.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
