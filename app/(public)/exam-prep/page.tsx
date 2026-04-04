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

const examLevels = [
  {
    level: "A1", title: "Start Deutsch 1", gradient: "from-green-400 to-emerald-500",
    components: ["Reading", "Listening", "Writing", "Speaking"],
    duration: "80 minutes total",
    desc: "Foundation level — basic phrases and everyday expressions. Required for family reunification visas.",
  },
  {
    level: "A2", title: "Goethe-Zertifikat A2", gradient: "from-emerald-400 to-teal-500",
    components: ["Reading", "Listening", "Writing", "Speaking"],
    duration: "80 minutes total",
    desc: "Elementary level — simple conversations and frequently used expressions in daily life.",
  },
  {
    level: "B1", title: "Goethe-Zertifikat B1", gradient: "from-blue-400 to-blue-500",
    components: ["Reading", "Listening", "Writing", "Speaking"],
    duration: "165 minutes total",
    desc: "Intermediate level — required for many visa categories, Ausbildung programs, and residence applications.",
  },
  {
    level: "B2", title: "Goethe-Zertifikat B2", gradient: "from-indigo-400 to-indigo-600",
    components: ["Reading", "Listening", "Writing", "Speaking"],
    duration: "190 minutes total",
    desc: "Upper intermediate — required for university admission, professional employment, and advanced training.",
  },
  {
    level: "C1", title: "Goethe-Zertifikat C1", gradient: "from-violet-400 to-purple-600",
    components: ["Reading", "Listening", "Writing", "Speaking"],
    duration: "190 minutes total",
    desc: "Advanced level — required for most degree programs, research positions, and advanced professional roles.",
  },
  {
    level: "C2", title: "Großes Deutsches Sprachdiplom", gradient: "from-purple-400 to-fuchsia-600",
    components: ["Reading", "Listening", "Writing", "Speaking"],
    duration: "195 minutes total",
    desc: "Mastery level — near-native proficiency for academic research, teaching, and professional leadership.",
  },
];

const examStructure = [
  { icon: "menu_book", title: "Reading (Lesen)", desc: "Comprehension of various text types — articles, emails, advertisements, and academic texts.", color: "bg-blue-500" },
  { icon: "headphones", title: "Listening (Hören)", desc: "Understanding dialogues, announcements, lectures, and conversations at natural speed.", color: "bg-purple-500" },
  { icon: "edit_note", title: "Writing (Schreiben)", desc: "Producing structured texts — letters, essays, reports, and formal correspondence.", color: "bg-emerald-500" },
  { icon: "record_voice_over", title: "Speaking (Sprechen)", desc: "Interactive tasks — presentations, discussions, negotiations, and spontaneous conversation.", color: "bg-orange-500" },
];

const prepFeatures = [
  { icon: "quiz", title: "Practice Examinations", desc: "Full-length mock exams that simulate real Goethe exam conditions." },
  { icon: "mic", title: "Speaking Simulations", desc: "One-on-one speaking practice with exam-format questions and timed responses." },
  { icon: "headphones", title: "Listening Training", desc: "Extensive audio exercises with native speakers at exam-standard pace." },
  { icon: "psychology", title: "Exam Strategies", desc: "Time management techniques, common pitfalls, and scoring optimization tips." },
  { icon: "grading", title: "Detailed Feedback", desc: "Individual feedback on every practice attempt with improvement suggestions." },
  { icon: "calendar_month", title: "Structured Schedule", desc: "Systematic preparation timeline aligned with exam registration dates." },
];

export default function ExamPrepPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-600 to-violet-700" />
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-white">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold mb-6 font-display">
              <span className="material-symbols-outlined text-lg">workspace_premium</span>
              Goethe-Institut Certified
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display">
              Goethe Exam Preparation
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Focused preparation for internationally recognized German language exams administered by the Goethe-Institut. Our courses are designed to maximize your exam performance.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/reserve-seat" className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all hover:-translate-y-0.5 font-display">
                Start Exam Prep
              </Link>
              <Link href="/courses" className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">
                View All Courses
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Exam Structure */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold mb-4 font-display">
              Exam Structure
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-display">
              Four Components of Every Exam
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              All Goethe exams test four core language skills. Our preparation program covers each one systematically.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {examStructure.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 text-center"
              >
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-white text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Levels */}
      <section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 font-display">
              All Levels
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-display">
              Preparation for Every Level
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {examLevels.map((exam, i) => (
              <motion.div
                key={exam.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className={`h-1.5 bg-gradient-to-r ${exam.gradient}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exam.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white font-extrabold text-lg font-display">{exam.level}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{exam.duration}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">{exam.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{exam.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {exam.components.map((c) => (
                      <span key={c} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prep Features */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-semibold mb-4 font-display">
              Our Preparation Program
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-display">
              How We Prepare You
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {prepFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group flex gap-4 items-start p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 shrink-0 bg-primary/5 dark:bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-primary group-hover:text-white text-xl transition-colors">{f.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 font-display">{f.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Goethe-Institut Nairobi */}
      <section className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 lg:p-12 border border-slate-100 dark:border-slate-700 shadow-lg">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-display">
              Goethe-Institut Nairobi
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-6">
              Students preparing for exams at the Goethe-Institut Nairobi can use our courses to strengthen their skills and confidence. Our curriculum is specifically designed to align with Goethe exam formats and requirements.
            </p>
            <Link href="/reserve-seat" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors font-display">
              <span className="material-symbols-outlined text-lg">school</span>
              Begin Your Preparation
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-primary via-indigo-600 to-violet-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">Ready to Pass Your Goethe Exam?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our focused preparation program gives you the skills, practice, and confidence to succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserve-seat" className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display">
              Reserve Your Seat
            </Link>
            <Link href="/courses" className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
