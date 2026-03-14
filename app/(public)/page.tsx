"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePublicStats } from "@/hooks/usePublicStats";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Home() {
  useEffect(() => {
    const handleScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.hash && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname) {
        e.preventDefault();
        const element = document.querySelector(anchor.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.pushState(null, "", anchor.hash);
        }
      }
    };
    document.addEventListener("click", handleScroll);
    return () => document.removeEventListener("click", handleScroll);
  }, []);

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const { stats, isLoading: isLoadingStats } = usePublicStats();

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingJoin(true);
    try {
      const response = await axios.post("/api/marketer/join", joinForm);
      if (response.data.success) setJoinSubmitted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit request.");
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await axios.get("/api/testimonials?public=true");
        if (data.success) setTestimonials(data.data);
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      } finally {
        setIsLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <main>
        {/* ════════════════════ HERO ════════════════════ */}
        <section className="relative min-h-[90vh] flex items-center hero-grid overflow-hidden">
          {/* Ambient blobs */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full py-20 lg:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left — Copy */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/5 border border-primary/15 dark:bg-primary/10 dark:border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-primary font-display">Enrollment Open · May 2026 Intake</span>
                </motion.div>

                <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 font-display">
                  Master German with{" "}
                  <span className="text-gradient">Academic Excellence</span>
                </motion.h1>

                <motion.p variants={fadeUp} custom={2} className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
                  Our distinguished virtual academy delivers structured German language education from A1 to C2, following CEFR standards for internationally recognized proficiency certification.
                </motion.p>

                <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/reserve-seat"
                    className="group relative px-8 py-4 bg-primary text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 text-center font-display"
                  >
                    <span className="relative z-10">Reserve Your Seat</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-500 to-primary bg-[length:200%_100%] animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
                  <Link
                    href="#curriculum"
                    className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-center font-display"
                  >
                    Explore Curriculum
                  </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div variants={fadeUp} custom={4} className="mt-10 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  {[
                    { icon: "verified", text: "CEFR Certified" },
                    { icon: "groups", text: `${isLoadingStats ? "..." : stats?.studentsCount?.toLocaleString() ?? "0"}+ Students` },
                    { icon: "star", text: "4.9★ Rating" },
                  ].map((b, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">{b.icon}</span>
                      <span className="font-medium">{b.text}</span>
                    </span>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right — Hero Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-slate-200/50 dark:border-slate-700/50 animate-float-slow">
                  <div className="aspect-[4/3]">
                    <img
                      src="/hero-image.png"
                      alt="Professional German language learning environment with modern technology and academic materials"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                </div>

                {/* Floating stat card */}
                <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-xl border border-white/30 dark:border-slate-700/50 animate-float hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">trending_up</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Success Rate</p>
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white font-display">{isLoadingStats ? "..." : `${stats?.successRate ?? 95}%`}</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-xl border border-white/30 dark:border-slate-700/50 animate-float hidden md:block" style={{ animationDelay: "2s" }}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-display">4.9/5</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════════ STATS TICKER ════════════════════ */}
        <section className="relative -mt-1 z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 md:p-8"
            >
              <div className={`grid grid-cols-2 gap-6 md:gap-8 ${!isLoadingStats && (stats?.successRate ?? 0) >= 60 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
                {[
                  { value: isLoadingStats ? "…" : stats?.studentsCount?.toLocaleString() ?? "0", label: "Enrolled Students", icon: "groups" },
                  { value: isLoadingStats ? "…" : stats?.instructorsCount?.toLocaleString() ?? "0", label: "Qualified Instructors", icon: "school" },
                  ...(!isLoadingStats && (stats?.successRate ?? 0) >= 60 ? [{ value: `${stats?.successRate}%`, label: "Success Rate", icon: "emoji_events" }] : []),
                  { value: isLoadingStats ? "…" : stats?.levelsCount ?? "6", label: "CEFR Levels", icon: "signal_cellular_alt" },
                ].map((stat, i) => (
                  <div key={i} className="text-center group">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 font-display">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════ ABOUT ════════════════════ */}
        <section id="about" className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold mb-4 font-display">Our Philosophy</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">
                A Tradition of Academic Excellence
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Deutsche Virtuelle Schule combines classical pedagogical approaches with modern technology to deliver world-class German language education through innovative virtual learning.
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { icon: "verified", color: "from-blue-500 to-indigo-600", title: "Accredited Programs", desc: "Our curriculum adheres to CEFR standards and is recognized by international language assessment bodies, ensuring globally valued certification." },
                { icon: "psychology", color: "from-violet-500 to-purple-600", title: "Research-Based Methods", desc: "Teaching methodology grounded in linguistic research and cognitive science, optimizing retention and practical language application." },
                { icon: "workspace_premium", color: "from-amber-500 to-orange-600", title: "Comprehensive Support", desc: "From enrollment through certification, students receive dedicated academic advising, progress monitoring, and personalized feedback." },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-white text-2xl">{card.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-display">{card.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ FEATURES ════════════════════ */}
        <section className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 font-display">Platform</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">
                A Premium Digital Campus
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Everything you need to master German, all in one state-of-the-art virtual environment.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "video_camera_front", color: "bg-blue-500", title: "Immersive Live Sessions", desc: "Connect directly with instructors in secure, real-time video classrooms with automated attendance tracking." },
                { icon: "library_books", color: "bg-purple-500", title: "Digital Library Access", desc: "Unlimited access to PDFs, video recordings, and interactive handouts available 24/7." },
                { icon: "monitoring", color: "bg-emerald-500", title: "Real-Time Performance", desc: "Track your growth with detailed analytics — attendance, grades, and proficiency levels." },
                { icon: "forum", color: "bg-orange-500", title: "Vibrant Community", desc: "Engage with peers and teachers in dedicated forums to discuss topics and practice skills." },
                { icon: "assignment_turned_in", color: "bg-rose-500", title: "Structured Assessments", desc: "Regular assignments and quizzes with comprehensive instructor feedback and grading." },
                { icon: "calendar_month", color: "bg-teal-500", title: "Smart Scheduling", desc: "Integrated calendar with live session times, assignment deadlines, and exam schedules." },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group flex gap-4 items-start p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 shrink-0 ${f.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-white text-xl">{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 font-display">{f.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ CURRICULUM ════════════════════ */}
        <section id="curriculum" className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-semibold mb-4 font-display">CEFR Aligned</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">
                Structured Learning Path
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                From elementary to proficient mastery, following the internationally recognized Common European Framework of Reference for Languages.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { level: "A1", title: "Elementary I", desc: "Foundation in basic phrases, introductions, and everyday expressions", gradient: "from-green-400 to-emerald-500" },
                { level: "A2", title: "Elementary II", desc: "Simple conversations about familiar topics and routine tasks", gradient: "from-emerald-400 to-teal-500" },
                { level: "B1", title: "Intermediate I", desc: "Main points on familiar matters, travel, and personal interests", gradient: "from-blue-400 to-blue-500" },
                { level: "B2", title: "Intermediate II", desc: "Complex texts, spontaneous interaction, and detailed expression", gradient: "from-indigo-400 to-indigo-600" },
                { level: "C1", title: "Advanced I", desc: "Effective flexible use for social, academic, and professional purposes", gradient: "from-violet-400 to-purple-600" },
                { level: "C2", title: "Advanced II", desc: "Near-native proficiency with nuanced understanding and expression", gradient: "from-purple-400 to-fuchsia-600" },
                { level: "↻", title: "Refresher", desc: "Brush up on your skills and regain confidence in communication", gradient: "from-amber-400 to-orange-500" },
                { level: "K", title: "Kinderkurse", desc: "Fun and interactive lessons designed specifically for children", gradient: "from-rose-400 to-pink-500" },
              ].map((course, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${course.gradient}`} />
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white font-extrabold text-lg font-display">{course.level}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">{course.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{course.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 font-medium">120 contact hours</span>
                      <Link href={`/reserve-seat?program=${course.level}`} className="text-xs font-bold text-primary hover:underline font-display">
                        Enroll →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ FACULTY ════════════════════ */}
        <section id="faculty" className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4 font-display">Our Team</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">Distinguished Faculty</motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Learn from qualified instructors with advanced degrees in linguistics, education, and German studies from prestigious European universities.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { icon: "record_voice_over", gradient: "from-blue-500 to-indigo-600", title: "Qualified Instructors", desc: "100% qualified language experts delivering authentic instruction", badge: "Authentic Language" },
                { icon: "school", gradient: "from-violet-500 to-purple-600", title: "Advanced Credentials", desc: "Master's or PhD in Linguistics or Education required", badge: "Academic Excellence" },
                { icon: "history_edu", gradient: "from-amber-500 to-orange-600", title: "Teaching Experience", desc: "Average 10+ years of language instruction experience", badge: "Proven Expertise" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="group text-center bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500"
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-white text-4xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{item.desc}</p>
                  <span className="inline-block text-[11px] text-primary font-bold uppercase tracking-wider bg-primary/5 dark:bg-primary/10 px-3 py-1 rounded-full font-display">{item.badge}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ TESTIMONIALS ════════════════════ */}
        {(!isLoadingTestimonials && testimonials.length > 0) || isLoadingTestimonials ? (
          <section id="testimonials" className="py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
                <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4 font-display">Testimonials</motion.span>
                <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">Student Success Stories</motion.h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {isLoadingTestimonials ? (
                  <div className="col-span-3 text-center py-24 text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm font-medium animate-pulse">Loading stories...</p>
                    </div>
                  </div>
                ) : (
                  testimonials.map((testimonial, i) => (
                    <motion.div
                      key={testimonial.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative"
                    >
                      <div className="absolute top-6 right-8 text-6xl text-primary/8 font-serif leading-none select-none">&rdquo;</div>
                      <div className="flex gap-1 mb-5">
                        {[...Array(5)].map((_, s) => (
                          <span key={s} className={`material-symbols-outlined text-lg ${s < testimonial.rating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed mb-6 relative z-10">{testimonial.content}</p>
                      <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-primary/5">
                          {testimonial.student?.avatarUrl ? (
                            <img src={testimonial.student.avatarUrl} alt="Student" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm uppercase">
                              {testimonial.student?.firstName?.[0]}{testimonial.student?.lastName?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white text-sm font-display truncate">{testimonial.student?.firstName} {testimonial.student?.lastName}</p>
                          <p className="text-xs text-primary font-medium truncate">{testimonial.student?.studentProfile?.address || "Verified Graduate"}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* ════════════════════ PARTNER PROGRAM ════════════════════ */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-30" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-6 font-display">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Partner Program
                </span>
                <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 font-display">Earn While Sharing Excellence</h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                  Become a Marketing Partner and earn commissions for every student you refer. Turn your network into a revenue stream.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "Earn $5 instantly on seat reservation",
                    "Earn an additional $15 on full tuition payment",
                    "Transparent dashboard & direct bank/card payouts",
                    "Receive a unique referral code instantly",
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-green-400 text-sm">check</span>
                      </div>
                      <span className="text-slate-300 text-sm">{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-xl font-display"
                  >
                    Request to Join
                  </button>
                  <Link href="/marketer/login" className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all font-display">
                    Marketer Login
                  </Link>
                </div>
              </div>

              {/* Dashboard preview */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-2xl">payments</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display">Partner Dashboard</h3>
                      <p className="text-xs text-slate-400">Track referrals & commissions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">Referred Students</p>
                        <p className="text-xl font-extrabold font-display">124</p>
                      </div>
                      <span className="material-symbols-outlined text-green-400">trending_up</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">Total Earned</p>
                        <p className="text-xl font-extrabold font-display">$248,000</p>
                      </div>
                      <span className="material-symbols-outlined text-green-400">account_balance_wallet</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════════ JOIN MODAL ════════════════════ */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-slate-100 dark:border-slate-800"
            >
              <button onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">handshake</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 font-display">Partner with Us</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Submit your details and our team will set up your marketing account.</p>

              {joinSubmitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
                  <span className="material-symbols-outlined text-4xl mb-2 text-green-500">check_circle</span>
                  <p className="font-bold font-display">Request Sent!</p>
                  <p className="text-sm mt-1">We will be in touch shortly via email.</p>
                  <button onClick={() => setShowJoinModal(false)} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors font-display">Close</button>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  {[
                    { label: "Full Name", type: "text", key: "name", ph: "e.g. John Doe", required: true },
                    { label: "Email Address", type: "email", key: "email", ph: "john@example.com", required: true },
                    { label: "Phone Number", type: "tel", key: "phone", ph: "+254 7XX XXX XXX", required: true },
                  ].map(({ label, type, key, ph, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label} {required && "*"}</label>
                      <input type={type} required={required} value={(joinForm as any)[key]} onChange={(e) => setJoinForm({ ...joinForm, [key]: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white" placeholder={ph} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">How do you plan to refer students?</label>
                    <textarea rows={3} value={joinForm.message} onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white resize-none" placeholder="e.g. I run a student community on social media..." />
                  </div>
                  <button type="submit" disabled={isSubmittingJoin} className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center font-display">
                    {isSubmittingJoin ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Submit Request"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* ════════════════════ PRICING ════════════════════ */}
        {stats.fees && (stats.fees.courses.length > 0 || stats.fees.seatReservationFee || stats.fees.materialFee) && (
          <section id="pricing" className="py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
                <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 font-display">
                  <span className="material-symbols-outlined text-[14px]">payments</span>
                  Transparent Pricing
                </motion.span>
                <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 font-display">Fees &amp; Course Pricing</motion.h2>
                <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                  Clear breakdown of all costs — no hidden charges. Flexible installment plans available.
                </motion.p>
              </motion.div>

              {/* System Fees */}
              {(stats.fees.seatReservationFee || stats.fees.materialFee) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
                  {stats.fees.seatReservationFee && (
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30 overflow-hidden group hover:shadow-lg transition-all duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-white text-xl">confirmation_number</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white font-display">Seat Reservation</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">One-time, non-refundable</p>
                          </div>
                        </div>
                        <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-display">${stats.fees.seatReservationFee.toLocaleString()}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Deducted from your total tuition fee{stats.fees.intakeLabel ? `. Secures spot for ${stats.fees.intakeLabel} intake.` : "."}</p>
                      </div>
                    </motion.div>
                  )}
                  {stats.fees.materialFee && (
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                      className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/30 overflow-hidden group hover:shadow-lg transition-all duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-white text-xl">menu_book</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white font-display">Learning Materials</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">One-time fee</p>
                          </div>
                        </div>
                        <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display">${stats.fees.materialFee.toLocaleString()}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                          Covers all course materials and digital resources{stats.fees.materialFeeDeadline ? `. Due by ${new Date(stats.fees.materialFeeDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Course Cards */}
              {stats.fees.courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.fees.courses.map((course, idx) => {
                    const levelColors: Record<string, string> = {
                      A1: "from-green-400 to-emerald-500", A2: "from-emerald-400 to-teal-500",
                      B1: "from-blue-400 to-blue-500", B2: "from-indigo-400 to-indigo-600",
                      C1: "from-violet-400 to-purple-600", C2: "from-purple-400 to-fuchsia-600",
                    };
                    return (
                      <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                        <div className={`h-1.5 bg-gradient-to-r ${levelColors[course.level] || "from-slate-300 to-slate-400"}`} />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${levelColors[course.level] || "from-slate-300 to-slate-400"} text-white font-display`}>{course.level}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {course.durationWeeks} weeks
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-3 font-display">{course.title}</h3>
                          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 font-display">${course.price.toLocaleString()}</p>
                          {course.feePlans.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Payment Options</p>
                              {course.feePlans.map((fp, i) => (
                                <div key={i} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 py-1">
                                  <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                                    {fp.billingCycle.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                    {fp.installments > 1 && ` (${fp.installments}x)`}
                                  </span>
                                  <span className="font-semibold">${fp.amount.toLocaleString()}{fp.installments > 1 ? "/inst." : ""}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Installment Banner */}
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl p-6 border border-primary/10 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">credit_score</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base font-display">Flexible Installment Plans</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tuition fees are payable in installments with a minimum of <strong className="text-primary">$9,000</strong> per installment.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  {["No interest charged", "Min. $9,000 per installment", "Per semester billing"].map((t, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ════════════════════ FINAL CTA ════════════════════ */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-600 to-violet-700 animate-gradient-x" />
          <div className="absolute inset-0 hero-grid opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[120px]" />

          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center relative z-10 text-white">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl lg:text-5xl font-extrabold mb-6 font-display">
                Secure Your Spot for The May Intake
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-xl mb-8 text-white/80 leading-relaxed">
                Reserve your seat today with a one-time fee of <span className="font-bold text-white">$2,500</span>. This locks your place and is deducted from your total tuition fee.
              </motion.p>

              <motion.div variants={fadeUp} custom={2} className="flex flex-wrap items-center justify-center gap-4 mb-10 text-sm text-white/70">
                {[
                  { icon: "lock", text: "Locks your seat" },
                  { icon: "receipt_long", text: "Deducted from total fee" },
                  { icon: "info", text: "Non-refundable" },
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    {item.text}
                  </span>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/reserve-seat" className="group relative px-10 py-4 bg-white text-primary text-lg font-bold rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all duration-300 font-display">
                  Reserve Your Seat — $2,500
                </Link>
                <Link href="/courses" className="px-10 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 font-display">
                  Browse Courses
                </Link>
              </motion.div>

              <motion.p variants={fadeUp} custom={4} className="mt-10 text-sm text-white/60">
                Questions? Contact us at{" "}
                <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@germanvirtualschool.com"}`} className="underline hover:text-white transition-colors">
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@germanvirtualschool.com"}
                </a>
              </motion.p>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
