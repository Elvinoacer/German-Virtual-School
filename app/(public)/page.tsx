"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePublicStats } from "@/hooks/usePublicStats";

type Testimonial = {
  id?: string | number;
  content: string;
  rating: number;
  student?: {
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
    studentProfile?: {
      address?: string | null;
    } | null;
  } | null;
};

type JoinFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const joinFields: Array<{
  label: string;
  type: "text" | "email" | "tel";
  key: keyof JoinFormData;
  ph: string;
  required: boolean;
}> = [
  {
    label: "Full Name",
    type: "text",
    key: "name",
    ph: "e.g. John Doe",
    required: true,
  },
  {
    label: "Email Address",
    type: "email",
    key: "email",
    ph: "john@example.com",
    required: true,
  },
  {
    label: "Phone Number",
    type: "tel",
    key: "phone",
    ph: "+254 7XX XXX XXX",
    required: true,
  },
];

const easeCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: easeCurve },
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
      if (
        anchor &&
        anchor.hash &&
        anchor.origin === window.location.origin &&
        anchor.pathname === window.location.pathname
      ) {
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

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState<JoinFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const { stats, isLoading: isLoadingStats } = usePublicStats();

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingJoin(true);
    try {
      const response = await axios.post("/api/marketer/join", joinForm);
      if (response.data.success) setJoinSubmitted(true);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { error?: string })?.error ||
          "Failed to submit request."
        : "Failed to submit request.";
      toast.error(message);
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

  const minInstallment = stats.fees?.minInstallmentAmount ?? 9000;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <main>
        {/* HERO */}
        <section className="relative min-h-[90vh] flex items-center hero-grid overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-150 h-150 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-15%] left-[-10%] w-125 h-125 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full py-20 lg:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/5 border border-primary/15 dark:bg-primary/10 dark:border-primary/20"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-primary font-display">
                    Enrollment Open · {stats.fees?.intakeLabel || "May"} 2026
                    Intake
                  </span>
                </motion.div>
                <motion.h1
                  variants={fadeUp}
                  custom={1}
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 font-display"
                >
                  Start Your Journey{" "}
                  <span className="text-gradient">to Germany 🇩🇪</span>
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-4 leading-relaxed max-w-lg"
                >
                  Germany is one of the most attractive destinations in the
                  world for international students and skilled professionals.
                  Thousands of opportunities exist in higher education,
                  vocational training, and employment.
                </motion.p>
                <motion.p
                  variants={fadeUp}
                  custom={3}
                  className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg"
                >
                  However, most opportunities require{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    German language proficiency
                  </span>
                  . German Virtual School helps you build the language skills
                  needed to study, train, and work in Germany.
                </motion.p>
                <motion.div
                  variants={fadeUp}
                  custom={4}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Link
                    href="/reserve-seat"
                    className="group relative px-8 py-4 bg-primary text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 text-center font-display"
                  >
                    <span className="relative z-10">Start Learning German</span>
                    <div className="absolute inset-0 bg-linear-to-r from-primary via-indigo-500 to-primary bg-size-[200%_100%] animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
                  <Link
                    href="/opportunities"
                    className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-center font-display"
                  >
                    Explore Opportunities in Germany
                  </Link>
                </motion.div>
                <motion.div
                  variants={fadeUp}
                  custom={5}
                  className="mt-10 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400"
                >
                  {[
                    { icon: "verified", text: "CEFR Certified" },
                    {
                      icon: "groups",
                      text: `${isLoadingStats ? "..." : (stats?.studentsCount?.toLocaleString() ?? "0")}+ Students`,
                    },
                    { icon: "star", text: "4.9★ Rating" },
                  ].map((b, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        {b.icon}
                      </span>
                      <span className="font-medium">{b.text}</span>
                    </span>
                  ))}
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-slate-200/50 dark:border-slate-700/50 animate-float-slow">
                  <div className="aspect-4/3">
                    <img
                      src="/hero-image.png"
                      alt="Students learning German and preparing for opportunities in Germany"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-xl border border-white/30 dark:border-slate-700/50 animate-float hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">
                        trending_up
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Success Rate
                      </p>
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                        {isLoadingStats
                          ? "..."
                          : `${stats?.successRate ?? 95}%`}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-xl border border-white/30 dark:border-slate-700/50 animate-float hidden md:block"
                  style={{ animationDelay: "2s" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-amber-500"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-display">
                      4.9/5
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="relative -mt-1 z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 md:p-8"
            >
              <div
                className={`grid grid-cols-2 gap-6 md:gap-8 ${!isLoadingStats && (stats?.successRate ?? 0) >= 60 ? "md:grid-cols-4" : "md:grid-cols-3"}`}
              >
                {[
                  {
                    value: isLoadingStats
                      ? "…"
                      : (stats?.studentsCount?.toLocaleString() ?? "0"),
                    label: "Enrolled Students",
                    icon: "groups",
                  },
                  {
                    value: isLoadingStats
                      ? "…"
                      : (stats?.instructorsCount?.toLocaleString() ?? "0"),
                    label: "Qualified Instructors",
                    icon: "school",
                  },
                  ...(!isLoadingStats && (stats?.successRate ?? 0) >= 60
                    ? [
                        {
                          value: `${stats?.successRate}%`,
                          label: "Success Rate",
                          icon: "emoji_events",
                        },
                      ]
                    : []),
                  {
                    value: isLoadingStats ? "…" : (stats?.levelsCount ?? "6"),
                    label: "CEFR Levels",
                    icon: "signal_cellular_alt",
                  },
                ].map((stat, i) => (
                  <div key={i} className="text-center group">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors text-2xl">
                        {stat.icon}
                      </span>
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 font-display">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* WHY GERMANY? */}
        <section id="why-germany" className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              <div>
                <motion.span
                  variants={fadeUp}
                  custom={0}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold mb-4 font-display"
                >
                  Why Germany?
                </motion.span>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-display leading-tight"
                >
                  Europe&apos;s Top Destination for Students &amp; Professionals
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-lg text-slate-600 dark:text-slate-400 mb-4 leading-relaxed"
                >
                  Germany is Europe&apos;s largest economy and one of the
                  world&apos;s leading destinations for international students
                  and professionals. Organizations such as{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    DAAD
                  </span>{" "}
                  provide scholarships to thousands of international students
                  every year.
                </motion.p>
                <motion.p
                  variants={fadeUp}
                  custom={3}
                  className="text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
                >
                  Learning German significantly increases your chances of
                  accessing these opportunities.
                </motion.p>
                <motion.div
                  variants={fadeUp}
                  custom={4}
                  className="space-y-4 mb-8"
                >
                  {[
                    {
                      icon: "school",
                      text: "Public universities with little or no tuition fees",
                    },
                    {
                      icon: "work",
                      text: "High demand for skilled workers across all sectors",
                    },
                    {
                      icon: "payments",
                      text: "Paid vocational training (Ausbildung) programs",
                    },
                    {
                      icon: "gavel",
                      text: "Strong worker protections and competitive salaries",
                    },
                    {
                      icon: "public",
                      text: "Opportunities for international career growth",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-primary text-[16px]">
                          {item.icon}
                        </span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </motion.div>
                <motion.div variants={fadeUp} custom={5}>
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200 font-display"
                  >
                    Explore all opportunities in Germany
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </Link>
                </motion.div>
              </div>
              <motion.div
                variants={fadeUp}
                custom={2}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  {
                    icon: "school",
                    gradient: "from-blue-500 to-indigo-600",
                    title: "Study",
                    stat: "400+",
                    label: "Public Universities",
                    desc: "Tuition-free world-class education",
                  },
                  {
                    icon: "work",
                    gradient: "from-emerald-500 to-teal-600",
                    title: "Work",
                    stat: "1.2M+",
                    label: "Job Openings",
                    desc: "Skilled worker shortage in key sectors",
                  },
                  {
                    icon: "engineering",
                    gradient: "from-violet-500 to-purple-600",
                    title: "Ausbildung",
                    stat: "325+",
                    label: "Training Programs",
                    desc: "Earn while you learn & train",
                  },
                  {
                    icon: "emoji_events",
                    gradient: "from-amber-500 to-orange-600",
                    title: "DAAD",
                    stat: "€1B+",
                    label: "In Scholarships",
                    desc: "Funding for international students",
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-linear-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="material-symbols-outlined text-white text-[18px]">
                        {card.icon}
                      </span>
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                      {card.stat}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {card.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* THREE PATHWAYS */}
        <section
          id="pathways"
          className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.span
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 font-display"
              >
                Three Pathways to Germany
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 font-display"
              >
                Choose Your Path
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
              >
                Whether you want to study, work, or train — German language
                skills are your key to accessing these opportunities.
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  gradient: "from-blue-400 to-indigo-600",
                  icon: "school",
                  title: "Study in Germany",
                  body: "Germany offers world-class education through public universities that often charge minimal tuition fees. Students from around the world apply every year to study engineering, science, medicine, business, and other fields.",
                  note: "German language proficiency improves both your admission chances and your ability to integrate into German academic life.",
                  href: "/opportunities/study",
                  cta: "Explore Study Opportunities",
                },
                {
                  gradient: "from-emerald-400 to-teal-600",
                  icon: "work",
                  title: "Work in Germany",
                  body: "Germany faces a shortage of skilled workers in many sectors. Industries actively seeking international professionals include Healthcare and Nursing, Information Technology, Engineering, and Hospitality and Tourism.",
                  note: "Many of these positions require B1 or B2 German proficiency.",
                  href: "/opportunities/work",
                  cta: "Explore Work Opportunities",
                },
                {
                  gradient: "from-violet-400 to-purple-600",
                  icon: "engineering",
                  title: "Vocational Training (Ausbildung)",
                  body: "Germany's vocational training system combines practical work experience with classroom education. Students receive professional training, earn a salary while studying, and obtain internationally recognized qualifications.",
                  note: "German language skills are required to participate.",
                  href: "/opportunities/ausbildung",
                  cta: "Explore Ausbildung",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500"
                >
                  <div className={`h-1.5 bg-linear-to-r ${card.gradient}`} />
                  <div className="p-8">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-linear-to-br ${card.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="material-symbols-outlined text-white text-2xl">
                        {card.icon}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-display">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-4">
                      {card.body}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 italic">
                      {card.note}
                    </p>
                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href={card.href}
                        className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200 font-display"
                      >
                        {card.cta}
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW GVS HELPS */}
        <section id="how-we-help" className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative order-2 lg:order-1"
              >
                <div className="bg-linear-to-br from-primary/5 to-indigo-500/10 dark:from-primary/10 dark:to-indigo-500/20 rounded-3xl p-8 border border-primary/10 dark:border-primary/20">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        level: "A1",
                        label: "Beginner",
                        color: "from-green-400 to-emerald-500",
                      },
                      {
                        level: "A2",
                        label: "Elementary",
                        color: "from-emerald-400 to-teal-500",
                      },
                      {
                        level: "B1",
                        label: "Intermediate",
                        color: "from-blue-400 to-blue-500",
                      },
                      {
                        level: "B2",
                        label: "Upper Int.",
                        color: "from-indigo-400 to-indigo-600",
                      },
                      {
                        level: "C1",
                        label: "Advanced",
                        color: "from-violet-400 to-purple-600",
                      },
                      {
                        level: "C2",
                        label: "Mastery",
                        color: "from-purple-400 to-fuchsia-600",
                      },
                    ].map((lvl, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:shadow-md transition-shadow"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl bg-linear-to-br ${lvl.color} flex items-center justify-center shrink-0 shadow-md`}
                        >
                          <span className="text-white font-extrabold text-sm font-display">
                            {lvl.level}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm font-display">
                            {lvl.level}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {lvl.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 text-center">
                    <p className="text-xs text-primary font-semibold font-display">
                      A1 → A2 → B1 → B2 → C1 → C2
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Complete CEFR pathway
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="order-1 lg:order-2"
              >
                <motion.span
                  variants={fadeUp}
                  custom={0}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold mb-4 font-display"
                >
                  How German Virtual School Helps
                </motion.span>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-display leading-tight"
                >
                  Your Bridge to Germany Starts Here
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
                >
                  German Virtual School prepares students for opportunities in
                  Germany by providing structured German language training and
                  exam preparation. Our programs help students:
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="space-y-5">
                  {[
                    {
                      icon: "translate",
                      color: "from-blue-500 to-indigo-600",
                      title: "Learn practical German communication",
                      desc: "Structured grammar, vocabulary, listening, and speaking practice for real-world use.",
                    },
                    {
                      icon: "workspace_premium",
                      color: "from-emerald-500 to-teal-600",
                      title: "Prepare for official language certification",
                      desc: "Exam preparation aligned with Goethe-Institut standards, including exams at Goethe-Institut Nairobi.",
                    },
                    {
                      icon: "flight_takeoff",
                      color: "from-violet-500 to-purple-600",
                      title:
                        "Meet language requirements for visas and universities",
                      desc: "Build the exact proficiency level required for your visa type, Ausbildung program, or university.",
                    },
                    {
                      icon: "record_voice_over",
                      color: "from-amber-500 to-orange-600",
                      title:
                        "Gain confidence in speaking and understanding German",
                      desc: "Speaking practice sessions and listening training to make you ready for real situations in Germany.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div
                        className={`w-12 h-12 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="material-symbols-outlined text-white text-xl">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 font-display">
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
                <motion.div variants={fadeUp} custom={4} className="mt-8">
                  <Link
                    href="/courses"
                    className="group relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 font-display"
                  >
                    <span className="relative z-10">Explore Our Courses</span>
                    <span className="material-symbols-outlined relative z-10 text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-primary via-indigo-500 to-primary bg-size-[200%_100%] animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CURRICULUM */}
        <section
          id="curriculum"
          className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.span
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-semibold mb-4 font-display"
              >
                CEFR Aligned
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 font-display"
              >
                German Courses A1 to C2
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
              >
                Structured courses covering the complete Common European
                Framework of Reference for Languages — from beginner to
                near-native mastery.
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {[
                {
                  level: "A1",
                  title: "Beginner",
                  desc: "Basic vocabulary, everyday conversations, simple grammar foundations, and exam preparation.",
                  forWhat: "Family reunification visa · Initial certification",
                  gradient: "from-green-400 to-emerald-500",
                },
                {
                  level: "A2",
                  title: "Elementary",
                  desc: "Daily communication, listening comprehension, speaking practice, basic reading and writing.",
                  forWhat: "Basic access pathways · Everyday communication",
                  gradient: "from-emerald-400 to-teal-500",
                },
                {
                  level: "B1",
                  title: "Intermediate",
                  desc: "Structured conversations, writing longer texts, professional communication, exam preparation.",
                  forWhat: "Ausbildung · Work visa · Residence applications",
                  gradient: "from-blue-400 to-blue-500",
                },
                {
                  level: "B2",
                  title: "Upper Intermediate",
                  desc: "Advanced grammar, professional communication, presentation skills, complex discussions.",
                  forWhat: "University admission · Professional employment",
                  gradient: "from-indigo-400 to-indigo-600",
                },
                {
                  level: "C1",
                  title: "Advanced",
                  desc: "Complex reading comprehension, academic writing, fluent discussion and debate.",
                  forWhat:
                    "University degree programs · Academic study · Research",
                  gradient: "from-violet-400 to-purple-600",
                },
                {
                  level: "C2",
                  title: "Mastery",
                  desc: "Advanced language precision, interpretation of complex texts, high-level communication.",
                  forWhat:
                    "Research · Translation · Teaching · Leadership roles",
                  gradient: "from-purple-400 to-fuchsia-600",
                },
              ].map((course, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className={`h-1.5 bg-linear-to-r ${course.gradient}`} />
                  <div className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-linear-to-br ${course.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-white font-extrabold text-lg font-display">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-display">
                      {course.level} — {course.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                      {course.desc}
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Useful for
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {course.forWhat}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 font-medium">
                        120 contact hours
                      </span>
                      <Link
                        href={`/reserve-seat?program=${course.level}`}
                        className="text-xs font-bold text-primary hover:underline font-display"
                      >
                        Enroll →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary/20 text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all duration-200 font-display"
              >
                View All Courses & Pricing
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* STUDENT SUCCESS STORIES */}
        {(!isLoadingTestimonials && testimonials.length > 0) ||
        isLoadingTestimonials ? (
          <section id="success-stories" className="py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="text-center mb-16"
              >
                <motion.span
                  variants={fadeUp}
                  custom={0}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4 font-display"
                >
                  Real Results
                </motion.span>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 font-display"
                >
                  Student Success Stories
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                >
                  Students who passed German exams, moved to Germany, received
                  scholarships, and secured Ausbildung placements.
                </motion.p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {isLoadingTestimonials ? (
                  <div className="col-span-3 text-center py-24 text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm font-medium animate-pulse">
                        Loading stories...
                      </p>
                    </div>
                  </div>
                ) : (
                  testimonials.slice(0, 3).map((testimonial, i) => (
                    <motion.div
                      key={testimonial.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative"
                    >
                      <div className="absolute top-6 right-8 text-6xl text-primary/8 font-serif leading-none select-none">
                        &rdquo;
                      </div>
                      <div className="flex gap-1 mb-5">
                        {[...Array(5)].map((_, s) => (
                          <span
                            key={s}
                            className={`material-symbols-outlined text-lg ${s < testimonial.rating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed mb-6 relative z-10">
                        {testimonial.content}
                      </p>
                      <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-primary/5">
                          {testimonial.student?.avatarUrl ? (
                            <img
                              src={testimonial.student.avatarUrl}
                              alt="Student"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm uppercase">
                              {testimonial.student?.firstName?.[0]}
                              {testimonial.student?.lastName?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white text-sm font-display truncate">
                            {testimonial.student?.firstName}{" "}
                            {testimonial.student?.lastName}
                          </p>
                          <p className="text-xs text-primary font-medium truncate">
                            {testimonial.student?.studentProfile?.address ||
                              "Verified Graduate"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              {!isLoadingTestimonials && testimonials.length > 0 && (
                <div className="text-center mt-10">
                  <Link
                    href="/success-stories"
                    className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200 font-display"
                  >
                    See all success stories
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </section>
        ) : null}

        {/* PARTNER PROGRAM */}
        <section className="py-24 lg:py-32 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-30" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-6 font-display">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Become a Partner / Marketer
                </span>
                <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 font-display">
                  Earn While Sharing Excellence
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                  Become a Marketing Partner and earn commissions for every
                  student you refer. Turn your network into a revenue stream.
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
                        <span className="material-symbols-outlined text-green-400 text-sm">
                          check
                        </span>
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
                  <Link
                    href="/partners"
                    className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all font-display"
                  >
                    Learn More
                  </Link>
                  <Link
                    href="/marketer/login"
                    className="px-6 py-4 border border-white/10 text-slate-400 font-medium rounded-xl hover:bg-white/5 transition-all text-sm font-display"
                  >
                    Marketer Login
                  </Link>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-2xl">
                        payments
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display">
                        Partner Dashboard
                      </h3>
                      <p className="text-xs text-slate-400">
                        Track referrals & commissions
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Referred Students
                        </p>
                        <p className="text-xl font-extrabold font-display">
                          124
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-green-400">
                        trending_up
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Total Earned
                        </p>
                        <p className="text-xl font-extrabold font-display">
                          $248,000
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-green-400">
                        account_balance_wallet
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* JOIN MODAL */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-slate-100 dark:border-slate-800"
            >
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              <div className="w-12 h-12 bg-linear-to-br from-primary to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">
                  handshake
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 font-display">
                Partner with Us
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Submit your details and our team will set up your marketing
                account.
              </p>
              {joinSubmitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
                  <span className="material-symbols-outlined text-4xl mb-2 text-green-500">
                    check_circle
                  </span>
                  <p className="font-bold font-display">Request Sent!</p>
                  <p className="text-sm mt-1">
                    We will be in touch shortly via email.
                  </p>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors font-display"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  {joinFields.map(({ label, type, key, ph, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {label} {required && "*"}
                      </label>
                      <input
                        type={type}
                        required={required}
                        value={joinForm[key]}
                        onChange={(e) =>
                          setJoinForm({ ...joinForm, [key]: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                        placeholder={ph}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      How do you plan to refer students?
                    </label>
                    <textarea
                      rows={3}
                      value={joinForm.message}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, message: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white resize-none"
                      placeholder="e.g. I run a student community on social media..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingJoin}
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center font-display"
                  >
                    {isSubmittingJoin ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* PRICING */}
        {stats.fees &&
          (stats.fees.courses.length > 0 ||
            stats.fees.seatReservationFee ||
            stats.fees.materialFee) && (
            <section
              id="pricing"
              className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50"
            >
              <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="text-center mb-16"
                >
                  <motion.span
                    variants={fadeUp}
                    custom={0}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 font-display"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      payments
                    </span>{" "}
                    Transparent Pricing
                  </motion.span>
                  <motion.h2
                    variants={fadeUp}
                    custom={1}
                    className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 font-display"
                  >
                    Fees &amp; Course Pricing
                  </motion.h2>
                  <motion.p
                    variants={fadeUp}
                    custom={2}
                    className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
                  >
                    Clear breakdown of all costs — no hidden charges. Flexible
                    installment plans available.
                  </motion.p>
                </motion.div>
                {(stats.fees.seatReservationFee || stats.fees.materialFee) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
                    {stats.fees.seatReservationFee && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30 overflow-hidden group hover:shadow-lg transition-all duration-300"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <span className="material-symbols-outlined text-white text-xl">
                                confirmation_number
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white font-display">
                                Seat Reservation
                              </h3>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                One-time, non-refundable
                              </p>
                            </div>
                          </div>
                          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-display">
                            ${stats.fees.seatReservationFee.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Deducted from your total tuition fee
                            {stats.fees.intakeLabel
                              ? `. Secures spot for ${stats.fees.intakeLabel} intake.`
                              : "."}
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {stats.fees.materialFee && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/30 overflow-hidden group hover:shadow-lg transition-all duration-300"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                              <span className="material-symbols-outlined text-white text-xl">
                                menu_book
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white font-display">
                                Learning Materials
                              </h3>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                One-time fee
                              </p>
                            </div>
                          </div>
                          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
                            ${stats.fees.materialFee.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Covers all course materials and digital resources
                            {stats.fees.materialFeeDeadline
                              ? `. Due by ${new Date(stats.fees.materialFeeDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                              : ""}
                            .
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                {stats.fees.courses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.fees.courses.map((course, idx) => {
                      const levelColors: Record<string, string> = {
                        A1: "from-green-400 to-emerald-500",
                        A2: "from-emerald-400 to-teal-500",
                        B1: "from-blue-400 to-blue-500",
                        B2: "from-indigo-400 to-indigo-600",
                        C1: "from-violet-400 to-purple-600",
                        C2: "from-purple-400 to-fuchsia-600",
                      };
                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.08 }}
                          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
                        >
                          <div
                            className={`h-1.5 bg-linear-to-r ${levelColors[course.level] || "from-slate-300 to-slate-400"}`}
                          />
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full bg-linear-to-r ${levelColors[course.level] || "from-slate-300 to-slate-400"} text-white font-display`}
                              >
                                {course.level}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">
                                  schedule
                                </span>
                                {course.durationWeeks} weeks
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-3 font-display">
                              {course.title}
                            </h3>
                            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 font-display">
                              ${course.price.toLocaleString()}
                            </p>
                            {course.feePlans.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                  Payment Options
                                </p>
                                {course.feePlans.map((fp, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 py-1"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span className="material-symbols-outlined text-[14px] text-primary">
                                        check_circle
                                      </span>
                                      {fp.billingCycle
                                        .replace(/_/g, " ")
                                        .toLowerCase()
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        )}
                                      {fp.installments > 1 &&
                                        ` (${fp.installments}x)`}
                                    </span>
                                    <span className="font-semibold">
                                      ${fp.amount.toLocaleString()}
                                      {fp.installments > 1 ? "/inst." : ""}
                                    </span>
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-12 max-w-3xl mx-auto bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl p-6 border border-primary/10 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                      credit_score
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base font-display">
                      Flexible Installment Plans
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tuition fees are payable in installments with a minimum of{" "}
                    <strong className="text-primary">
                      ${minInstallment.toLocaleString()}
                    </strong>{" "}
                    per installment.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                    {[
                      "No interest charged",
                      `Min. $${minInstallment.toLocaleString()} per installment`,
                      "Per semester billing",
                    ].map((t, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-green-500">
                          check_circle
                        </span>
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          )}

        {/* ENROLL NOW */}
        <section
          id="enroll"
          className="relative py-24 lg:py-32 overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary via-indigo-600 to-violet-700 animate-gradient-x" />
          <div className="absolute inset-0 hero-grid opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-white/5 rounded-full blur-[120px]" />
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center relative z-10 text-white">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold font-display"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {stats.fees?.intakeLabel || "May"} 2026 Intake · Enrollment Open
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-3xl lg:text-5xl font-extrabold mb-4 font-display"
              >
                Enroll Now
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-xl mb-4 text-white/80 leading-relaxed"
              >
                Begin your German language journey today. German Virtual School
                offers structured courses designed to prepare students for
                international opportunities.
              </motion.p>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-lg mb-8 text-white/80"
              >
                Reserve your seat in our upcoming intake and start building the
                language skills needed for your future in Germany.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={4}
                className="flex flex-wrap items-center justify-center gap-4 mb-10 text-sm text-white/70"
              >
                {[
                  { icon: "lock", text: "Locks your seat" },
                  { icon: "receipt_long", text: "Deducted from total fee" },
                  {
                    icon: "schedule",
                    text: `${stats.fees?.intakeLabel || "May"} 2026 start`,
                  },
                  { icon: "payments", text: "Flexible payment plans" },
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    {item.text}
                  </span>
                ))}
              </motion.div>
              <motion.div
                variants={fadeUp}
                custom={5}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/reserve-seat"
                  className="group relative px-10 py-4 bg-white text-primary text-lg font-bold rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all duration-300 font-display"
                >
                  Reserve Your Seat
                  {stats.fees?.seatReservationFee
                    ? ` — $${stats.fees.seatReservationFee.toLocaleString()}`
                    : ""}
                </Link>
                <Link
                  href="/courses"
                  className="px-10 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 font-display"
                >
                  View Course Schedule
                </Link>
              </motion.div>
              <motion.p
                variants={fadeUp}
                custom={6}
                className="mt-10 text-sm text-white/60"
              >
                Questions? Contact us at{" "}
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@germanvirtualschool.com"}`}
                  className="underline hover:text-white transition-colors"
                >
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
                    "support@germanvirtualschool.com"}
                </a>
              </motion.p>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
