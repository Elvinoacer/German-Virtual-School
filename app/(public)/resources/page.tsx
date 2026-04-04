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

const resources = [
  {
    icon: "translate",
    gradient: "from-blue-500 to-indigo-600",
    title: "Germany Language Requirements",
    desc: "Comprehensive guide to German language requirements for different visa types, universities, and employment pathways.",
    content: [
      "Family reunification: A1 certificate required",
      "Work visa (most sectors): B1–B2 proficiency",
      "University admission: B2–C1 (depends on program)",
      "Ausbildung enrollment: B1 minimum (B2 preferred)",
      "Permanent residency: B1 certificate required",
      "Citizenship: B1 certificate + integration course",
    ],
  },
  {
    icon: "euro",
    gradient: "from-emerald-500 to-teal-600",
    title: "Cost of Living in Germany",
    desc: "Understand the financial requirements for living in Germany as a student or professional.",
    content: [
      "Blocked account: ~€11,208/year required for student visa",
      "Average rent: €400–800/month (varies by city)",
      "Health insurance: €110–120/month (student rate)",
      "Groceries: €200–300/month",
      "Public transport: €30–50/month (semester ticket available)",
      "Total average: €850–1,200/month depending on location",
    ],
  },
  {
    icon: "diversity_3",
    gradient: "from-violet-500 to-purple-600",
    title: "German Cultural Guide",
    desc: "Prepare for life in Germany by understanding cultural norms, values, and everyday expectations.",
    content: [
      "Punctuality is highly valued in all settings",
      "Direct communication style — clarity over politeness",
      "Strong separation between work and personal life",
      "Recycling and environmental consciousness are important",
      "Title usage (Herr/Frau + last name) in formal settings",
      "Quiet hours (Ruhezeit) are legally enforced in many areas",
    ],
  },
  {
    icon: "checklist",
    gradient: "from-amber-500 to-orange-600",
    title: "Moving to Germany Checklist",
    desc: "Step-by-step preparation guide for your move to Germany — from documents to settling in.",
    content: [
      "✓ Obtain German language certification (B1 minimum)",
      "✓ Gather and translate academic documents",
      "✓ Open a blocked bank account (for students)",
      "✓ Arrange health insurance coverage",
      "✓ Apply for visa at German embassy/consulate",
      "✓ Register at local Bürgeramt within 14 days of arrival",
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/student_resources.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-br from-slate-950/80 via-slate-900/75 to-indigo-950/70" />
        <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-primary/10 blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-6 font-display"
            >
              <span className="material-symbols-outlined text-lg">
                library_books
              </span>
              Knowledge Base
            </motion.span>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white font-display"
            >
              Student Resources
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg lg:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed"
            >
              Everything you need to know about preparing for life, study, and
              work in Germany — reliable information at your fingertips.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
          {resources.map((resource, i) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-500"
            >
              <div className={`h-1.5 bg-linear-to-r ${resource.gradient}`} />
              <div className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                  {/* Left — Info */}
                  <div className="lg:w-1/3">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-linear-to-br ${resource.gradient} flex items-center justify-center mb-5 shadow-lg`}
                    >
                      <span className="material-symbols-outlined text-white text-2xl">
                        {resource.icon}
                      </span>
                    </div>
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 font-display">
                      {resource.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {resource.desc}
                    </p>
                  </div>

                  {/* Right — Content */}
                  <div className="lg:w-2/3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {resource.content.map((item, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                        >
                          <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                            arrow_right
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-linear-to-r from-primary via-indigo-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">
            Start Your Preparation Today
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            German language proficiency is the foundation for all opportunities
            in Germany. Begin your journey now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reserve-seat"
              className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display"
            >
              Reserve Your Seat
            </Link>
            <Link
              href="/courses"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
