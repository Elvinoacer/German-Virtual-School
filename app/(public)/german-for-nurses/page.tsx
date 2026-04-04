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

export default function GermanForNursesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold mb-6 font-display">
              <span className="material-symbols-outlined text-lg">medical_services</span>
              Healthcare Careers
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display">
              German Language for Nurses
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl">
              Germany has a critical shortage of nursing professionals. Learn the German language skills required to start your nursing career in one of Europe's best healthcare systems.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mt-8">
              <Link href="/reserve-seat" className="px-6 py-3 bg-white text-rose-600 font-bold rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 font-display">
                Start Learning German
              </Link>
              <Link href="/opportunities/work" className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">
                Work in Germany
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4 font-display">Why Nursing in Germany?</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">
                High Demand for International Nurses
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4">
                Germany faces a shortage of over 200,000 nurses. The government actively recruits qualified nursing professionals from around the world, offering competitive salaries starting at €2,800–3,500/month.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To work as a nurse in Germany, you need B1–B2 German proficiency and professional language certification (Fachsprachprüfung). Our courses prepare you for both general and medical German communication.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "payments", value: "€2,800+", label: "Starting monthly salary" },
                { icon: "translate", value: "B1–B2", label: "Required language level" },
                { icon: "trending_up", value: "200K+", label: "Nursing positions open" },
                { icon: "workspace_premium", value: "100%", label: "Recognition pathway" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center hover:shadow-lg transition-all">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-xl">{stat.icon}</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display text-center mb-6">Your Path to Nursing in Germany</h3>
            {[
              { step: "1", title: "Learn German (B1–B2)", desc: "Complete our structured German courses to reach the required proficiency level for healthcare professionals." },
              { step: "2", title: "Get Qualifications Recognized", desc: "Apply for recognition of your nursing qualification through the Anerkennungsverfahren process." },
              { step: "3", title: "Pass Fachsprachprüfung", desc: "Complete the professional language exam specifically for healthcare workers." },
              { step: "4", title: "Apply for Work Visa", desc: "With recognized qualifications and language certification, apply for your Skilled Worker Visa." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg">
                  <span className="text-white font-extrabold font-display">{item.step}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-display">{item.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">Start Your Nursing Career in Germany</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">German language proficiency is the first requirement. Start your preparation today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserve-seat" className="px-8 py-4 bg-white text-rose-600 font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display">Reserve Your Seat</Link>
            <Link href="/courses" className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">Browse Courses</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
