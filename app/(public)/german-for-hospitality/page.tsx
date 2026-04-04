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

export default function GermanForHospitalityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold mb-6 font-display">
              <span className="material-symbols-outlined text-lg">restaurant</span>
              Hospitality Careers
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display">
              German for Hospitality Workers
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl">
              Germany's hotels, restaurants, and tourism industry needs skilled professionals. Learn German to unlock careers in one of Europe's most visited countries.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mt-8">
              <Link href="/reserve-seat" className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 font-display">Start Learning German</Link>
              <Link href="/opportunities/ausbildung" className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">Ausbildung Programs</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4 font-display">Why Hospitality?</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">
                A Thriving Industry with Opportunities
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4">
                Germany welcomes over 40 million tourists annually. The hospitality sector — hotels, restaurants, catering, and tourism — employs over 2.4 million people and constantly seeks qualified workers.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The Ausbildung system offers particularly strong opportunities in hospitality, with programs like Hotelfachmann/frau (Hotel Specialist) and Restaurantfachmann/frau (Restaurant Specialist) combining practical training with classroom education.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "hotel", value: "2.4M+", label: "Industry employees" },
                { icon: "people", value: "40M+", label: "Annual tourists" },
                { icon: "translate", value: "B1", label: "Minimum required" },
                { icon: "school", value: "2–3yrs", label: "Ausbildung duration" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center hover:shadow-lg transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">{stat.icon}</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display text-center mb-6">Popular Hospitality Roles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "hotel", title: "Hotel Management", desc: "Front desk, guest relations, hotel operations" },
                { icon: "restaurant", title: "Restaurant Service", desc: "Fine dining, catering, food & beverage management" },
                { icon: "travel_explore", title: "Tourism Management", desc: "Tour guiding, travel agency operations, event planning" },
                { icon: "kitchen", title: "Culinary Arts", desc: "Professional cooking, pastry, kitchen management" },
                { icon: "spa", title: "Wellness & Spa", desc: "Spa management, wellness centers, therapeutic services" },
                { icon: "event", title: "Event Management", desc: "Conference organizing, banquet management, exhibitions" },
              ].map((role) => (
                <div key={role.title} className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">{role.icon}</span>
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

      <section className="py-16 lg:py-20 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">Start Your Hospitality Career in Germany</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">German language skills are essential for hospitality. Start your preparation today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserve-seat" className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display">Reserve Your Seat</Link>
            <Link href="/courses" className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">Browse Courses</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
