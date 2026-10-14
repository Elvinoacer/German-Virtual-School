"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function GermanForITPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold mb-6 font-display">
              <span className="material-symbols-outlined text-lg">code</span>
              Tech Careers
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display">
              German for IT Professionals
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl">
              Germany's booming tech industry needs skilled IT professionals. Learn German to maximize your career opportunities in Europe's largest tech market.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mt-8">
              <Link href="/register" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 font-display">Start Learning German</Link>
              <Link href="/opportunities/work" className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">Work in Germany</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4 font-display">Why IT in Germany?</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">
                Europe's Largest Tech Market
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4">
                Germany is home to SAP, Siemens, Bosch, and thousands of innovative startups. The IT sector has over 130,000 open positions, with salaries ranging from €50,000–80,000 for experienced professionals.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                While some IT positions accept English-only candidates, knowing German significantly increases your salary potential (20–30% higher) and opens doors to more companies, especially mid-size firms (Mittelstand).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "computer", value: "130K+", label: "Open IT positions" },
                { icon: "payments", value: "€50-80K", label: "Average annual salary" },
                { icon: "translate", value: "B1+", label: "Recommended level" },
                { icon: "trending_up", value: "+30%", label: "Salary boost with German" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center hover:shadow-lg transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">{stat.icon}</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display text-center mb-6">IT Roles in High Demand</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "code", title: "Software Development", desc: "Full-stack, backend, frontend, mobile development" },
                { icon: "cloud", title: "Cloud & DevOps", desc: "AWS, Azure, Kubernetes, CI/CD pipeline management" },
                { icon: "security", title: "Cybersecurity", desc: "Information security, penetration testing, compliance" },
                { icon: "analytics", title: "Data Science & AI", desc: "Machine learning, data engineering, business intelligence" },
                { icon: "devices", title: "IT Consulting", desc: "SAP consulting, digital transformation, ERP systems" },
                { icon: "manage_accounts", title: "IT Project Management", desc: "Scrum Master, Product Owner, technical project leads" },
              ].map((role) => (
                <div key={role.title} className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">{role.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-1">{role.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{role.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">Launch Your IT Career in Germany</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">German language skills give you a massive competitive advantage in Europe's largest tech market.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display">Enroll Now</Link>
            <Link href="/courses" className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">Browse Courses</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
