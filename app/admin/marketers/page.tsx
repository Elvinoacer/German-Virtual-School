"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface Marketer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  referralCode: string;
  isActive: boolean;
  createdAt: string;
  totalClicks: number;
  totalStudents: number;
  paidReservations: number;
  fullPayments: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  outstandingCommission: number;
  payoutMethod?: string;
  payoutDetails?: any;
}

interface Totals {
  totalMarketers: number;
  totalStudentsReferred: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  totalOutstanding: number;
}

export default function AdminMarketersPage() {
  const [activeTab, setActiveTab] = useState<"CRM" | "COMMISSIONS" | "PAYOUTS">("CRM");

  // CRM State
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showPayout, setShowPayout] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<Marketer | null>(null);
  const [viewDetail, setViewDetail] = useState<any>(null);
  const [viewDetailLoading, setViewDetailLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [payingOut, setPayingOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", referralCode: "", password: "",
  });

  // Commission State
  const [commissions, setCommissions] = useState<any[]>([]);
  const [commissionsLoading, setCommissionsLoading] = useState(false);

  // Payouts State
  const [payoutsData, setPayoutsData] = useState<any[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  // Create Form State
  const [newMarketer, setNewMarketer] = useState({
    firstName: "", lastName: "", email: "", phone: "", referralCode: "", password: "",
  });

  // Payout Form State
  const [payoutData, setPayoutData] = useState({
    amount: "", transactionReference: "", payoutMethod: "MPESA",
  });

  const fetchMarketers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/marketers");
      if (data.success) {
        setMarketers(data.data.marketers);
        setTotals(data.data.totals);
      }
    } catch (err) {
      console.error("Failed to fetch marketers");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommissions = useCallback(async () => {
    setCommissionsLoading(true);
    try {
      const { data } = await axios.get("/api/admin/commissions");
      if (data.success) setCommissions(data.data);
    } catch (err) {
      console.error("Failed to fetch commissions");
    } finally {
      setCommissionsLoading(false);
    }
  }, []);

  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const { data } = await axios.get("/api/admin/marketers");
      if (data.success) {
        // Extract payout records from all marketers' details
        // We need to fetch each marketer's details to get payout records
        const allPayouts: any[] = [];
        for (const m of data.data.marketers) {
          try {
            const { data: detail } = await axios.get(`/api/admin/marketers/${m.id}`);
            if (detail.success && detail.data?.payouts) {
              for (const p of detail.data.payouts) {
                allPayouts.push({
                  ...p,
                  marketerName: `${m.firstName} ${m.lastName}`,
                  marketerEmail: m.email,
                });
              }
            }
          } catch {
            // skip individual marketer errors
          }
        }
        allPayouts.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
        setPayoutsData(allPayouts);
      }
    } catch (err) {
      console.error("Failed to fetch payouts");
    } finally {
      setPayoutsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "CRM") fetchMarketers();
    if (activeTab === "COMMISSIONS") fetchCommissions();
    if (activeTab === "PAYOUTS") fetchPayouts();
  }, [activeTab, fetchMarketers, fetchCommissions, fetchPayouts]);

  // Actions
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await axios.post("/api/admin/marketers", newMarketer);
      if (data.success) {
        toast.success("Marketer created successfully!");
        setShowCreate(false);
        setNewMarketer({ firstName: "", lastName: "", email: "", phone: "", referralCode: "", password: "" });
        fetchMarketers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create marketer");
    } finally {
      setCreating(false);
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayout) return;
    setPayingOut(true);
    try {
      const { data } = await axios.post(`/api/admin/marketers/${showPayout}/payout`, {
        amount: parseFloat(payoutData.amount),
        transactionReference: payoutData.transactionReference,
        payoutMethod: payoutData.payoutMethod,
      });
      if (data.success) {
        toast.success("Payout recorded successfully!");
        setShowPayout(null);
        setPayoutData({ amount: "", transactionReference: "", payoutMethod: "MPESA" });
        fetchMarketers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to record payout");
    } finally {
      setPayingOut(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await axios.patch(`/api/admin/marketers/${id}`, { isActive: !isActive });
      toast.success(`Marketer ${isActive ? "deactivated" : "activated"}`);
      fetchMarketers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update marketer");
    }
  };

  const openEdit = (m: Marketer) => {
    setEditForm({
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone || "",
      referralCode: m.referralCode,
      password: "",
    });
    setShowEdit(m);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setEditing(true);
    try {
      const payload: any = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        referralCode: editForm.referralCode,
      };
      if (editForm.password) payload.password = editForm.password;
      const { data } = await axios.patch(`/api/admin/marketers/${showEdit.id}`, payload);
      if (data.success) {
        toast.success("Marketer updated successfully!");
        setShowEdit(null);
        fetchMarketers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update marketer");
    } finally {
      setEditing(false);
    }
  };

  const openDetail = async (id: string) => {
    setViewDetailLoading(true);
    setViewDetail(null);
    try {
      const { data } = await axios.get(`/api/admin/marketers/${id}`);
      if (data.success) setViewDetail(data.data);
    } catch {
      toast.error("Failed to load marketer details");
    } finally {
      setViewDetailLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}? This will remove all their clicks, commissions, and payouts. This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const { data } = await axios.delete(`/api/admin/marketers/${id}`);
      if (data.success) {
        toast.success(data.message || "Marketer deleted");
        fetchMarketers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete marketer");
    } finally {
      setDeleting(null);
    }
  };

  const handleVoidCommission = async (id: string) => {
    if (!confirm("Are you sure you want to void this commission?")) return;
    try {
      const { data } = await axios.patch("/api/admin/commissions", { id, status: "VOIDED" });
      if (data.success) {
        toast.success("Commission voided");
        fetchCommissions();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to void commission");
    }
  };

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;
  const appUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL;

  // Render CRM Tab
  const renderCRM = () => (
    <div className="space-y-6">
      {/* Totals Cards */}
      {totals && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Marketers", value: totals.totalMarketers, icon: "groups", color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20" },
            { label: "Students Referred", value: totals.totalStudentsReferred, icon: "group", color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20" },
            { label: "Commission Earned", value: fmt(totals.totalCommissionEarned), icon: "savings", color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20" },
            { label: "Commission Paid", value: fmt(totals.totalCommissionPaid), icon: "account_balance", color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-700/50" },
            { label: "Outstanding", value: fmt(totals.totalOutstanding), icon: "account_balance_wallet", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Marketers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
            <p>Loading marketers...</p>
          </div>
        ) : marketers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 block">handshake</span>
            <p className="font-medium">No marketers yet</p>
            <p className="text-sm mt-1">Click &quot;Add Marketer&quot; to create your first referral partner.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Marketer</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Code</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Clicks</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Students</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Earned</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Paid</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Outstanding</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {marketers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-bold tracking-wider">{m.referralCode}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900 dark:text-white">{m.totalClicks || 0}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900 dark:text-white">{m.totalStudents}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">{fmt(m.totalCommissionEarned)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{fmt(m.totalCommissionPaid)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400">{fmt(m.outstandingCommission)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openDetail(m.id)}
                          className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => openEdit(m)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                          title="Edit Marketer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowPayout(m.id);
                            setPayoutData({ amount: "", transactionReference: "", payoutMethod: m.payoutMethod || "MPESA" });
                          }}
                          className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                          title="Record Payout"
                        >
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                        </button>
                        <button
                          onClick={() => toggleActive(m.id, m.isActive)}
                          className={`p-1.5 rounded-lg transition-colors ${m.isActive ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" : "hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600"}`}
                          title={m.isActive ? "Deactivate" : "Activate"}
                        >
                          <span className="material-symbols-outlined text-[18px]">{m.isActive ? "block" : "check_circle"}</span>
                        </button>
                        <button
                          onClick={() => {
                            const url = `${appUrl}/reserve-seat?ref=${m.referralCode}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Referral link copied!");
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/20 text-slate-500 transition-colors"
                          title="Copy Referral Link"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, `${m.firstName} ${m.lastName}`)}
                          disabled={deleting === m.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-50"
                          title="Delete Marketer"
                        >
                          <span className="material-symbols-outlined text-[18px]">{deleting === m.id ? "hourglass_empty" : "delete"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Render Commissions Tab
  const renderCommissions = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="font-semibold text-slate-900 dark:text-white">All Commissions</h2>
        <button onClick={fetchCommissions} className="text-slate-500 hover:text-primary transition-colors">
          <RefreshCw className={`w-5 h-5 ${commissionsLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {commissionsLoading ? (
        <div className="p-12 text-center text-slate-400">Loading commissions...</div>
      ) : commissions.length === 0 ? (
        <div className="p-12 text-center text-slate-400">No commissions recorded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Marketer</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Amount</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                     <p className="font-medium text-slate-900 dark:text-white">{c.marketer?.firstName} {c.marketer?.lastName}</p>
                     <p className="text-xs text-slate-400">{c.marketer?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                     <p className="font-medium text-slate-900 dark:text-white">{c.studentName}</p>
                     <p className="text-xs text-slate-400">{c.studentEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                    {fmt(c.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === 'EARNED' ? 'bg-amber-100 text-amber-800' :
                      c.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.status === 'EARNED' && (
                      <button 
                        onClick={() => handleVoidCommission(c.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Void
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marketer Partners</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage referral partners and track commissions.</p>
        </div>
        <button
          onClick={() => {
            const randomCode = `MKTR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            setNewMarketer({ ...newMarketer, referralCode: randomCode });
            setShowCreate(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Marketer
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6 flex overflow-x-auto hide-scrollbar">
        <div className="flex space-x-8 px-2">
          {[
            { id: "CRM", label: "Overview & Marketers" },
            { id: "COMMISSIONS", label: "Commission Queue" },
            { id: "PAYOUTS", label: "Payout History" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "CRM" && renderCRM()}
      {activeTab === "COMMISSIONS" && renderCommissions()}
      {activeTab === "PAYOUTS" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900 dark:text-white">Payout History</h2>
            <button onClick={fetchPayouts} className="text-slate-500 hover:text-primary transition-colors">
              <RefreshCw className={`w-5 h-5 ${payoutsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {payoutsLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
              <p>Loading payouts...</p>
            </div>
          ) : payoutsData.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 block">history</span>
              <p className="font-medium">No payouts recorded yet</p>
              <p className="text-sm mt-1">Record a payout from the CRM tab to see it here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Marketer</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Amount</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Method</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Transaction Ref</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {payoutsData.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{p.marketerName}</p>
                        <p className="text-xs text-slate-400">{p.marketerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                        {fmt(Number(p.amount))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {p.payoutMethod || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs uppercase">
                        {p.transactionReference || '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500 text-xs">
                        {new Date(p.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">
                        {p.note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals remain mostly the same, placed outside tab content */}
      <AnimatePresence>
        {showCreate && (
           <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={() => setShowCreate(false)}
           >
             <motion.div
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg"
             >
               <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary">person_add</span> Add New Marketer
               </h2>
               <form onSubmit={handleCreate} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <label className="flex flex-col gap-1">
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name *</span>
                     <input type="text" required value={newMarketer.firstName} onChange={(e) => setNewMarketer({ ...newMarketer, firstName: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 w-full rounded-lg" />
                   </label>
                   <label className="flex flex-col gap-1">
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name *</span>
                     <input type="text" required value={newMarketer.lastName} onChange={(e) => setNewMarketer({ ...newMarketer, lastName: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 w-full rounded-lg" />
                   </label>
                 </div>
                 <label className="flex flex-col gap-1">
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</span>
                   <input type="email" required value={newMarketer.email} onChange={(e) => setNewMarketer({ ...newMarketer, email: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 w-full rounded-lg" />
                 </label>
                 <label className="flex flex-col gap-1">
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</span>
                   <input type="text" value={newMarketer.phone} onChange={(e) => setNewMarketer({ ...newMarketer, phone: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 w-full rounded-lg" />
                 </label>
                 <div className="flex flex-col gap-1">
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Referral Code *</span>
                   <div className="flex gap-2">
                     <input type="text" required value={newMarketer.referralCode} onChange={(e) => setNewMarketer({ ...newMarketer, referralCode: e.target.value.toUpperCase() })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 uppercase flex-1 rounded-lg" placeholder="e.g. MKTR-4B9A" />
                     <button
                       type="button"
                       onClick={async () => {
                         try {
                           const { data } = await axios.get("/api/admin/marketers/generate-code");
                           if (data.success) {
                             setNewMarketer((prev: any) => ({ ...prev, referralCode: data.code }));
                           }
                         } catch {
                           toast.error("Failed to generate code");
                         }
                       }}
                       className="px-3 h-10 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-white text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors whitespace-nowrap flex items-center gap-1"
                     >
                       <span className="material-symbols-outlined text-[16px]">autorenew</span>
                       Generate
                     </button>
                   </div>
                 </div>
                 <label className="flex flex-col gap-1">
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Password *</span>
                   <input type="password" required value={newMarketer.password} onChange={(e) => setNewMarketer({ ...newMarketer, password: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 w-full rounded-lg" />
                 </label>
                 <div className="flex gap-3 pt-2">
                   <button type="button" onClick={() => setShowCreate(false)} className="flex-1 h-10 border rounded-xl">Cancel</button>
                   <button type="submit" disabled={creating} className="flex-1 h-10 bg-primary text-white font-bold rounded-xl">{creating ? "Creating..." : "Create Marketer"}</button>
                 </div>
               </form>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayout && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPayout(null)}
          >
            <motion.div
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                 <span className="material-symbols-outlined text-green-600">payments</span> Record Payout
              </h2>
              {(() => {
                const m = marketers.find((m) => m.id === showPayout);
                if (!m) return null;
                return (
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-sm border">
                    <p className="font-medium text-slate-900 dark:text-white">{m.firstName} {m.lastName}</p>
                    <p className="text-slate-500">Outstanding: <span className="font-bold text-amber-600">{fmt(m.outstandingCommission)}</span></p>
                    {m.payoutMethod === 'MPESA' && m.payoutDetails?.accountNumber && (
                       <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                          M-Pesa: {m.payoutDetails.accountNumber}
                       </p>
                    )}
                    {m.payoutMethod === 'BANK' && m.payoutDetails?.accountNumber && (
                       <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">account_balance</span>
                          Bank: {m.payoutDetails.bankName} - {m.payoutDetails.accountNumber}
                       </p>
                    )}
                  </div>
                );
              })()}
              <form onSubmit={handlePayout} className="space-y-4">
                 <label className="flex flex-col gap-1">
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Payout Method</span>
                   <select 
                     value={payoutData.payoutMethod} 
                     onChange={e => setPayoutData({...payoutData, payoutMethod: e.target.value})}
                     className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 w-full rounded-lg"
                   >
                     <option value="MPESA">M-Pesa</option>
                     <option value="BANK">Bank Transfer</option>
                     <option value="CASH">Cash</option>
                   </select>
                 </label>
                 <label className="flex flex-col gap-1">
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount (KES) *</span>
                   <input type="number" required min="1" value={payoutData.amount} onChange={(e) => setPayoutData({ ...payoutData, amount: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 w-full rounded-lg" />
                 </label>
                 <label className="flex flex-col gap-1">
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Transaction Ref. (e.g. M-Pesa Code) *</span>
                   <input type="text" required value={payoutData.transactionReference} onChange={(e) => setPayoutData({ ...payoutData, transactionReference: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 uppercase w-full rounded-lg" />
                 </label>
                 <div className="flex gap-3 mt-6">
                   <button type="button" onClick={() => setShowPayout(null)} className="flex-1 h-10 border rounded-xl">Cancel</button>
                   <button type="submit" disabled={payingOut} className="flex-1 h-10 bg-green-600 text-white font-bold rounded-xl">{payingOut ? "Processing..." : "Record Payout"}</button>
                 </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Marketer Modal */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEdit(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span> Edit Marketer
              </h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name *</span>
                    <input type="text" required value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white w-full rounded-lg" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name *</span>
                    <input type="text" required value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white w-full rounded-lg" />
                  </label>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</span>
                  <input type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white w-full rounded-lg" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</span>
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white w-full rounded-lg" />
                </label>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Referral Code *</span>
                  <div className="flex gap-2">
                    <input type="text" required value={editForm.referralCode} onChange={(e) => setEditForm({ ...editForm, referralCode: e.target.value.toUpperCase() })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white uppercase flex-1 rounded-lg" />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { data } = await axios.get("/api/admin/marketers/generate-code");
                          if (data.success) setEditForm((prev) => ({ ...prev, referralCode: data.code }));
                        } catch { toast.error("Failed to generate code"); }
                      }}
                      className="px-3 h-10 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-white text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors whitespace-nowrap flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">autorenew</span>
                      Generate
                    </button>
                  </div>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password <span className="text-xs text-slate-400">(leave blank to keep current)</span></span>
                  <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="form-input bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white w-full rounded-lg" placeholder="••••••••" />
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowEdit(null)} className="flex-1 h-10 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={editing} className="flex-1 h-10 bg-primary text-white font-bold rounded-xl">{editing ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {(viewDetail || viewDetailLoading) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => { setViewDetail(null); setViewDetailLoading(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              {viewDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-slate-500">Loading marketer details...</p>
                </div>
              ) : viewDetail ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      {viewDetail.firstName} {viewDetail.lastName}
                    </h2>
                    <button
                      onClick={() => setViewDetail(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "Email", value: viewDetail.email, icon: "mail" },
                      { label: "Phone", value: viewDetail.phone || "Not provided", icon: "phone" },
                      { label: "Referral Code", value: viewDetail.referralCode, icon: "tag" },
                      { label: "Status", value: viewDetail.isActive ? "Active" : "Inactive", icon: "toggle_on" },
                      { label: "Total Clicks", value: viewDetail.totalClicks || 0, icon: "ads_click" },
                      { label: "Joined", value: new Date(viewDetail.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), icon: "calendar_today" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">{item.icon}</span>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payout Settings */}
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800/30">
                    <h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                      Payout Settings
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>Method:</strong> {viewDetail.payoutMethod || "Not configured"} &nbsp;|&nbsp;
                      <strong>Details:</strong> {viewDetail.payoutDetails ? JSON.stringify(viewDetail.payoutDetails) : "Not set"}
                    </p>
                    {viewDetail.termsAcceptedAt && (
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                        Terms accepted: {new Date(viewDetail.termsAcceptedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Referred Students */}
                  {viewDetail.seatReservations?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-blue-500">group</span>
                        Referred Students ({viewDetail.seatReservations.length})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium text-slate-500">Student</th>
                              <th className="text-left px-3 py-2 font-medium text-slate-500">Program</th>
                              <th className="text-center px-3 py-2 font-medium text-slate-500">Status</th>
                              <th className="text-right px-3 py-2 font-medium text-slate-500">Amount</th>
                              <th className="text-right px-3 py-2 font-medium text-slate-500">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {viewDetail.seatReservations.map((s: any) => (
                              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="px-3 py-2">
                                  <p className="font-medium text-slate-900 dark:text-white">{s.firstName} {s.lastName}</p>
                                  <p className="text-slate-400">{s.email}</p>
                                </td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{s.program}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold ${s.status === "PAID" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                                    {s.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-white">KES {Number(s.amount).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-slate-400">{new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Recent Commissions */}
                  {viewDetail.commissions?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-amber-500">monetization_on</span>
                        Commissions ({viewDetail.commissions.length})
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {viewDetail.commissions.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-xs">
                            <div>
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold mr-2 ${c.type === "RESERVATION" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                                {c.type}
                              </span>
                              <span className="text-slate-500">{c.studentName} • {c.studentEmail}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${c.status === "VOIDED" ? "text-red-500 line-through" : "text-green-600 dark:text-green-400"}`}>
                                KES {Number(c.amount).toLocaleString()}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.status === "EARNED" ? "bg-yellow-100 text-yellow-700" : c.status === "PAID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {c.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Payouts */}
                  {viewDetail.payouts?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-green-500">payments</span>
                        Payouts ({viewDetail.payouts.length})
                      </h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {viewDetail.payouts.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">{p.payoutMethod || "N/A"}</span>
                              {p.transactionReference && <span className="font-mono text-slate-400">#{p.transactionReference}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900 dark:text-white">KES {Number(p.amount).toLocaleString()}</span>
                              <span className="text-slate-400">{new Date(p.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
