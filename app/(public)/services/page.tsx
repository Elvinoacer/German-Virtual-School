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

const services = [
  {
    id: "visa",
    icon: "flight_takeoff",
    gradient: "from-blue-500 to-indigo-600",
    image: "/images/visa_preparation.jpg",
    badge: "Visa Readiness",
    title: "Visa Readiness Guidance",
    desc: "German Virtual School provides educational guidance to help students prepare for opportunities in Germany. We help you understand the process and prepare accordingly.",
    disclaimer:
      "German Virtual School provides educational guidance only and does not provide immigration services.",
    features: [
      {
        icon: "checklist",
        text: "Understanding language requirements for different visa categories",
      },
      {
        icon: "description",
        text: "Visa document checklists and preparation guides",
      },
      {
        icon: "schedule",
        text: "Application timeline planning and milestone tracking",
      },
      {
        icon: "route",
        text: "Information about study, work, and training pathways",
      },
    ],
  },
  {
    id: "interview",
    icon: "record_voice_over",
    gradient: "from-violet-500 to-purple-600",
    image: "/images/interview_coaching.jpg",
    badge: "Interview Coaching",
    title: "Interview Coaching",
    desc: "Students preparing for international opportunities often face interviews with employers or training institutions. Our coaching prepares you to communicate professionally in German.",
    features: [
      { icon: "quiz", text: "Practice common interview questions in German" },
      {
        icon: "translate",
        text: "Develop professional German communication skills",
      },
      {
        icon: "psychology",
        text: "Build confidence in formal speaking situations",
      },
      {
        icon: "work",
        text: "Understand German workplace culture and expectations",
      },
    ],
  },
  {
    id: "cv",
    icon: "description",
    gradient: "from-amber-500 to-orange-600",
    image: "/images/cv_support.jpg",
    badge: "CV & Applications",
    title: "CV and Application Support",
    desc: "German job applications follow specific formatting and expectations that differ significantly from other countries. Understanding these conventions is crucial for success.",
    features: [
      {
        icon: "description",
        text: "German-style CV (Lebenslauf) — structured and professional",
      },
      {
        icon: "edit_note",
        text: "Motivation letter (Anschreiben) — tailored and persuasive",
      },
      {
        icon: "school",
        text: "University application documents and personal statements",
      },
      {
        icon: "verified",
        text: "Professional document review and formatting guidance",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/opportunities_work.png')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-br from-slate-950/80 via-slate-900/75 to-indigo-950/70" />
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-100 h-100 rounded-full bg-violet-500/20 blur-[100px]" />

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
              <span className="material-symbols-outlined text-lg">
                support_agent
              </span>
              Value-Added Services
            </motion.span>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display"
            >
              Germany Preparation Services
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Beyond language courses, we offer guidance and support services to
              help you prepare for every aspect of your journey to Germany.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      {services.map((service, sIdx) => (
        <section
          key={service.id}
          id={service.id}
          className={`py-16 lg:py-24 ${sIdx % 2 === 1 ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className={sIdx % 2 === 1 ? "lg:order-2" : ""}
              >
                <motion.span
                  variants={fadeUp}
                  custom={0}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold mb-4 font-display"
                >
                  {service.badge}
                </motion.span>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 font-display"
                >
                  {service.title}
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6"
                >
                  {service.desc}
                </motion.p>

                {service.disclaimer && (
                  <motion.div
                    variants={fadeUp}
                    custom={3}
                    className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 mb-6"
                  >
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5">
                      info
                    </span>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      {service.disclaimer}
                    </p>
                  </motion.div>
                )}

                <div className="space-y-3">
                  {service.features.map((f, i) => (
                    <motion.div
                      key={f.text}
                      variants={fadeUp}
                      custom={4 + i}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-primary text-base">
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

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={sIdx % 2 === 1 ? "lg:order-1" : ""}
              >
                <div className="relative">
                  <div className="relative w-full aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${service.image}')` }}
                      aria-hidden="true"
                    />
                    <div
                      className={`absolute inset-0 bg-linear-to-br ${service.gradient} opacity-70`}
                    />
                    <div className="relative z-10 h-full p-8 flex flex-col items-center justify-center text-white">
                      <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-5xl">
                          {service.icon}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 font-display text-center">
                        {service.badge}
                      </h3>
                      <p className="text-white/85 text-sm text-center max-w-xs">
                        Professional guidance to help you prepare confidently
                      </p>
                    </div>
                  </div>
                  {/* Floating accent */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-primary/10 blur-2xl" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-linear-to-r from-primary via-indigo-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">
            Ready to Prepare for Germany?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Start with language — everything else follows. Our courses and
            support services give you the complete preparation you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display"
            >
              Enroll Now
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all font-display"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
