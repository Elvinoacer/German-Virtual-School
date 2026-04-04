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

type StudyTopic = {
  badge: string;
  title: string;
  intro: string;
  points: string[];
  takeaway: string;
};

const studyTopics: Record<string, StudyTopic> = {
  why: {
    badge: "Why Study in Germany",
    title: "Why Study in Germany",
    intro:
      "Germany offers a rare combination of academic quality, global recognition, and long-term career value for international students.",
    points: [
      "Public universities offer high-quality education with little or no tuition fees.",
      "Degrees are internationally recognized and respected by global employers.",
      "Students gain access to the wider European labor market after graduation.",
      "Germany provides strong research, innovation, and industry collaboration opportunities.",
    ],
    takeaway:
      "Studying in Germany becomes even more valuable when paired with strong German language proficiency.",
  },
  requirements: {
    badge: "Requirements",
    title: "Requirements for International Students",
    intro:
      "Admission requirements vary by university, but most institutions follow a predictable structure for international applicants.",
    points: [
      "Recognized academic certificates and transcripts.",
      "Proof of financial means (blocked account requirement).",
      "Valid health insurance coverage.",
      "Language certification in German or English depending on the program.",
    ],
    takeaway:
      "Preparing your documents and language certificate early improves your acceptance chances.",
  },
  scholarships: {
    badge: "Scholarships",
    title: "Scholarships for African Students",
    intro:
      "Germany has multiple scholarship pathways for African students, including the well-known DAAD funding programs.",
    points: [
      "DAAD supports international students with living stipends and academic funding.",
      "Additional scholarships are offered by German foundations and institutions.",
      "Strong academic records and clear motivation letters improve competitiveness.",
      "Language proficiency can strengthen scholarship applications significantly.",
    ],
    takeaway:
      "Scholarships are competitive, and early preparation is essential for success.",
  },
  language: {
    badge: "Language Requirements",
    title: "German Language Requirements",
    intro:
      "Language level requirements depend on your chosen pathway, but most German-taught programs require certified proficiency.",
    points: [
      "A2-B1: Entry pathways and foundation routes.",
      "B2: Common minimum for many direct university admissions.",
      "C1: Often required for advanced academic programs.",
      "Goethe and similar certifications are commonly accepted proof.",
    ],
    takeaway:
      "Your language level directly determines which academic opportunities are available to you.",
  },
};

export default function StudyTopicPage() {
  const params = useParams<{ topic: string }>();
  const topicKey = params?.topic;
  const topic = topicKey ? studyTopics[topicKey] : undefined;

  if (!topic) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-display">
            Page Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The study topic you requested does not exist.
          </p>
          <Link
            href="/opportunities/study"
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold font-display"
          >
            Back to Study in Germany
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <section className="relative py-20 lg:py-28 bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 text-white overflow-hidden">
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
                href="/opportunities/study"
                className="text-white/60 hover:text-white transition-colors font-display"
              >
                Study in Germany
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
                <span className="material-symbols-outlined text-primary text-xl mt-0.5">
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
            className="mt-8 p-6 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10"
          >
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-primary">Key takeaway:</span>{" "}
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
              href="/opportunities/study"
              className="px-8 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center font-display"
            >
              Back to Study in Germany
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
