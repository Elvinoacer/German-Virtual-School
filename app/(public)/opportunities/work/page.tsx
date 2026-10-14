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
    id: "visa",
    badge: "Skilled Worker Visa",
    title: "German Skilled Worker Visa",
    content: [
      "The Skilled Worker Visa allows qualified professionals to work in Germany. Requirements typically include recognized qualifications, a job offer or employability proof, and language proficiency that varies by field.",
    ],
    features: [
      {
        icon: "badge",
        text: "Recognized professional qualifications (assessed by German authorities)",
      },
      {
        icon: "work",
        text: "Job offer from a German employer or proof of employability",
      },
      {
        icon: "translate",
        text: "Language proficiency varies by sector (B1–B2 typical)",
      },
      {
        icon: "gavel",
        text: "Simplified immigration process under the Skilled Immigration Act",
      },
    ],
  },
  {
    id: "jobs",
    badge: "High-Demand Jobs",
    title: "Jobs for International Professionals",
    content: [
      "Germany is not looking for everyone — it is looking for prepared candidates. High-demand fields include healthcare (nurses, caregivers), IT and software development, engineering, and skilled trades.",
    ],
    features: [
      {
        icon: "health_and_safety",
        text: "Healthcare: nurses, caregivers, medical assistants",
      },
      {
        icon: "code",
        text: "IT: software developers, data scientists, cybersecurity",
      },
      {
        icon: "engineering",
        text: "Engineering: mechanical, electrical, automotive",
      },
      {
        icon: "construction",
        text: "Skilled trades: electricians, plumbers, welders",
      },
    ],
  },
  {
    id: "language",
    badge: "Language Requirements",
    title: "Language Requirements for Employment",
    content: [
      "Language is often the deciding factor in securing employment in Germany. Different positions require different levels of proficiency.",
    ],
    features: [
      {
        icon: "signal_cellular_1_bar",
        text: "A2–B1: Entry-level roles and basic service positions",
      },
      {
        icon: "signal_cellular_3_bar",
        text: "B1–B2: Most professional jobs and technical roles",
      },
      {
        icon: "signal_cellular_4_bar",
        text: "B2+: Client-facing or regulated professions (healthcare, law)",
      },
      {
        icon: "workspace_premium",
        text: "Certified language exams (Goethe, telc) often required",
      },
    ],
  },
  {
    id: "cv",
    badge: "CV & Applications",
    title: "CV Requirements in Germany",
    content: [
      "German CVs are structured, concise, and fact-based. Small details make a big difference in the German application process. Understanding these conventions is crucial for international applicants.",
    ],
    features: [
      {
        icon: "photo_camera",
        text: "Professional photo — standard and expected on German CVs",
      },
      {
        icon: "timeline",
        text: "Clear chronological timeline of education and experience",
      },
      {
        icon: "verified",
        text: "Verified qualifications with official translations",
      },
      {
        icon: "text_snippet",
        text: "Motivation letter (Anschreiben) tailored to each position",
      },
    ],
  },
];

export default function WorkInGermanyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/opportunities_work.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/80 via-teal-900/70 to-cyan-900/70" />
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
                Work in Germany
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display"
            >
              Work in Germany
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl"
            >
              Germany faces a shortage of skilled workers in many sectors.
              Industries actively seek international professionals in
              healthcare, IT, engineering, and hospitality.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Link
                href="/register"
                className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 font-display"
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
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 font-display"
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
                    className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">
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
      <section className="py-16 lg:py-20 bg-linear-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">
            Ready to Work in Germany?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            German language proficiency is your key to unlocking career
            opportunities. Start building the skills you need today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display"
            >
              Enroll Now
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
