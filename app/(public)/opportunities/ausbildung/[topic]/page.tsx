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

type AusbildungTopic = {
  badge: string;
  title: string;
  intro: string;
  points: string[];
  takeaway: string;
};

const ausbildungTopics: Record<string, AusbildungTopic> = {
  "what-is": {
    badge: "What is Ausbildung?",
    title: "What is Ausbildung",
    intro:
      "Ausbildung is Germany's dual vocational training model where students train in real workplaces while studying in vocational school.",
    points: [
      "Combines practical company work with classroom learning.",
      "Usually lasts 2 to 3 years depending on the profession.",
      "Leads to a recognized professional qualification in Germany.",
      "Creates a strong transition path into long-term employment.",
    ],
    takeaway:
      "Ausbildung is one of the most accessible pathways to start a professional career in Germany.",
  },
  salary: {
    badge: "Salary and Benefits",
    title: "Salary and Benefits",
    intro:
      "Ausbildung students are paid during training and receive social protection benefits, making it a practical option for many international applicants.",
    points: [
      "Monthly stipends often range from EUR800 to EUR1200.",
      "Earnings typically increase year by year during training.",
      "Social benefits can include health insurance and pension contributions.",
      "Completion often leads to full-time employment opportunities.",
    ],
    takeaway:
      "You do not only learn a profession, you also earn income while building long-term employability.",
  },
  requirements: {
    badge: "Requirements",
    title: "Requirements for International Students",
    intro:
      "International applicants must meet baseline educational, language, and documentation requirements before receiving training contracts.",
    points: [
      "Relevant school completion documents.",
      "German language proficiency, usually B1 minimum.",
      "Clear motivation for the selected profession.",
      "Complete application set: CV, motivation letter, and certificates.",
    ],
    takeaway:
      "Language readiness is often the deciding factor for successful Ausbildung applications.",
  },
  application: {
    badge: "Application Process",
    title: "Application Process",
    intro:
      "The Ausbildung process follows a structured sequence, and candidates who prepare early have a clear advantage.",
    points: [
      "Choose your field and target profession.",
      "Apply to companies offering training contracts.",
      "Attend interviews and communicate your motivation clearly.",
      "Secure a contract and continue with visa and relocation steps.",
    ],
    takeaway:
      "A disciplined, step-by-step application strategy significantly improves your placement chances.",
  },
};

export default function AusbildungTopicPage() {
  const params = useParams<{ topic: string }>();
  const topicKey = params?.topic;
  const topic = topicKey ? ausbildungTopics[topicKey] : undefined;

  if (!topic) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-display">
            Page Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The Ausbildung topic you requested does not exist.
          </p>
          <Link
            href="/opportunities/ausbildung"
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold font-display"
          >
            Back to Ausbildung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <section className="relative py-20 lg:py-28 bg-linear-to-br from-amber-500 via-orange-500 to-rose-600 text-white overflow-hidden">
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
                href="/opportunities/ausbildung"
                className="text-white/60 hover:text-white transition-colors font-display"
              >
                Ausbildung
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
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl mt-0.5">
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
            className="mt-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30"
          >
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-600 dark:text-amber-400">
                Key takeaway:
              </span>{" "}
              {topic.takeaway}
            </p>
          </motion.div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold text-center font-display"
            >
              Start Learning German
            </Link>
            <Link
              href="/opportunities/ausbildung"
              className="px-8 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center font-display"
            >
              Back to Ausbildung
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
