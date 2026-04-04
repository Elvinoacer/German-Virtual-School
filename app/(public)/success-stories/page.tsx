"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";

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

const milestones = [
  {
    icon: "workspace_premium",
    title: "Passed German Exams",
    desc: "Students who passed Goethe-Institut certified examinations",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: "flight_takeoff",
    title: "Moved to Germany",
    desc: "Graduates who successfully relocated to Germany",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: "school",
    title: "Received Scholarships",
    desc: "Students awarded DAAD and other prestigious scholarships",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: "engineering",
    title: "Secured Ausbildung",
    desc: "Graduates placed in vocational training programs",
    color: "from-amber-500 to-orange-600",
  },
];

export default function SuccessStoriesPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await axios.get("/api/testimonials?public=true");
        if (data.success) setTestimonials(data.data);
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/success_stories.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-br from-rose-950/80 via-pink-900/70 to-fuchsia-900/70" />
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-white/10 blur-[100px]" />

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
                emoji_events
              </span>
              Real Results
            </motion.span>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display"
            >
              Success Stories
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
            >
              Real students, real achievements. Discover how German Virtual
              School has helped students pass exams, win scholarships, and build
              careers in Germany.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Milestones */}
      <section className="relative -mt-8 z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${m.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}
                >
                  <span className="material-symbols-outlined text-white text-xl">
                    {m.icon}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 font-display">
                  {m.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {m.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4 font-display"
            >
              Testimonials
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-display"
            >
              What Our Students Say
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
            >
              Authentic feedback from students who have completed our programs
              and achieved their goals.
            </motion.p>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium animate-pulse">
                  Loading stories...
                </p>
              </div>
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative"
                >
                  <div className="absolute top-6 right-8 text-6xl text-primary/8 font-serif leading-none select-none">
                    &rdquo;
                  </div>
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, s) => (
                      <span
                        key={s}
                        className={`material-symbols-outlined text-lg ${
                          s < testimonial.rating
                            ? "text-amber-400"
                            : "text-slate-200 dark:text-slate-700"
                        }`}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">
                sentiment_satisfied
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">
                Stories Coming Soon
              </h3>
              <p className="text-slate-500">
                We&apos;re collecting stories from our graduates. Check back
                soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-linear-to-r from-rose-500 to-fuchsia-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">
            Write Your Own Success Story
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join hundreds of students who have transformed their futures through
            German language proficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reserve-seat"
              className="px-8 py-4 bg-white text-rose-600 font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display"
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
