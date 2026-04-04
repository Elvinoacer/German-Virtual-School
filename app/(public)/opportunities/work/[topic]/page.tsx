"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

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

type WorkTopic = {
  badge: string;
  title: string;
  intro: string;
  points: string[];
  takeaway: string;
};

const workTopics: Record<string, WorkTopic> = {
  visa: {
    badge: "Skilled Worker Visa",
    title: "German Skilled Worker Visa",
    intro:
      "Germany provides structured immigration pathways for qualified professionals through the Skilled Immigration framework.",
    points: [
      "Recognized professional qualification is usually required.",
      "Job offer or employability evidence strengthens visa applications.",
      "Language requirements vary by sector, commonly B1-B2.",
      "Healthcare and other regulated sectors can require higher language standards.",
    ],
    takeaway:
      "Language preparation and credential recognition are the two most critical steps before applying.",
  },
  jobs: {
    badge: "Jobs for Professionals",
    title: "Jobs for International Professionals",
    intro:
      "Germany has sustained demand for international talent in multiple sectors due to workforce shortages.",
    points: [
      "Healthcare roles: nurses, caregivers, and allied professionals.",
      "IT roles: developers, analysts, and cybersecurity specialists.",
      "Engineering roles across manufacturing, automotive, and infrastructure.",
      "Skilled trades and technical roles remain high-demand across regions.",
    ],
    takeaway:
      "Prepared applicants with language skills and clear documentation move faster in recruitment.",
  },
  language: {
    badge: "Language for Employment",
    title: "Language Requirements for Employment",
    intro:
      "German language level strongly influences job eligibility, interview success, and long-term integration at work.",
    points: [
      "A2-B1: Basic and entry-level roles in selected sectors.",
      "B1-B2: Typical expectation for most professional roles.",
      "B2+: Often required for client-facing or regulated fields.",
      "Language certification increases employer trust and visa readiness.",
    ],
    takeaway:
      "For most professionals targeting Germany, B1-B2 is the practical minimum target range.",
  },
  cv: {
    badge: "CV Guidance",
    title: "CV Requirements in Germany",
    intro:
      "German applications follow a structured format, and candidates are expected to provide concise, evidence-based documentation.",
    points: [
      "A clear chronological CV (Lebenslauf) is standard.",
      "Verified qualifications and translated certificates are important.",
      "Motivation letters should be role-specific and direct.",
      "Presentation quality and document consistency impact interview chances.",
    ],
    takeaway:
      "A well-structured German-style application can significantly improve your interview conversion rate.",
  },
};

export default function WorkTopicPage() {
  const params = useParams<{ topic: string }>();
  const topicKey = params?.topic;
  const topic = topicKey ? workTopics[topicKey] : undefined;

  if (!topic) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-display">
            Page Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The work topic you requested does not exist.
          </p>
          <Link
            href="/opportunities/work"
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold font-display"
          >
            Back to Work in Germany
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <section className="relative py-20 lg:py-28 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-white/5 blur-[100px]" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 mb-6 text-sm"
            >
              <Link
                href="/opportunities"
                className="text-white/60 hover:text-white transition-colors font-display"
              >
                Germany Opportunities
              </Link>
              <span className="text-white/30">→</span>
              <Link
                href="/opportunities/work"
                className="text-white/60 hover:text-white transition-colors font-display"
              >
                Work in Germany
              </Link>
            </motion.div>
            <motion.span
              variants={fadeUp}
              custom={1}
              className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold mb-4 font-display"
            >
              {topic.badge}
            </motion.span>
            <motion.h1
              variants={fadeUp}
              custom={2}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 font-display"
            >
              {topic.title}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-lg text-white/80 leading-relaxed"
            >
              {topic.intro}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topic.points.map((point, i) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow"
              >
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl mt-0.5">
                  check_circle
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {point}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30"
          >
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Key takeaway:
              </span>{" "}
              {topic.takeaway}
            </p>
          </motion.div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/reserve-seat"
              className="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold text-center font-display"
            >
              Start Learning German
            </Link>
            <Link
              href="/opportunities/work"
              className="px-8 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center font-display"
            >
              Back to Work in Germany
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
