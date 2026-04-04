"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

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

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const tabs = [
  { id: "study", label: "Study in Germany", icon: "school" },
  { id: "work", label: "Work in Germany", icon: "work" },
  { id: "ausbildung", label: "Ausbildung", icon: "engineering" },
] as const;

const tabContent = {
  study: {
    hero: "Germany is one of the few major economies that offers world-class higher education with minimal tuition costs.",
    description:
      "Public universities welcome international students and provide programs in engineering, science, business, medicine, and many other disciplines. Scholarships offered by institutions like DAAD support students from around the world.",
    highlight: "Many programs require proof of German language proficiency.",
    features: [
      {
        icon: "payments_off",
        title: "Tuition-Free Education",
        desc: "Most public universities charge no tuition fees for international students.",
      },
      {
        icon: "workspace_premium",
        title: "World-Class Programs",
        desc: "Engineering, science, medicine, business — globally recognized qualifications.",
      },
      {
        icon: "redeem",
        title: "Scholarship Opportunities",
        desc: "DAAD and other organizations fund thousands of international students annually.",
      },
      {
        icon: "translate",
        title: "Language Advantage",
        desc: "German proficiency dramatically improves admission chances and integration.",
      },
    ],
    subpages: [
      {
        title: "Why Study in Germany",
        desc: "Strategically valuable — internationally recognized qualifications and European job market access.",
        href: "/opportunities/study/why",
        icon: "lightbulb",
      },
      {
        title: "Requirements for International Students",
        desc: "Academic qualifications, financial proof, health insurance, and language certification.",
        href: "/opportunities/study/requirements",
        icon: "checklist",
      },
      {
        title: "Scholarships for African Students",
        desc: "DAAD and other funding covering tuition, living expenses, and travel costs.",
        href: "/opportunities/study/scholarships",
        icon: "school",
      },
      {
        title: "German Language Requirements",
        desc: "A2–B1 for basic access, B2 for most universities, C1 for academic programs.",
        href: "/opportunities/study/language",
        icon: "translate",
      },
    ],
  },
  work: {
    hero: "Germany's aging population has created a growing demand for skilled workers across many sectors.",
    description:
      "The country actively recruits international professionals in healthcare, IT, engineering, and hospitality. Many immigration pathways require applicants to demonstrate German language skills at the B1 or B2 level.",
    highlight:
      "Learning German greatly improves employment opportunities and integration.",
    features: [
      {
        icon: "trending_up",
        title: "High Demand",
        desc: "Germany faces a critical shortage of skilled workers in key industries.",
      },
      {
        icon: "payments",
        title: "Strong Salaries",
        desc: "Competitive compensation with one of Europe's strongest worker protections.",
      },
      {
        icon: "flight_takeoff",
        title: "Visa Pathways",
        desc: "Skilled worker visa and other immigration routes for qualified professionals.",
      },
      {
        icon: "diversity_3",
        title: "International Workplace",
        desc: "Many companies welcome international professionals with diverse backgrounds.",
      },
    ],
    subpages: [
      {
        title: "German Skilled Worker Visa",
        desc: "Recognized qualifications, job offer, and language proficiency requirements.",
        href: "/opportunities/work/visa",
        icon: "badge",
      },
      {
        title: "Jobs for International Professionals",
        desc: "Healthcare, IT, engineering, and skilled trades — for prepared candidates.",
        href: "/opportunities/work/jobs",
        icon: "work",
      },
      {
        title: "Language Requirements for Employment",
        desc: "A2–B1 for entry-level, B1–B2 for professional jobs, B2+ for regulated fields.",
        href: "/opportunities/work/language",
        icon: "translate",
      },
      {
        title: "CV Requirements in Germany",
        desc: "Structured, fact-based CVs with professional photo and verified qualifications.",
        href: "/opportunities/work/cv",
        icon: "description",
      },
    ],
  },
  ausbildung: {
    hero: "Germany's dual vocational training system combines practical work experience with classroom education.",
    description:
      "Students in Ausbildung programs receive professional training, earn a monthly salary, and obtain internationally recognized qualifications. Programs typically last 2–3 years across professions like hospitality, technical trades, healthcare, and industry.",
    highlight: "Basic German proficiency is required to participate.",
    features: [
      {
        icon: "payments",
        title: "Earn While Learning",
        desc: "Monthly salary during the entire training period — typically €800–1,200/month.",
      },
      {
        icon: "workspace_premium",
        title: "Recognized Qualification",
        desc: "Internationally recognized vocational qualification upon completion.",
      },
      {
        icon: "trending_up",
        title: "High Employment",
        desc: "Most graduates receive full-time employment offers from their training company.",
      },
      {
        icon: "schedule",
        title: "2–3 Year Programs",
        desc: "Structured programs combining practical company work with classroom theory.",
      },
    ],
    subpages: [
      {
        title: "What is Ausbildung?",
        desc: "A structured program where you learn a profession, gain experience, and earn a salary.",
        href: "/opportunities/ausbildung/what-is",
        icon: "info",
      },
      {
        title: "Salary and Benefits",
        desc: "Monthly stipend, recognized qualification, and high employment chances afterward.",
        href: "/opportunities/ausbildung/salary",
        icon: "payments",
      },
      {
        title: "Requirements",
        desc: "Minimum education level, German language (usually B1), and motivation.",
        href: "/opportunities/ausbildung/requirements",
        icon: "checklist",
      },
      {
        title: "Application Process",
        desc: "Choose a field, apply to companies, attend interviews, secure a contract.",
        href: "/opportunities/ausbildung/application",
        icon: "assignment",
      },
    ],
  },
};

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabContent>("study");
  const content = tabContent[activeTab];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-100 h-100 rounded-full bg-indigo-500/10 blur-[100px]" />

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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold mb-6 font-display"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Discover Your Path to Germany
            </motion.span>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display"
            >
              Germany Opportunities
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Germany is Europe&apos;s largest economy and one of the
              world&apos;s leading destinations for international students and
              professionals. Explore pathways to study, work, and train.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="relative -mt-6 z-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-1.5 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 font-display ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-lg hidden sm:inline">
                  {tab.icon}
                </span>
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Overview */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-lg lg:text-xl text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                {content.hero}
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {content.description}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
                <span className="material-symbols-outlined text-primary text-lg">
                  info
                </span>
                <span className="text-sm font-medium text-primary">
                  {content.highlight}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
              {content.features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-primary group-hover:text-white text-2xl transition-colors">
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Subpages / Learn More */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center font-display">
                Learn More
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.subpages.map((sub) => (
                  <Link
                    key={sub.title}
                    href={sub.href}
                    className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <span className="material-symbols-outlined text-primary group-hover:text-white text-xl transition-colors">
                        {sub.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors font-display">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {sub.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-linear-to-r from-primary via-indigo-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">
            Start Preparing for Your Future in Germany
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            German language proficiency is the key that unlocks all these
            opportunities. Begin your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reserve-seat"
              className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-display"
            >
              Reserve Your Seat
            </Link>
            <Link
              href="/courses"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 font-display"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
