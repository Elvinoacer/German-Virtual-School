"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";
import { toast } from "sonner";
import { usePublicStats } from "@/hooks/usePublicStats";

/* ============================================================
   TYPES
============================================================ */

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

/* ============================================================
   FORM CONFIG
============================================================ */

const joinFields: Array<{
  label: string;
  type: "text" | "email" | "tel";
  key: keyof JoinFormData;
  ph: string;
  required: boolean;
}> = [
  { label: "Full Name", type: "text", key: "name", ph: "e.g. John Doe", required: true },
  { label: "Email Address", type: "email", key: "email", ph: "john@example.com", required: true },
  { label: "Phone Number", type: "tel", key: "phone", ph: "+254 7XX XXX XXX", required: true },
];

/* ============================================================
   MOTION PRESETS
============================================================ */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, delay: i * 0.09, ease: EASE },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ============================================================
   CONTENT DATA
============================================================ */

const HERO_ROTATING = ["Study", "Work", "Train"];

const TRUST_ITEMS = [
  { icon: "verified", label: "CEFR Aligned Curriculum" },
  { icon: "school", label: "Goethe-Institut Exam Prep" },
  { icon: "groups", label: "Live Online Classes" },
  { icon: "workspace_premium", label: "Certified Instructors" },
  { icon: "public", label: "Students Across Africa" },
  { icon: "event_available", label: "Flexible Intakes" },
  { icon: "payments", label: "Installment Plans" },
  { icon: "handshake", label: "Career & Visa Support" },
];

const WHY_BENEFITS = [
  { icon: "school", text: "Public universities with little or no tuition fees" },
  { icon: "work", text: "High demand for skilled workers across all sectors" },
  { icon: "payments", text: "Paid vocational training (Ausbildung) programs" },
  { icon: "gavel", text: "Strong worker protections and competitive salaries" },
  { icon: "public", text: "Opportunities for international career growth" },
];

const PATHWAYS = [
  {
    index: "01",
    icon: "school",
    title: "Study in Germany",
    short: "Study",
    gradient: "from-blue-500 via-indigo-500 to-indigo-700",
    stat: "400+",
    statLabel: "Public Universities",
    body: "Germany offers world-class education through public universities that often charge minimal tuition fees. Students from around the world apply every year to study engineering, science, medicine, business, and other fields.",
    note: "German language proficiency improves both your admission chances and your ability to integrate into German academic life.",
    points: [
      "Tuition-free public universities",
      "DAAD scholarships & funding",
      "Globally recognized degrees",
      "Post-study work opportunities",
    ],
    href: "/opportunities/study",
    cta: "Explore Study Opportunities",
    image: "/images/opportunities_study.png",
  },
  {
    index: "02",
    icon: "work",
    title: "Work in Germany",
    short: "Work",
    gradient: "from-emerald-500 via-teal-500 to-teal-700",
    stat: "1.2M+",
    statLabel: "Job Openings",
    body: "Germany faces a shortage of skilled workers in many sectors. Industries actively seeking international professionals include Healthcare and Nursing, Information Technology, Engineering, and Hospitality and Tourism.",
    note: "Many of these positions require B1 or B2 German proficiency.",
    points: [
      "High demand across key sectors",
      "Healthcare, IT, engineering & more",
      "B1/B2 German often required",
      "Competitive salaries & protections",
    ],
    href: "/opportunities/work",
    cta: "Explore Work Opportunities",
    image: "/images/opportunities_work.png",
  },
  {
    index: "03",
    icon: "engineering",
    title: "Vocational Training (Ausbildung)",
    short: "Ausbildung",
    gradient: "from-violet-500 via-purple-500 to-purple-700",
    stat: "325+",
    statLabel: "Training Programs",
    body: "Germany's vocational training system combines practical work experience with classroom education. Students receive professional training, earn a salary while studying, and obtain internationally recognized qualifications.",
    note: "German language skills are required to participate.",
    points: [
      "Earn a salary while you train",
      "Internationally recognized qualifications",
      "325+ training programs available",
      "Direct path to employment",
    ],
    href: "/opportunities/ausbildung",
    cta: "Explore Ausbildung",
    image: "/images/vocational_training.jpg",
  },
];

const GVS_FEATURES = [
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
    title: "Meet language requirements for visas and universities",
    desc: "Build the exact proficiency level required for your visa type, Ausbildung program, or university.",
  },
  {
    icon: "record_voice_over",
    color: "from-amber-500 to-orange-600",
    title: "Gain confidence in speaking and understanding German",
    desc: "Speaking practice sessions and listening training to make you ready for real situations in Germany.",
  },
];

const CEFR_LEVELS = [
  { level: "A1", label: "Beginner", color: "from-green-400 to-emerald-500" },
  { level: "A2", label: "Elementary", color: "from-emerald-400 to-teal-500" },
  { level: "B1", label: "Intermediate", color: "from-blue-400 to-blue-500" },
  { level: "B2", label: "Upper Int.", color: "from-indigo-400 to-indigo-600" },
  { level: "C1", label: "Advanced", color: "from-violet-400 to-purple-600" },
  { level: "C2", label: "Mastery", color: "from-purple-400 to-fuchsia-600" },
];

const JOURNEY_STEPS = [
  {
    icon: "how_to_reg",
    title: "Enroll & Get Placed",
    desc: "Take our placement assessment and join the level that fits you — complete beginner or continuing learner.",
  },
  {
    icon: "translate",
    title: "Learn German, Level by Level",
    desc: "Live interactive classes with structured grammar, vocabulary, listening, and plenty of real speaking practice.",
  },
  {
    icon: "workspace_premium",
    title: "Pass Your Exam",
    desc: "Goethe-aligned exam preparation with mock tests, instructor feedback, and proven strategies for certification day.",
  },
  {
    icon: "flight_takeoff",
    title: "Visa & Interview Support",
    desc: "Meet the language requirements for your visa type and prepare for consulate and embassy interviews with confidence.",
  },
  {
    icon: "flag",
    title: "Arrive Ready in Germany",
    desc: "Start your university program, Ausbildung, or skilled job with the language skills to live, work, and thrive.",
  },
];

const LEVELS = [
  {
    level: "A1",
    title: "Beginner",
    gradient: "from-green-400 to-emerald-500",
    desc: "Basic vocabulary, everyday conversations, simple grammar foundations, and exam preparation.",
    uses: ["Family reunification visa", "Initial certification"],
  },
  {
    level: "A2",
    title: "Elementary",
    gradient: "from-emerald-400 to-teal-500",
    desc: "Daily communication, listening comprehension, speaking practice, basic reading and writing.",
    uses: ["Basic access pathways", "Everyday communication"],
  },
  {
    level: "B1",
    title: "Intermediate",
    gradient: "from-blue-400 to-blue-500",
    desc: "Structured conversations, writing longer texts, professional communication, exam preparation.",
    uses: ["Ausbildung", "Work visa", "Residence applications"],
  },
  {
    level: "B2",
    title: "Upper Intermediate",
    gradient: "from-indigo-400 to-indigo-600",
    desc: "Advanced grammar, professional communication, presentation skills, complex discussions.",
    uses: ["University admission", "Professional employment"],
  },
  {
    level: "C1",
    title: "Advanced",
    gradient: "from-violet-400 to-purple-600",
    desc: "Complex reading comprehension, academic writing, fluent discussion and debate.",
    uses: ["University degree programs", "Academic study", "Research"],
  },
  {
    level: "C2",
    title: "Mastery",
    gradient: "from-purple-400 to-fuchsia-600",
    desc: "Advanced language precision, interpretation of complex texts, high-level communication.",
    uses: ["Research", "Translation", "Teaching", "Leadership roles"],
  },
];

const PARTNER_PERKS = [
  "Earn commissions on every student enrollment",
  "Earn an additional $15 on full tuition payment",
  "Transparent dashboard & direct bank/card payouts",
  "Receive a unique referral code instantly",
];

const COMMISSION_BARS = [42, 58, 38, 70, 52, 78, 62, 86, 55, 74, 92, 84];

const CTA_FLOAT_WORDS = [
  { w: "Guten Tag!", x: "6%", y: "16%", d: "0s" },
  { w: "Los geht's!", x: "80%", y: "12%", d: "1.3s" },
  { w: "Zukunft", x: "10%", y: "74%", d: "2.1s" },
  { w: "Erfolg", x: "84%", y: "66%", d: "0.7s" },
  { w: "Willkommen", x: "44%", y: "6%", d: "2.8s" },
];

/* ============================================================
   UTILITY COMPONENTS
============================================================ */

/** Animated number that counts up when scrolled into view. */
function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.9,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {Math.round(value).toLocaleString()}
      {suffix}
    </span>
  );
}

/** Card wrapper with a cursor-following spotlight glow. */
function SpotlightCard({
  children,
  className = "",
  glow = "rgba(19, 91, 236, 0.10)",
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={`group/spot relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${glow}, transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
}

/** Consistent animated section heading: eyebrow pill + title + subtitle. */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-xl"}
    >
      <motion.span
        variants={fadeUp}
        custom={0}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5 font-display border ${
          dark
            ? "bg-white/10 text-white border-white/15"
            : "bg-primary/5 dark:bg-primary/15 text-primary border-primary/10 dark:border-primary/20"
        }`}
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        custom={1}
        className={`text-3xl lg:text-[2.75rem] font-extrabold font-display leading-[1.15] tracking-tight mb-4 ${
          dark ? "text-white" : "text-slate-900 dark:text-white"
        }`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          custom={2}
          className={`text-base lg:text-lg leading-relaxed ${
            dark ? "text-slate-300" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

/** Testimonial card used inside the marquee rows. */
function TestimonialCard({ t }: { t: Testimonial }) {
  const initials =
    `${t.student?.firstName?.[0] ?? ""}${t.student?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "GV";

  return (
    <article className="w-[320px] sm:w-[380px] shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, s) => (
          <span
            key={s}
            className={`material-symbols-outlined text-lg ${
              s < t.rating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-5 line-clamp-5">
        &ldquo;{t.content}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-primary/10">
          {t.student?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.student.avatarUrl}
              alt={`${t.student?.firstName ?? "Student"} ${t.student?.lastName ?? ""}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm uppercase">
              {initials}
            </div>
          )}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-slate-900 dark:text-white text-sm font-display truncate">
            {t.student?.firstName} {t.student?.lastName}
          </p>
          <p className="text-xs text-primary font-medium truncate">
            {t.student?.studentProfile?.address || "Verified Graduate"}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function Home() {
  /* ---------- smooth anchor scrolling (kept from original) ---------- */
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

  /* ---------- state ---------- */
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

  /* ---------- interactive section state ---------- */
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [activePathway, setActivePathway] = useState(0);
  const [activeLevel, setActiveLevel] = useState(0);

  const reduceMotion = useReducedMotion();

  /* ---------- hero rotating word ---------- */
  useEffect(() => {
    const t = setInterval(
      () => setHeroWordIndex((i) => (i + 1) % HERO_ROTATING.length),
      2800,
    );
    return () => clearInterval(t);
  }, []);

  /* ---------- hero parallax ---------- */
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOrbY1 = useTransform(heroScroll, [0, 1], [0, 130]);
  const heroOrbY2 = useTransform(heroScroll, [0, 1], [0, -90]);
  const heroImageY = useTransform(heroScroll, [0, 1], [0, 64]);

  /* ---------- journey timeline scroll progress ---------- */
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: timelineScroll } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.55"],
  });
  const timelineProgress = useSpring(timelineScroll, {
    stiffness: 120,
    damping: 30,
  });

  /* ---------- modal: escape key + body scroll lock ---------- */
  useEffect(() => {
    if (!showJoinModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowJoinModal(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showJoinModal]);

  /* ---------- data fetchers ---------- */
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
  const showSuccessRate = !isLoadingStats && (stats?.successRate ?? 0) >= 60;

  /* ---------- stats band items ---------- */
  const statItems = [
    {
      icon: "groups",
      label: "Enrolled Students",
      node: (
        <CountUp
          to={stats?.studentsCount ?? 0}
          className="tabular-nums"
        />
      ),
    },
    {
      icon: "school",
      label: "Qualified Instructors",
      node: (
        <CountUp
          to={stats?.instructorsCount ?? 0}
          className="tabular-nums"
        />
      ),
    },
    ...(showSuccessRate
      ? [
          {
            icon: "emoji_events",
            label: "Success Rate",
            node: <CountUp to={stats?.successRate ?? 0} suffix="%" className="tabular-nums" />,
          },
        ]
      : []),
    {
      icon: "signal_cellular_alt",
      label: "CEFR Levels",
      node: <CountUp to={stats?.levelsCount ?? 6} className="tabular-nums" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <main>
        {/* ============================================================
            HERO
        ============================================================ */}
        <section
          ref={heroRef}
          className="relative min-h-[92vh] flex items-center overflow-hidden pt-8 pb-28 lg:pt-4 lg:pb-32"
        >
          {/* background layers */}
          <div className="absolute inset-0 hero-grid" aria-hidden />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_-8%,rgba(19,91,236,0.10),transparent_70%)] dark:bg-[radial-gradient(ellipse_65%_50%_at_50%_-8%,rgba(19,91,236,0.22),transparent_70%)]"
            aria-hidden
          />
          <motion.div
            style={reduceMotion ? undefined : { y: heroOrbY1 }}
            className="absolute -top-44 -right-36 w-[520px] h-[520px] rounded-full bg-primary/10 blur-[130px] pointer-events-none"
            aria-hidden
          />
          <motion.div
            style={reduceMotion ? undefined : { y: heroOrbY2 }}
            className="absolute -bottom-44 -left-36 w-[440px] h-[440px] rounded-full bg-indigo-500/10 blur-[110px] pointer-events-none"
            aria-hidden
          />

          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
              {/* ---------- left: copy ---------- */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="relative z-10"
              >
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  className="inline-flex items-center gap-2.5 mb-7 px-4 py-2 rounded-full bg-primary/5 border border-primary/15 dark:bg-primary/10 dark:border-primary/20"
                >
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-green-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-xs font-semibold tracking-widest uppercase text-primary font-display">
                    Live Online German Classes
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  custom={1}
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.06] tracking-tight mb-7 font-display"
                >
                  Start Your Journey to{" "}
                  <span className="relative inline-flex overflow-hidden align-bottom">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={heroWordIndex}
                        initial={{ y: "105%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-105%", opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="text-gradient inline-block"
                      >
                        {HERO_ROTATING[heroWordIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <br />
                  in Germany{" "}
                  <span
                    className="inline-block"
                    role="img"
                    aria-label="Germany flag"
                  >
                    🇩🇪
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-5 leading-relaxed max-w-xl"
                >
                  Germany is Europe&apos;s top destination for international
                  students and skilled professionals — but most of these
                  opportunities require{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    German language proficiency
                  </span>
                  .
                </motion.p>
                <motion.p
                  variants={fadeUp}
                  custom={3}
                  className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-9 leading-relaxed max-w-xl"
                >
                  German Virtual School gives you the structured training, live
                  classes, and exam preparation you need to study, train, and
                  work in Germany.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  custom={4}
                  className="flex flex-col sm:flex-row gap-3.5"
                >
                  <Link
                    href="/courses"
                    className="btn-shine group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300 font-display"
                  >
                    Start Learning German
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform duration-300">
                      arrow_forward
                    </span>
                  </Link>
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-2xl hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5 transition-all duration-300 font-display"
                  >
                    Explore Opportunities
                  </Link>
                </motion.div>

                {/* social proof row */}
                <motion.div
                  variants={fadeUp}
                  custom={5}
                  className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2.5">
                      {["JM", "AK", "WO", "TN"].map((ini, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-950 bg-linear-to-br from-primary to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white"
                        >
                          {ini}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {isLoadingStats
                          ? "…"
                          : `${stats?.studentsCount?.toLocaleString() ?? "0"}+ students`}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        already learning with GVS
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block h-9 w-px bg-slate-200 dark:bg-slate-800" />
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      verified
                    </span>
                    <span className="font-semibold">
                      CEFR Certified A1–C2
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* ---------- right: layered visual ---------- */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 26 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
                className="relative"
              >
                <motion.div
                  style={reduceMotion ? undefined : { y: heroImageY }}
                  className="relative"
                >
                  {/* glow behind */}
                  <div
                    className="absolute -inset-7 bg-linear-to-tr from-primary/25 via-indigo-500/15 to-transparent blur-2xl rounded-[2.75rem]"
                    aria-hidden
                  />

                  {/* main image card */}
                  <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-2xl shadow-primary/15 animate-float-slow">
                    <div className="aspect-4/3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/german_school.png"
                        alt="German classroom environment for international students"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className="absolute inset-0 bg-linear-to-t from-slate-950/55 via-transparent to-transparent"
                      aria-hidden
                    />
                    {/* caption chip */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">
                          play_lesson
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            Live Interactive Classes
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Learn from anywhere, on any schedule
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* floating card — exam passed (top-left) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75, duration: 0.6, ease: EASE }}
                    className="absolute -top-7 -left-3 sm:-left-9 animate-float z-10"
                  >
                    <div className="glass rounded-2xl p-3.5 shadow-xl shadow-slate-900/10 border border-white/50 dark:border-slate-700/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="material-symbols-outlined text-white text-xl">
                          workspace_premium
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white font-display">
                          Goethe B1 Exam
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">
                            check_circle
                          </span>
                          Passed · Certified
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* floating card — live class (bottom-right) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.95, duration: 0.6, ease: EASE }}
                    className="absolute -bottom-9 -right-2 sm:-right-7 animate-float [animation-delay:1.2s] z-10"
                  >
                    <div className="glass rounded-2xl p-3.5 shadow-xl shadow-slate-900/10 border border-white/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-ring" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Live now
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-indigo-500 flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-white text-lg">
                            record_voice_over
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white font-display">
                            Speaking Practice
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            A2 · with instructor
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* floating card — level progress (bottom-left) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15, duration: 0.6, ease: EASE }}
                    className="absolute -bottom-6 -left-3 sm:-left-12 animate-float-slow [animation-delay:2.1s] hidden sm:block z-10"
                  >
                    <div className="glass rounded-2xl p-3.5 shadow-xl shadow-slate-900/10 border border-white/50 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                        Your pathway
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          {["A1", "A2", "B1"].map((l, i) => (
                            <span
                              key={l}
                              className={`w-7 h-7 rounded-lg text-[10px] font-extrabold font-display flex items-center justify-center ${
                                i < 2
                                  ? "bg-primary text-white"
                                  : "bg-linear-to-br from-violet-500 to-purple-600 text-white"
                              }`}
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">
                            flight_takeoff
                          </span>
                          Germany
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* scroll indicator */}
          <div
            className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2.5 text-slate-400 dark:text-slate-500"
            aria-hidden
          >
            <div className="w-6 h-10 rounded-full border-2 border-current flex justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-current animate-scroll-dot" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              Scroll
            </span>
          </div>
        </section>

        {/* ============================================================
            STATS BAND (overlaps hero bottom)
        ============================================================ */}
        <section className="relative z-20 -mt-16 lg:-mt-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-300/40 dark:shadow-slate-950/60 border border-white/70 dark:border-slate-800 p-6 md:p-8 overflow-hidden"
            >
              <div
                className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
                aria-hidden
              />
              <div
                className={`grid grid-cols-2 ${
                  showSuccessRate ? "md:grid-cols-4" : "md:grid-cols-3"
                } gap-y-8 gap-x-4 md:gap-8`}
              >
                {statItems.map((stat, i) => (
                  <div key={i} className="group text-center">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary transition-colors duration-300">
                      <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors duration-300 text-xl">
                        {stat.icon}
                      </span>
                    </div>
                    <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
                      {isLoadingStats ? (
                        <span className="inline-block w-16 h-8 rounded-lg bg-slate-200/80 dark:bg-slate-800 animate-pulse align-middle" />
                      ) : (
                        stat.node
                      )}
                    </p>
                    <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em] font-semibold mt-1.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================
            TRUST MARQUEE
        ============================================================ */}
        <section className="py-12 lg:py-16 overflow-hidden" aria-label="Why students choose us">
          <div className="mask-fade-x marquee-paused overflow-hidden">
            <div
              className="flex w-max animate-marquee-left"
              style={{ "--marquee-duration": "38s" } as React.CSSProperties}
            >
              {[0, 1].map((set) => (
                <div
                  key={set}
                  className="flex gap-4 pr-4 shrink-0"
                  aria-hidden={set === 1}
                >
                  {TRUST_ITEMS.map((item) => (
                    <div
                      key={`${set}-${item.label}`}
                      className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 whitespace-nowrap hover:border-primary/30 hover:bg-primary/5 transition-colors duration-300"
                    >
                      <span className="material-symbols-outlined text-primary text-lg">
                        {item.icon}
                      </span>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            WHY GERMANY — bento grid
        ============================================================ */}
        <section id="why-germany" className="py-20 lg:py-28 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-end mb-12 lg:mb-14">
              <SectionHeading
                align="left"
                eyebrow="Why Germany?"
                title="Europe's Top Destination for Students &amp; Professionals"
                subtitle="Germany is Europe's largest economy and one of the world's leading destinations for international students and professionals. Organizations such as DAAD provide scholarships to thousands of international students every year — and learning German significantly increases your chances of accessing these opportunities."
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE }}
                className="lg:justify-self-end lg:text-right"
              >
                <Link
                  href="/opportunities"
                  className="group inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3.5 transition-all duration-300 font-display"
                >
                  Explore all opportunities in Germany
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-300">
                    arrow_forward
                  </span>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
            >
              {/* Study — large feature card */}
              <motion.div variants={fadeUp} custom={0} className="md:col-span-2 lg:row-span-2 h-full">
                <SpotlightCard className="h-full rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden group">
                  <div className="relative h-full min-h-[340px] lg:min-h-[440px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/opportunities_study.png"
                      alt="International students studying at a German university"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/35 to-slate-950/10"
                      aria-hidden
                    />
                    <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end text-white">
                      <span className="inline-flex w-fit items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold font-display mb-4">
                        <span className="material-symbols-outlined text-[16px]">school</span>
                        Study
                      </span>
                      <h3 className="text-2xl lg:text-4xl font-extrabold font-display mb-2.5">
                        400+ Public Universities
                      </h3>
                      <p className="text-sm lg:text-base text-white/75 leading-relaxed max-w-md mb-5">
                        Tuition-free, world-class education in engineering,
                        science, medicine, and business — with degrees
                        recognized around the globe.
                      </p>
                      <Link
                        href="/opportunities/study"
                        className="group/link inline-flex w-fit items-center gap-2 text-sm font-semibold text-white hover:gap-3.5 transition-all duration-300 font-display"
                      >
                        Explore studying in Germany
                        <span className="material-symbols-outlined text-[18px] group-hover/link:translate-x-1 transition-transform duration-300">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>

              {/* Work */}
              <motion.div variants={fadeUp} custom={1}>
                <SpotlightCard className="h-full rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                      <span className="material-symbols-outlined text-white text-xl">work</span>
                    </div>
                    <span className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                      1.2M+
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-display mb-1.5">
                    Work
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Job Openings
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Skilled worker shortage across healthcare, IT, engineering,
                    and hospitality.
                  </p>
                </SpotlightCard>
              </motion.div>

              {/* Ausbildung */}
              <motion.div variants={fadeUp} custom={2}>
                <SpotlightCard className="h-full rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <span className="material-symbols-outlined text-white text-xl">engineering</span>
                    </div>
                    <span className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                      325+
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-display mb-1.5">
                    Ausbildung
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Training Programs
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Paid vocational training — earn a salary while you learn
                    and qualify.
                  </p>
                </SpotlightCard>
              </motion.div>

              {/* DAAD */}
              <motion.div variants={fadeUp} custom={3}>
                <SpotlightCard
                  glow="rgba(245, 158, 11, 0.12)"
                  className="h-full rounded-3xl border border-amber-100 dark:border-amber-900/30 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                      <span className="material-symbols-outlined text-white text-xl">emoji_events</span>
                    </div>
                    <span className="text-2xl font-extrabold font-display text-amber-600 dark:text-amber-400">
                      €1B+
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-display mb-1.5">
                    DAAD
                  </h3>
                  <p className="text-xs font-semibold text-amber-600/80 dark:text-amber-400/70 uppercase tracking-wider mb-2.5">
                    In Scholarships
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Generous funding for international students every single
                    year.
                  </p>
                </SpotlightCard>
              </motion.div>

              {/* Salaries / worker rights */}
              <motion.div variants={fadeUp} custom={4} className="md:col-span-2">
                <SpotlightCard
                  glow="rgba(99, 102, 241, 0.10)"
                  className="h-full rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-linear-to-br from-primary/5 via-white to-indigo-500/5 dark:from-primary/10 dark:via-slate-900 dark:to-indigo-500/10 p-6 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <span className="material-symbols-outlined text-white text-xl">gavel</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white font-display">
                          Strong Rights &amp; Salaries
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Worker protections
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-5">
                      Germany combines competitive salaries with some of the
                      strongest worker protections in the world — a stable
                      foundation for international career growth.
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>
            </motion.div>

            {/* benefit chips */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mt-8 lg:mt-10 flex flex-wrap justify-center gap-3"
            >
              {WHY_BENEFITS.map((b, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i * 0.4}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-300"
                >
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    {b.icon}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    {b.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================================================
            THREE PATHWAYS — interactive expanding panels
        ============================================================ */}
        <section
          id="pathways"
          className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/40 scroll-mt-20 relative overflow-hidden"
        >
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative">
            <SectionHeading
              eyebrow="Three Pathways to Germany"
              title="Choose Your Path"
              subtitle="Whether you want to study, work, or train — German language skills are your key to accessing these opportunities. Hover or tap a panel to explore it."
            />

            {/* --- desktop: expanding panels --- */}
            <div className="hidden md:flex gap-4 h-[540px] mt-14">
              {PATHWAYS.map((p, i) => {
                const isActive = activePathway === i;
                return (
                  <motion.div
                    key={p.index}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onMouseEnter={() => setActivePathway(i)}
                    onFocus={() => setActivePathway(i)}
                    onClick={() => setActivePathway(i)}
                    initial={false}
                    animate={{ flexGrow: isActive ? 3.1 : 1 }}
                    transition={{ duration: 0.65, ease: EASE }}
                    className="relative flex-1 basis-0 min-w-0 rounded-3xl overflow-hidden cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {/* background image */}
                    <motion.img
                      src={p.image}
                      alt={p.title}
                      animate={{
                        opacity: isActive ? 1 : 0.35,
                        scale: isActive ? 1.04 : 1,
                      }}
                      transition={{ duration: 0.7, ease: EASE }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* overlays */}
                    <div
                      className="absolute inset-0 bg-slate-950/45"
                      aria-hidden
                    />
                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/55 to-slate-950/20"
                      aria-hidden
                    />

                    {/* collapsed label (vertical) */}
                    <AnimatePresence>
                      {!isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 flex flex-col items-center justify-between py-8 text-white select-none"
                        >
                          <span className="text-sm font-bold font-display text-white/60 tracking-widest">
                            {p.index}
                          </span>
                          <span className="[writing-mode:vertical-rl] rotate-180 text-lg font-extrabold font-display tracking-[0.18em] whitespace-nowrap">
                            {p.short}
                          </span>
                          <span className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">
                              expand_more
                            </span>
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* expanded content */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 28 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 14 }}
                          transition={{ duration: 0.45, delay: 0.16, ease: EASE }}
                          className="absolute inset-0 p-8 lg:p-10 flex flex-col justify-end text-white"
                        >
                          <span className="text-sm font-bold font-display text-white/60 tracking-widest mb-3">
                            {p.index}
                          </span>
                          <h3 className="text-2xl lg:text-3xl font-extrabold font-display mb-3">
                            {p.title}
                          </h3>
                          <div className="flex items-baseline gap-2.5 mb-4">
                            <span className="text-3xl font-extrabold font-display text-gradient">
                              {p.stat}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                              {p.statLabel}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed max-w-md mb-5">
                            {p.body}
                          </p>
                          <ul className="space-y-2 mb-6">
                            {p.points.map((point) => (
                              <li
                                key={point}
                                className="flex items-center gap-2.5 text-sm text-white/85"
                              >
                                <span className="w-5 h-5 rounded-full bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-emerald-300 text-[13px]">
                                    check
                                  </span>
                                </span>
                                {point}
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-white/60 italic mb-5 max-w-md">
                            {p.note}
                          </p>
                          <div>
                            <Link
                              href={p.href}
                              onClick={(e) => e.stopPropagation()}
                              className="btn-shine inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 font-display text-sm"
                            >
                              {p.cta}
                              <span className="material-symbols-outlined text-[18px]">
                                arrow_forward
                              </span>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* --- mobile: stacked cards --- */}
            <div className="md:hidden grid gap-5 mt-12">
              {PATHWAYS.map((p, i) => (
                <motion.div
                  key={p.index}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
                  className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40"
                >
                  <div className="relative h-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/30 to-transparent"
                      aria-hidden
                    />
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[11px] font-bold font-display text-white/60 tracking-widest">
                          {p.index}
                        </span>
                        <h3 className="text-xl font-extrabold font-display leading-tight">
                          {p.title}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-extrabold font-display text-gradient">
                          {p.stat}
                        </p>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-white/70">
                          {p.statLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {p.body}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {p.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-emerald-600 text-[13px]">
                              check
                            </span>
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={p.href}
                      className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-300 font-display"
                    >
                      {p.cta}
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            HOW GVS HELPS — features + scroll-linked journey timeline
        ============================================================ */}
        <section id="how-we-help" className="py-20 lg:py-28 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">
              {/* ---------- left: sticky copy ---------- */}
              <div className="lg:sticky lg:top-28 self-start min-w-0">
                <SectionHeading
                  align="left"
                  eyebrow="How German Virtual School Helps"
                  title="Your Bridge to Germany Starts Here"
                  subtitle="German Virtual School prepares students for real opportunities in Germany through structured language training and exam preparation — from your first word of German to your visa interview."
                />

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={stagger}
                  className="space-y-5 mt-9"
                >
                  {GVS_FEATURES.map((item, i) => (
                    <motion.div key={i} variants={fadeUp} custom={i} className="flex gap-4 group">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
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
                    </motion.div>
                  ))}
                </motion.div>

                {/* CEFR pathway chips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="mt-9 p-5 rounded-2xl bg-linear-to-br from-primary/5 to-indigo-500/10 dark:from-primary/10 dark:to-indigo-500/15 border border-primary/10 dark:border-primary/20"
                >
                  <p className="text-xs font-bold text-primary font-display uppercase tracking-wider mb-3">
                    Complete CEFR pathway
                  </p>
                  <div className="flex items-center flex-wrap gap-2">
                    {CEFR_LEVELS.map((lvl, i) => (
                      <div key={lvl.level} className="flex items-center gap-2">
                        <div
                          className={`w-11 h-11 rounded-xl bg-linear-to-br ${lvl.color} flex flex-col items-center justify-center shadow-md hover:scale-110 hover:-rotate-3 transition-transform duration-300 cursor-default`}
                          title={`${lvl.level} — ${lvl.label}`}
                        >
                          <span className="text-white font-extrabold text-[11px] font-display leading-none">
                            {lvl.level}
                          </span>
                        </div>
                        {i < CEFR_LEVELS.length - 1 && (
                          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[14px]">
                            chevron_right
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                  className="mt-9"
                >
                  <Link
                    href="/courses"
                    className="btn-shine group inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300 font-display"
                  >
                    Explore Our Courses
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform duration-300">
                      arrow_forward
                    </span>
                  </Link>
                </motion.div>
              </div>

              {/* ---------- right: journey timeline ---------- */}
              <div ref={timelineRef} className="relative pl-2 lg:pl-4 min-w-0">
                {/* base track */}
                <div
                  className="absolute left-[35px] lg:left-[39px] top-6 bottom-6 w-1 rounded-full bg-slate-200 dark:bg-slate-800"
                  aria-hidden
                />
                {/* progress track */}
                <motion.div
                  style={reduceMotion ? undefined : { scaleY: timelineProgress }}
                  className="absolute left-[35px] lg:left-[39px] top-6 bottom-6 w-1 rounded-full bg-linear-to-b from-green-400 via-primary to-violet-500 origin-top"
                  aria-hidden
                />

                <div className="space-y-7">
                  {JOURNEY_STEPS.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 32 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.55, delay: i * 0.04, ease: EASE }}
                      className="relative flex gap-5"
                    >
                      {/* node */}
                      <div className="relative z-10 w-14 h-14 shrink-0 rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary/15 dark:border-primary/25 shadow-lg shadow-slate-200/60 dark:shadow-slate-950/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          {step.icon}
                        </span>
                      </div>
                      <SpotlightCard className="flex-1 min-w-0 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                        <p className="text-[10px] font-extrabold text-primary tracking-[0.2em] font-display mb-1">
                          STEP 0{i + 1}
                        </p>
                        <h4 className="font-bold text-slate-900 dark:text-white font-display text-[15px]">
                          {step.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5">
                          {step.desc}
                        </p>
                      </SpotlightCard>
                    </motion.div>
                  ))}
                </div>

                {/* arrival badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="relative mt-8 ml-2 inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-linear-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/30"
                >
                  <span className="text-xl" role="img" aria-label="Germany flag">
                    🇩🇪
                  </span>
                  <div>
                    <p className="text-sm font-extrabold font-display leading-tight">
                      Willkommen in Deutschland!
                    </p>
                    <p className="text-[11px] text-white/75">
                      Welcome to Germany — your new chapter begins
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            CURRICULUM — interactive CEFR level tracker
        ============================================================ */}
        <section
          id="curriculum"
          className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/40 scroll-mt-20 relative overflow-hidden"
        >
          <div
            className="absolute -bottom-40 right-0 w-[500px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative">
            <SectionHeading
              eyebrow="CEFR Aligned"
              title="German Courses A1 to C2"
              subtitle="Structured courses covering the complete Common European Framework of Reference for Languages — from your first words to near-native mastery. Select a level to explore it."
            />

            {/* level track */}
            <div className="relative max-w-4xl mx-auto mt-14 mb-9">
              {/* connector line (desktop) */}
              <div
                className="hidden md:block absolute left-8 right-8 top-7 -translate-y-1/2 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
                aria-hidden
              >
                <motion.div
                  animate={{
                    width: `${(activeLevel / (LEVELS.length - 1)) * 100}%`,
                  }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="h-full bg-linear-to-r from-green-400 via-primary to-fuchsia-500"
                />
              </div>

              <div className="relative grid grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-7">
                {LEVELS.map((lvl, i) => {
                  const isSelected = activeLevel === i;
                  return (
                    <button
                      key={lvl.level}
                      onClick={() => setActiveLevel(i)}
                      onMouseEnter={() => setActiveLevel(i)}
                      aria-pressed={isSelected}
                      className="group flex flex-col items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl py-1 cursor-pointer"
                    >
                      <motion.div
                        animate={{ scale: isSelected ? 1.12 : 1 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className={`w-14 h-14 rounded-2xl bg-linear-to-br ${lvl.gradient} flex items-center justify-center shadow-lg transition-shadow duration-300 ${
                          isSelected
                            ? "ring-4 ring-primary/25 shadow-primary/40"
                            : "opacity-75 group-hover:opacity-100 shadow-slate-300/50 dark:shadow-slate-950/50"
                        }`}
                      >
                        <span className="text-white font-extrabold font-display text-lg">
                          {lvl.level}
                        </span>
                      </motion.div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider font-display transition-colors duration-300 ${
                          isSelected
                            ? "text-primary"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        }`}
                      >
                        {lvl.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* detail panel */}
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLevel}
                  initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <SpotlightCard className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 lg:p-9 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/40">
                    <div className="grid md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] gap-7 lg:gap-10 items-center">
                      {/* level badge */}
                      <div
                        className={`w-24 h-24 rounded-3xl bg-linear-to-br ${LEVELS[activeLevel].gradient} flex items-center justify-center shadow-xl shrink-0 mx-auto md:mx-0`}
                      >
                        <span className="text-white text-3xl font-extrabold font-display">
                          {LEVELS[activeLevel].level}
                        </span>
                      </div>

                      {/* details */}
                      <div className="text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2.5">
                          <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                            {LEVELS[activeLevel].title}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-[14px]">
                              schedule
                            </span>
                            120 contact hours
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                          {LEVELS[activeLevel].desc}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          {LEVELS[activeLevel].uses.map((use) => (
                            <span
                              key={use}
                              className="px-3 py-1.5 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-xs font-semibold border border-primary/10 dark:border-primary/20"
                            >
                              {use}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* actions */}
                      <div className="flex md:flex-col lg:flex-col gap-3 shrink-0 justify-center">
                        <Link
                          href="/courses"
                          className="btn-shine inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 font-display whitespace-nowrap"
                        >
                          Explore {LEVELS[activeLevel].level} Courses
                          <span className="material-symbols-outlined text-[16px]">
                            arrow_forward
                          </span>
                        </Link>
                        <Link
                          href="/courses"
                          className="inline-flex items-center justify-center px-6 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/40 transition-all duration-300 font-display whitespace-nowrap"
                        >
                          All Courses
                        </Link>
                      </div>
                    </div>

                    {/* progress footer */}
                    <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-400 font-medium">
                        Level {activeLevel + 1} of {LEVELS.length} · Complete
                        CEFR pathway
                      </p>
                      <div className="flex gap-1.5" aria-hidden>
                        {LEVELS.map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-400 ${
                              i <= activeLevel
                                ? "w-6 bg-linear-to-r from-primary to-indigo-500"
                                : "w-3 bg-slate-200 dark:bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: EASE }}
              className="text-center mt-10"
            >
              <Link
                href="/courses"
                className="group inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary/20 text-primary font-semibold rounded-2xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 font-display"
              >
                View All Courses &amp; Pricing
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-300">
                  arrow_forward
                </span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ============================================================
            SUCCESS STORIES — marquee carousel
        ============================================================ */}
        {(!isLoadingTestimonials && testimonials.length > 0) ||
        isLoadingTestimonials ? (
          <section id="success-stories" className="py-20 lg:py-28 scroll-mt-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <SectionHeading
                eyebrow="Real Results"
                title="Student Success Stories"
                subtitle="Students who passed German exams, moved to Germany, received scholarships, and secured Ausbildung placements."
              />
            </div>

            {isLoadingTestimonials ? (
              <div className="text-center py-20 text-slate-500">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm font-medium animate-pulse">
                    Loading stories...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 mt-14">
                {(testimonials.length > 3
                  ? [
                      testimonials.slice(0, Math.ceil(testimonials.length / 2)),
                      testimonials.slice(Math.ceil(testimonials.length / 2)),
                    ]
                  : [testimonials]
                )
                  .filter((row) => row.length > 0)
                  .map((row, r) => (
                    <div
                      key={r}
                      className="marquee-paused mask-fade-x overflow-hidden"
                    >
                      <div
                        className={`flex w-max ${
                          r % 2 === 0
                            ? "animate-marquee-left"
                            : "animate-marquee-right"
                        }`}
                        style={
                          {
                            "--marquee-duration": `${42 + r * 12}s`,
                          } as React.CSSProperties
                        }
                      >
                        {[0, 1].map((set) => (
                          <div
                            key={set}
                            className="flex gap-6 pr-6 shrink-0"
                            aria-hidden={set === 1}
                          >
                            {row.map((t, i) => (
                              <TestimonialCard key={`${set}-${t.id ?? i}`} t={t} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!isLoadingTestimonials && testimonials.length > 0 && (
              <div className="text-center mt-10 px-4">
                <Link
                  href="/success-stories"
                  className="group inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3.5 transition-all duration-300 font-display"
                >
                  See all success stories
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-300">
                    arrow_forward
                  </span>
                </Link>
              </div>
            )}
          </section>
        ) : null}

        {/* ============================================================
            PARTNER PROGRAM — dark premium section
        ============================================================ */}
        <section className="relative py-20 lg:py-28 bg-slate-950 dark:bg-black text-white overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-20" aria-hidden />
          <div
            className="absolute -top-32 right-0 w-[520px] h-[420px] bg-primary/15 rounded-full blur-[140px]"
            aria-hidden
          />
          <div
            className="absolute -bottom-44 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"
            aria-hidden
          />

          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
              {/* left copy */}
              <div>
                <SectionHeading
                  align="left"
                  dark
                  eyebrow="Become a Partner / Marketer"
                  title="Earn While Sharing Excellence"
                  subtitle="Become a Marketing Partner and earn commissions for every student you refer. Turn your network into a revenue stream."
                />

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={stagger}
                  className="space-y-3.5 mb-9 mt-2"
                >
                  {PARTNER_PERKS.map((perk, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      custom={i}
                      className="flex items-center gap-3.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-400 text-[16px]">
                          check
                        </span>
                      </div>
                      <span className="text-slate-300 text-sm">{perk}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="btn-shine px-8 py-4 bg-white text-slate-900 font-semibold rounded-2xl hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 font-display"
                  >
                    Request to Join
                  </button>
                  <Link
                    href="/partners"
                    className="px-8 py-4 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/5 hover:border-white/40 transition-all duration-300 font-display"
                  >
                    Learn More
                  </Link>
                  <Link
                    href="/marketer/login"
                    className="px-6 py-4 text-slate-400 font-medium rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-300 text-sm font-display"
                  >
                    Marketer Login
                  </Link>
                </motion.div>
              </div>

              {/* right: dashboard mockup with animated glow border */}
              <motion.div
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, ease: EASE }}
                className="relative"
              >
                {/* floating commission notification */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
                  className="absolute -top-6 -right-3 sm:-right-6 z-20 animate-float"
                >
                  <div className="glass rounded-2xl px-4 py-3 shadow-2xl shadow-emerald-500/20 border border-white/20 bg-slate-900/70 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-400 text-lg">
                        add_circle
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white font-display">
                        +$15 commission
                      </p>
                      <p className="text-[10px] text-slate-400">
                        New enrollment referred
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* glow border card */}
                <div className="relative rounded-3xl p-px overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 w-[640px] h-[640px] -ml-[320px] -mt-[320px] animate-spin-slow"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0%, rgba(19,91,236,0.85) 12%, transparent 32%, transparent 52%, rgba(52,211,153,0.6) 64%, transparent 88%)",
                    }}
                  />
                  <div className="relative rounded-[calc(1.5rem-1px)] bg-slate-900 border border-white/5 p-6 lg:p-8">
                    {/* dashboard header */}
                    <div className="flex items-center justify-between mb-7 pb-6 border-b border-white/10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-2xl">
                            payments
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold font-display">
                            Partner Dashboard
                          </h3>
                          <p className="text-xs text-slate-400">
                            Track referrals &amp; commissions
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    </div>

                    {/* stat tiles */}
                    <div className="grid grid-cols-2 gap-4 mb-7">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] text-slate-400 font-medium">
                            Referred Students
                          </p>
                          <span className="material-symbols-outlined text-emerald-400 text-lg">
                            trending_up
                          </span>
                        </div>
                        <p className="text-2xl font-extrabold font-display tabular-nums">
                          124
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] text-slate-400 font-medium">
                            Total Earned
                          </p>
                          <span className="material-symbols-outlined text-emerald-400 text-lg">
                            account_balance_wallet
                          </span>
                        </div>
                        <p className="text-2xl font-extrabold font-display tabular-nums">
                          $248,000
                        </p>
                      </div>
                    </div>

                    {/* animated bar chart */}
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <p className="text-xs font-semibold text-slate-400">
                          Monthly commissions
                        </p>
                        <p className="text-xs font-bold text-emerald-400">
                          +32% this year
                        </p>
                      </div>
                      <div className="flex items-end gap-1.5 h-28">
                        {COMMISSION_BARS.map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-md bg-linear-to-t from-primary/30 to-primary hover:to-indigo-400 transition-colors animate-bar-grow"
                            style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2.5 text-[10px] text-slate-500">
                        <span>Jan</span>
                        <span>Dec</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================================
            JOIN MODAL
        ============================================================ */}
        <AnimatePresence>
          {showJoinModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowJoinModal(false)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="Partner with German Virtual School"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 12 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto thin-scrollbar"
              >
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close dialog"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
                <div className="w-12 h-12 bg-linear-to-br from-primary to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-6 rounded-2xl border border-green-200 dark:border-green-800 text-center"
                  >
                    <span className="material-symbols-outlined text-4xl mb-2 text-green-500">
                      check_circle
                    </span>
                    <p className="font-bold font-display">Request Sent!</p>
                    <p className="text-sm mt-1">
                      We will be in touch shortly via email.
                    </p>
                    <button
                      onClick={() => setShowJoinModal(false)}
                      className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 transition-colors font-display"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleJoinSubmit} className="space-y-4">
                    {joinFields.map(({ label, type, key, ph, required }) => (
                      <div key={key}>
                        <label
                          htmlFor={`join-${key}`}
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          {label} {required && "*"}
                        </label>
                        <input
                          id={`join-${key}`}
                          type={type}
                          required={required}
                          value={joinForm[key]}
                          onChange={(e) =>
                            setJoinForm({ ...joinForm, [key]: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white transition-shadow"
                          placeholder={ph}
                        />
                      </div>
                    ))}
                    <div>
                      <label
                        htmlFor="join-message"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        How do you plan to refer students?
                      </label>
                      <textarea
                        id="join-message"
                        rows={3}
                        value={joinForm.message}
                        onChange={(e) =>
                          setJoinForm({ ...joinForm, message: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white resize-none transition-shadow"
                        placeholder="e.g. I run a student community on social media..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingJoin}
                      className="btn-shine w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center font-display"
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================
            PRICING (API-driven)
        ============================================================ */}
        {stats.fees && (stats.fees.courses.length > 0 || stats.fees.materialFee) && (
          <section
            id="pricing"
            className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/40 scroll-mt-20"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <SectionHeading
                eyebrow="Transparent Pricing"
                title="Fees &amp; Course Pricing"
                subtitle="A clear breakdown of all costs — no hidden charges. Flexible installment plans available."
              />

              {/* material fee banner */}
              {stats.fees.materialFee && (
                <div className="max-w-md mx-auto mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <SpotlightCard
                      glow="rgba(245, 158, 11, 0.14)"
                      className="relative bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-3xl p-6 border border-amber-100 dark:border-amber-800/30 overflow-hidden group hover:shadow-xl hover:shadow-amber-500/10 transition-shadow duration-300"
                    >
                      <div
                        className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"
                        aria-hidden
                      />
                      <div className="relative">
                        <div className="flex items-center gap-3.5 mb-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                            <span className="material-symbols-outlined text-white text-xl">
                              menu_book
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white font-display">
                              Learning Materials &amp; Textbooks
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Advance one-time fee
                            </p>
                          </div>
                        </div>
                        <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display tabular-nums">
                          ${stats.fees.materialFee.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          Pay for course materials, textbooks, and digital
                          resources ahead of time
                          {stats.fees.materialFeeDeadline
                            ? `. Due by ${new Date(
                                stats.fees.materialFeeDeadline,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}`
                            : ""}
                          .
                        </p>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                </div>
              )}

              {/* course pricing cards */}
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
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.55, delay: idx * 0.07, ease: EASE }}
                      >
                        <SpotlightCard className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 group">
                          <div
                            className={`h-1.5 bg-linear-to-r ${levelColors[course.level] || "from-slate-300 to-slate-400"}`}
                          />
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`text-xs font-bold px-3.5 py-1.5 rounded-full bg-linear-to-r ${levelColors[course.level] || "from-slate-300 to-slate-400"} text-white font-display shadow-md group-hover:scale-105 transition-transform`}
                              >
                                {course.level}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                                <span className="material-symbols-outlined text-[15px]">
                                  schedule
                                </span>
                                {course.durationWeeks} weeks
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-3 font-display">
                              {course.title}
                            </h3>
                            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 font-display tabular-nums">
                              ${course.price.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium mb-4">
                              Full course tuition
                            </p>
                            {course.feePlans.length > 0 && (
                              <div className="mt-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[11px] font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
                                  Payment Options
                                </p>
                                <div className="space-y-1">
                                  {course.feePlans.map((fp, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 py-1"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[15px] text-primary">
                                          check_circle
                                        </span>
                                        {fp.billingCycle
                                          .replace(/_/g, " ")
                                          .toLowerCase()
                                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                                        {fp.installments > 1 &&
                                          ` (${fp.installments}x)`}
                                      </span>
                                      <span className="font-semibold tabular-nums">
                                        ${fp.amount.toLocaleString()}
                                        {fp.installments > 1 ? "/inst." : ""}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                              <Link
                                href={`/courses/${course.id}`}
                                className="group/link inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-300 font-display"
                              >
                                View this course
                                <span className="material-symbols-outlined text-[16px] group-hover/link:translate-x-1 transition-transform duration-300">
                                  arrow_forward
                                </span>
                              </Link>
                            </div>
                          </div>
                        </SpotlightCard>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* installments info */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE }}
                className="mt-12 max-w-3xl mx-auto bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 rounded-3xl p-6 border border-primary/10 text-center"
              >
                <div className="flex items-center justify-center gap-2.5 mb-2">
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
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  {[
                    "No interest charged",
                    `Min. $${minInstallment.toLocaleString()} per installment`,
                    "Per semester billing",
                  ].map((t, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-green-500">
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

        {/* ============================================================
            FINAL CTA
        ============================================================ */}
        <section
          id="enroll"
          className="relative py-24 lg:py-32 overflow-hidden scroll-mt-20"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/cta_image.png')" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-linear-to-br from-slate-950/85 via-primary/75 to-indigo-950/80"
            aria-hidden
          />
          <div className="absolute inset-0 hero-grid opacity-15" aria-hidden />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-white/10 rounded-full blur-[120px]"
            aria-hidden
          />

          {/* floating German words */}
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            {CTA_FLOAT_WORDS.map((f, i) => (
              <span
                key={i}
                className="absolute text-white/10 font-display font-extrabold text-xl lg:text-2xl animate-drift select-none"
                style={
                  {
                    left: f.x,
                    top: f.y,
                    animationDelay: f.d,
                    "--drift-x": "14px",
                    "--drift-y": "-18px",
                    "--drift-rotate": "2deg",
                  } as React.CSSProperties
                }
              >
                {f.w}
              </span>
            ))}
          </div>

          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center relative z-10 text-white">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.span
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2.5 mb-7 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold font-display"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Start Learning German
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-3xl lg:text-[3.25rem] font-extrabold mb-5 font-display leading-[1.12] tracking-tight"
              >
                Begin Your German Journey Today —{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-white to-amber-200">
                  Los geht&apos;s!
                </span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg mb-3 text-white/80 leading-relaxed max-w-2xl mx-auto"
              >
                Explore our German courses and start building the language
                skills needed for your future in Germany — structured courses,
                live classes, and exam preparation designed for international
                students and professionals.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-10 mt-6 text-sm text-white/70"
              >
                {[
                  { icon: "verified", text: "CEFR-Certified curriculum" },
                  { icon: "groups", text: "Live online classes" },
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
                custom={4}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/courses"
                  className="btn-shine group inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-primary text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-white/25 hover:-translate-y-0.5 transition-all duration-300 font-display"
                >
                  Explore Courses
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform duration-300">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-10 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-display"
                >
                  Contact Us
                </Link>
              </motion.div>
              <motion.p
                variants={fadeUp}
                custom={5}
                className="mt-10 text-sm text-white/60"
              >
                Questions? Contact us at{" "}
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@germanvirtualschool.com"}`}
                  className="underline underline-offset-2 hover:text-white transition-colors"
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
