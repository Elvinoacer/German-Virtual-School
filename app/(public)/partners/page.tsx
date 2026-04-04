"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Users,
  Award,
  Briefcase,
} from "lucide-react";

type JoinFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const joinFields: Array<{
  label: string;
  type: "text" | "email" | "tel";
  key: keyof JoinFormData;
  ph: string;
  required: boolean;
}> = [
  {
    label: "Full Name",
    type: "text",
    key: "name",
    ph: "e.g. John Doe",
    required: true,
  },
  {
    label: "Email Address",
    type: "email",
    key: "email",
    ph: "john@example.com",
    required: true,
  },
  {
    label: "Phone Number",
    type: "tel",
    key: "phone",
    ph: "+254 7XX XXX XXX",
    required: true,
  },
];

export default function PartnersLandingPage() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState<JoinFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [joinSubmitted, setJoinSubmitted] = useState(false);

  const openJoinModal = () => {
    setJoinSubmitted(false);
    setShowJoinModal(true);
  };

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingJoin(true);
    try {
      const { data } = await axios.post("/api/marketer/join", joinForm);
      if (data?.success) {
        setJoinSubmitted(true);
        return;
      }
      toast.error("Failed to submit request.");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { error?: string })?.error ||
          "Failed to submit request."
        : "Failed to submit request.";
      toast.error(message);
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-6 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
          Now Open for Registration
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Partner with <span className="text-primary">GVS</span> and Earn by
          Empowering Students
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
        >
          Join the German Virtual School affiliate program. Help students
          discover world-class German education and earn generous commissions
          for every successful enrollment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <button
            onClick={openJoinModal}
            className="inline-flex justify-center items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            Apply to be a Partner <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            href="/marketer/login"
            className="inline-flex justify-center items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-8 py-4 text-base font-bold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Partner Login <Briefcase className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            How the Partner Program Works
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Simple, transparent, and rewarding.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-linear-to-r from-blue-100 via-blue-500 to-blue-100 dark:from-slate-800 dark:via-blue-500 dark:to-slate-800"></div>

          {[
            {
              step: "01",
              title: "Join the Network",
              desc: "Apply to become a verified partner and get access to your personalized dashboard and unique tracking links.",
              icon: Users,
            },
            {
              step: "02",
              title: "Share & Promote",
              desc: "Share your tracking link with students interested in learning German. Track clicks and leads in real-time.",
              icon: Award,
            },
            {
              step: "03",
              title: "Earn Commissions",
              desc: "Earn $5 when they reserve a seat, and an additional $15 when they complete full payment.",
              icon: DollarSign,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none text-center z-10 hover:-translate-y-1 transition-transform"
            >
              <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-primary ring-1 ring-blue-100 dark:ring-blue-800">
                <item.icon className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold tracking-widest text-primary uppercase mb-2 block">
                Step {item.step}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-slate-50 dark:bg-slate-800/50 mt-32 py-24 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Why Partner with Us?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                We believe in growing together. Our partner program is designed
                to provide you with the best tools, seamless tracking, and
                reliable payouts.
              </p>

              <ul className="space-y-6">
                {[
                  "Generous tiered commission structure (Reservation + Full Enrollment)",
                  "30-day cookie tracking window to ensure you get credited",
                  "Real-time dashboard to monitor clicks, leads, and earnings",
                  "Fast payouts directly to your bank or card account",
                  "High conversion rates due to our premium course quality",
                ].map((benefit, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 shrink-0" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-purple-500/20 blur-3xl rounded-full"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Potential Earning
                    </p>
                    <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                      $20
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Per successful student enrollment
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="font-medium dark:text-slate-300">
                        Reservation Payment
                      </span>
                    </div>
                    <span className="font-bold dark:text-white">$5</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="font-medium dark:text-slate-300">
                        Full Course Payment
                      </span>
                    </div>
                    <span className="font-bold dark:text-white">$15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 text-center pb-20">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Ready to Start Earning?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
          We are currently accepting new partners. Write to our administration
          to get your unique referral code set up.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={openJoinModal}
            className="inline-flex justify-center items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-8 py-4 text-base font-bold text-white dark:text-slate-900 shadow-xl hover:scale-105 transition-all"
          >
            Submit Join Request
          </button>
          <a
            href="mailto:partners@germanvirtualschool.com?subject=Partner%20Application"
            className="inline-flex justify-center items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Email Administration
          </a>
        </div>
      </section>

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-slate-100 dark:border-slate-800"
          >
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="w-12 h-12 bg-linear-to-br from-primary to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl">
                handshake
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 font-display">
              Partner with Us
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Submit your details and our team will set up your marketing
              account.
            </p>

            {joinSubmitted ? (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
                <span className="material-symbols-outlined text-4xl mb-2 text-green-500">
                  check_circle
                </span>
                <p className="font-bold font-display">Request Sent!</p>
                <p className="text-sm mt-1">
                  We will be in touch shortly via email.
                </p>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors font-display"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                {joinFields.map(({ label, type, key, ph, required }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {label} {required && "*"}
                    </label>
                    <input
                      type={type}
                      required={required}
                      value={joinForm[key]}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, [key]: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                      placeholder={ph}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    How do you plan to refer students?
                  </label>
                  <textarea
                    rows={3}
                    value={joinForm.message}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, message: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white resize-none"
                    placeholder="e.g. I run a student community on social media..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingJoin}
                  className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center font-display"
                >
                  {isSubmittingJoin ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
