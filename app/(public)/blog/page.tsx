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

const articles = [
  {
    slug: "how-kenyans-can-work-in-germany",
    title: "How Kenyans Can Work in Germany",
    excerpt: "Germany actively recruits skilled workers from around the world. Here's a comprehensive guide for Kenyan professionals looking to build careers in Europe's largest economy.",
    category: "Work",
    readTime: "8 min read",
    icon: "work",
    gradient: "from-emerald-400 to-teal-500",
    date: "March 2026",
  },
  {
    slug: "ausbildung-explained",
    title: "Ausbildung Explained: Germany's Vocational Training System",
    excerpt: "Everything you need to know about Germany's dual vocational training system — how it works, what you earn, and how to apply as an international student.",
    category: "Training",
    readTime: "10 min read",
    icon: "engineering",
    gradient: "from-amber-400 to-orange-500",
    date: "March 2026",
  },
  {
    slug: "how-to-study-in-germany-for-free",
    title: "How to Study in Germany for Free",
    excerpt: "Yes, you can study in Germany with minimal tuition fees. Learn about public universities, application processes, and how to finance your education abroad.",
    category: "Study",
    readTime: "7 min read",
    icon: "school",
    gradient: "from-blue-400 to-indigo-500",
    date: "February 2026",
  },
  {
    slug: "best-german-scholarships",
    title: "Best German Scholarships for African Students",
    excerpt: "A curated list of scholarship opportunities including DAAD, Konrad-Adenauer-Stiftung, and more — with eligibility criteria and application tips.",
    category: "Scholarships",
    readTime: "9 min read",
    icon: "emoji_events",
    gradient: "from-violet-400 to-purple-500",
    date: "February 2026",
  },
  {
    slug: "german-language-requirements-for-visa",
    title: "German Language Requirements for Germany Visa",
    excerpt: "Different visa categories require different language levels. This guide breaks down exactly what you need for each type of German visa application.",
    category: "Visa",
    readTime: "6 min read",
    icon: "flight_takeoff",
    gradient: "from-rose-400 to-pink-500",
    date: "January 2026",
  },
  {
    slug: "preparing-for-goethe-exam",
    title: "How to Prepare for Your Goethe Exam",
    excerpt: "Practical strategies, study tips, and resources to help you pass your Goethe exam on the first attempt — from A1 to C2.",
    category: "Exams",
    readTime: "8 min read",
    icon: "quiz",
    gradient: "from-cyan-400 to-blue-500",
    date: "January 2026",
  },
];

const categories = ["All", "Work", "Study", "Training", "Scholarships", "Visa", "Exams"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 dark:bg-primary/10 border border-primary/10 text-primary text-sm font-semibold mb-6 font-display">
              <span className="material-symbols-outlined text-lg">newspaper</span>
              Knowledge Hub
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-slate-900 dark:text-white font-display">
              Blog & Articles
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Insights, guides, and information for students planning to study, work, or train in Germany. Stay informed with our latest articles.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative -mt-6 z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-2 flex gap-1 overflow-x-auto thin-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap font-display ${
                  cat === "All"
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/blog/${article.slug}`}
                  className="group block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 h-full"
                >
                  {/* Card Header */}
                  <div className={`h-48 bg-gradient-to-br ${article.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <span className="material-symbols-outlined text-white/80 text-6xl group-hover:scale-110 transition-transform duration-500">
                      {article.icon}
                    </span>
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-display">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span>{article.date}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{article.readTime}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors font-display leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary font-display">
                      Read Article
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 lg:p-12 border border-slate-100 dark:border-slate-700 shadow-lg">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">mail</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-display">
              Stay Updated
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto">
              Get the latest articles, scholarship alerts, and tips for studying and working in Germany delivered to your inbox.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors font-display"
            >
              Contact Us to Subscribe
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
