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
    id: "what",
    badge: "What is Ausbildung?",
    title: "A Structured Path to Professional Success",
    content: [
      "Ausbildung is Germany's prestigious dual vocational training system — a structured program where you learn a profession, gain real work experience, and earn a monthly salary simultaneously.",
      "Unlike traditional education, Ausbildung combines practical company work with theoretical classroom learning. You graduate with an internationally recognized professional qualification.",
    ],
    features: [
      {
        icon: "school",
        text: "Learn a profession through structured, hands-on training",
      },
      { icon: "work", text: "Gain real workplace experience from day one" },
      {
        icon: "payments",
        text: "Earn a monthly salary throughout your training",
      },
      {
        icon: "workspace_premium",
        text: "Receive an internationally recognized qualification",
      },
    ],
  },
  {
    id: "salary",
    badge: "Salary & Benefits",
    title: "Earn While You Learn",
    content: [
      "One of the most attractive aspects of Ausbildung is that you earn a salary from the very beginning. Monthly stipends typically range from €800 to €1,200 depending on the field and year of training.",
    ],
    features: [
      {
        icon: "payments",
        text: "Monthly stipend: €800–1,200 during training (increases yearly)",
      },
      {
        icon: "verified",
        text: "Recognized qualification after 2–3 years of completion",
      },
      {
        icon: "trending_up",
        text: "High chances of permanent employment — 70%+ retention rate",
      },
      {
        icon: "health_and_safety",
        text: "Full social benefits: health insurance, pension, paid leave",
      },
    ],
  },
  {
    id: "requirements",
    badge: "Requirements",
    title: "Requirements for International Students",
    content: [
      "The requirements for international students are straightforward but must be met carefully. Preparation and German language skills are the most important factors for success.",
    ],
    features: [
      {
        icon: "school",
        text: "Minimum education level (varies by profession — Hauptschulabschluss or equivalent)",
      },
      {
        icon: "translate",
        text: "German language proficiency (usually B1 minimum, B2 preferred)",
      },
      {
        icon: "psychology",
        text: "Motivation, commitment, and genuine interest in the profession",
      },
      {
        icon: "description",
        text: "Complete application documents (CV, motivation letter, certificates)",
      },
    ],
  },
  {
    id: "process",
    badge: "Application Process",
    title: "Your Path from Application to Training",
    content: [
      "The application process follows clear steps. Starting early and being well-prepared gives you a significant advantage. Preparation determines success.",
    ],
    features: [
      {
        icon: "search",
        text: "Step 1: Choose your field — research professions that match your interests",
      },
      {
        icon: "send",
        text: "Step 2: Apply to companies — send applications directly to German employers",
      },
      {
        icon: "record_voice_over",
        text: "Step 3: Attend interviews — virtual or in-person interviews with employers",
      },
      {
        icon: "handshake",
        text: "Step 4: Secure a contract — sign your Ausbildungsvertrag and begin!",
      },
    ],
  },
];

const professions = [
  {
    icon: "restaurant",
    title: "Hospitality Management",
    desc: "Hotels, restaurants, event management",
  },
  {
    icon: "precision_manufacturing",
    title: "Technical Trades",
    desc: "Mechatronics, electronics, mechanics",
  },
  {
    icon: "medical_services",
    title: "Healthcare Assistance",
    desc: "Nursing care, medical assistance",
  },
  {
    icon: "factory",
    title: "Industrial Professions",
    desc: "Manufacturing, logistics, quality control",
  },
  {
    icon: "computer",
    title: "IT & Digital",
    desc: "Application development, system integration",
  },
  {
    icon: "storefront",
    title: "Retail & Commerce",
    desc: "Retail management, wholesale, foreign trade",
  },
];

export default function AusbildungPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/vocational_training.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-br from-amber-950/80 via-orange-900/70 to-rose-900/70" />
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
                Ausbildung
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display"
            >
              Ausbildung
              <span className="block text-2xl sm:text-3xl font-medium text-white/80 mt-2">
                Vocational Training in Germany
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl"
            >
              Germany&apos;s dual vocational training system combines practical
              work experience with classroom education. Earn a salary while you
              learn a profession.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Link
                href="/reserve-seat"
                className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 font-display"
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

      {/* Popular Professions */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4 font-display"
            >
              Popular Fields
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-display"
            >
              Ausbildung Professions
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
            >
              Germany offers vocational training across dozens of professions.
              Here are some of the most popular fields for international
              students.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {professions.map((prof, i) => (
              <motion.div
                key={prof.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group flex items-start gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-2xl">
                    {prof.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-display">
                    {prof.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {prof.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {sections.map((section, sIdx) => (
        <section
          key={section.id}
          id={section.id}
          className={`py-16 lg:py-24 ${sIdx % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}
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
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4 font-display"
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
                    className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">
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
      <section className="py-16 lg:py-20 bg-linear-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">
            Ready for Ausbildung?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            B1 German proficiency is usually required. Start building your
            language skills today with German Virtual School.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reserve-seat"
              className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display"
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
