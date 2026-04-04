"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const sections = [
  {
    id: "why",
    badge: "Why Study in Germany",
    title: "Strategically Valuable for Your Future",
    content: [
      "Germany is not just affordable — it is strategically valuable. You graduate with internationally recognized qualifications, gain access to the European job market, and build long-term career stability.",
      "With over 400 universities and more than 20,000 study programs, Germany offers an unparalleled range of academic choices for international students.",
    ],
    features: [
      { icon: "verified", text: "Internationally recognized qualifications" },
      { icon: "public", text: "Access to the European job market" },
      { icon: "trending_up", text: "Long-term career stability" },
      { icon: "school", text: "400+ universities to choose from" },
    ],
  },
  {
    id: "requirements",
    badge: "Requirements",
    title: "Requirements for International Students",
    content: [
      "Each university may vary in specific requirements, but the structure is predictable. Preparing these documents early significantly improves your chances of admission.",
    ],
    features: [
      {
        icon: "description",
        text: "Recognized academic qualifications (transcripts, diplomas)",
      },
      {
        icon: "account_balance",
        text: "Proof of financial means (blocked account ~€11,208/year)",
      },
      { icon: "health_and_safety", text: "Health insurance coverage" },
      { icon: "translate", text: "German or English language certification" },
    ],
  },
  {
    id: "scholarships",
    badge: "Scholarships",
    title: "Scholarships for African Students",
    content: [
      "There are multiple funding opportunities for African students, including those from DAAD (German Academic Exchange Service), the largest funding organization for international academic exchange.",
      "Competition is high — preparation matters. Strong language skills and academic performance significantly improve your chances.",
    ],
    features: [
      {
        icon: "school",
        text: "DAAD scholarships cover tuition (if applicable)",
      },
      { icon: "home", text: "Living expense allowances" },
      { icon: "flight", text: "Travel cost coverage" },
      { icon: "emoji_events", text: "Merit-based selection criteria" },
    ],
  },
  {
    id: "language",
    badge: "Language Requirements",
    title: "German Language Requirements for Study",
    content: [
      "Without the right language level, your options become severely limited. Most programs require certified proof of German proficiency. The exact level depends on your chosen program and pathway.",
    ],
    features: [
      {
        icon: "signal_cellular_1_bar",
        text: "A2–B1: Basic access pathways and foundation programs",
      },
      {
        icon: "signal_cellular_3_bar",
        text: "B2: Required by many universities for direct admission",
      },
      {
        icon: "signal_cellular_4_bar",
        text: "C1: Required for most academic and research programs",
      },
      {
        icon: "workspace_premium",
        text: "TestDaF / DSH: Standard university entrance exams",
      },
    ],
  },
];

export default function StudyInGermanyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/opportunities_study.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-br from-blue-950/80 via-indigo-900/70 to-violet-900/70" />
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-white/10 blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 mb-6"
            >
              <Link
                href="/opportunities"
                className="text-white/60 hover:text-white transition-colors text-sm font-display"
              >
                Germany Opportunities
              </Link>
              <span className="text-white/30">→</span>
              <span className="text-sm font-semibold font-display">
                Study in Germany
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display"
            >
              Study in Germany
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl"
            >
              Germany offers world-class education through public universities
              that often charge minimal tuition fees. Thousands of international
              students study here every year.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Link
                href="/reserve-seat"
                className="px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 font-display"
              >
                Start Learning German
              </Link>
              <Link
                href="/courses"
                className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display"
              >
                View Courses
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      {sections.map((section, sIdx) => (
        <section
          key={section.id}
          id={section.id}
          className={`py-16 lg:py-24 ${sIdx % 2 === 1 ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold mb-4 font-display"
              >
                {section.badge}
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 font-display"
              >
                {section.title}
              </motion.h2>
              {section.content.map((p, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  custom={2 + i}
                  className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4 max-w-3xl"
                >
                  {p}
                </motion.p>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {section.features.map((f, i) => (
                  <motion.div
                    key={f.text}
                    variants={fadeUp}
                    custom={3 + i}
                    className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">
                        {f.icon}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {f.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-linear-to-r from-primary to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">
            Ready to Study in Germany?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            German language proficiency is the first step. Start building the
            skills you need with German Virtual School.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reserve-seat"
              className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display"
            >
              Reserve Your Seat
            </Link>
            <Link
              href="/opportunities"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display"
            >
              ← Back to Opportunities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
