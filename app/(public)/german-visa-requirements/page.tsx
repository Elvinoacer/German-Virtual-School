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

const visaTypes = [
  {
    title: "Family Reunification Visa",
    level: "A1",
    gradient: "from-green-400 to-emerald-500",
    desc: "Required for joining a spouse or family member in Germany. Basic German communication is sufficient.",
    details: ["Goethe-Zertifikat A1 or equivalent", "Must be obtained before visa application", "Some exceptions for highly skilled workers' dependents"],
  },
  {
    title: "Student Visa",
    level: "B2–C1",
    gradient: "from-blue-400 to-indigo-500",
    desc: "For degree programs at German universities. Level depends on the language of instruction.",
    details: ["German-taught programs: B2 or C1 (DSH-2 / TestDaF 4x4)", "English-taught programs: IELTS/TOEFL (B1 German recommended)", "Foundation year (Studienkolleg): B1 minimum"],
  },
  {
    title: "Skilled Worker Visa",
    level: "B1–B2",
    gradient: "from-violet-400 to-purple-500",
    desc: "For qualified professionals with recognized qualifications and a German job offer.",
    details: ["B1 for many technical and trade positions", "B2 for client-facing and regulated professions", "Level may vary by federal state and profession"],
  },
  {
    title: "Ausbildung (Training) Visa",
    level: "B1",
    gradient: "from-amber-400 to-orange-500",
    desc: "For vocational training programs in Germany's dual education system.",
    details: ["B1 minimum for most training programs", "B2 gives significant advantages in applications", "Must be certified (Goethe, telc, or ÖSD)"],
  },
  {
    title: "Job Seeker Visa",
    level: "B1+",
    gradient: "from-rose-400 to-pink-500",
    desc: "Allows qualified professionals to enter Germany for 6 months to find employment.",
    details: ["No specific language requirement but B1+ strongly recommended", "Helps in interviews and daily life", "Higher level = better job prospects"],
  },
  {
    title: "Permanent Residency / Citizenship",
    level: "B1",
    gradient: "from-slate-400 to-slate-600",
    desc: "After living in Germany for several years, language is required for permanent status.",
    details: ["Permanent residency (Niederlassungserlaubnis): B1 certificate", "Citizenship (Einbürgerung): B1 + integration course completion", "Higher levels may shorten waiting periods"],
  },
];

export default function GermanVisaRequirementsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold mb-6 font-display">
              <span className="material-symbols-outlined text-lg">gavel</span>
              Immigration Requirements
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display">
              German Language Requirements for Germany Visa
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              A comprehensive guide to the German language certificates required for different visa types. Know exactly what level you need before you apply.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold mb-4 font-display">Visa Type Breakdown</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-display">Language Requirements by Visa Type</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Each visa category has specific language requirements. Here's what you need to know.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visaTypes.map((visa, i) => (
              <motion.div
                key={visa.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className={`h-1.5 bg-gradient-to-r ${visa.gradient}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display pr-2">{visa.title}</h3>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full bg-gradient-to-r ${visa.gradient} text-white font-display shrink-0`}>
                      {visa.level}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{visa.desc}</p>
                  <ul className="space-y-2">
                    {visa.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-primary text-sm shrink-0 mt-0.5">check_circle</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 lg:p-12 border border-slate-100 dark:border-slate-700 shadow-lg text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">school</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-display">
              Accepted Certificates
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-6">
              German embassies and institutions accept certificates from recognized testing organizations. Our courses prepare you specifically for these exams.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Goethe-Institut", "telc", "ÖSD", "TestDaF", "DSH"].map((cert) => (
                <span key={cert} className="px-4 py-2 bg-primary/5 dark:bg-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/10">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gradient-to-r from-primary via-indigo-600 to-violet-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">Get the Certificate You Need</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">German Virtual School prepares you for every level — from A1 to C2. Start your preparation today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserve-seat" className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display">Reserve Your Seat</Link>
            <Link href="/exam-prep" className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display">Exam Preparation</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
