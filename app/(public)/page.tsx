"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePublicStats } from "@/hooks/usePublicStats";

export default function Home() {
  useEffect(() => {
    const handleScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.hash && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname) {
        e.preventDefault();
        const element = document.querySelector(anchor.hash);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          // Update URL hash without jumping
          window.history.pushState(null, "", anchor.hash);
        }
      }
    };

    document.addEventListener("click", handleScroll);
    return () => document.removeEventListener("click", handleScroll);
  }, []);

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  
  const { stats, isLoading: isLoadingStats } = usePublicStats();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await axios.get("/api/testimonials?public=true");
        if (data.success) {
          setTestimonials(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      } finally {
        setIsLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-serif text-slate-900 dark:text-slate-100">
      {/* Classic Navigation */}
      {/* Classic Navigation - REMOVED (handled by layout) */}

      <main>
        {/* Hero Section - Classic & Elegant */}
        <section className="relative py-12 md:py-16 lg:py-32 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-block mb-4 md:mb-6 px-3 md:px-4 py-1 md:py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-semibold uppercase tracking-widest font-sans">
                  Est. Since 2020
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 md:mb-6 text-slate-900 dark:text-white">
                  Master the German Language with Academic Excellence
                </h1>
                <p className="text-sm md:text-base lg:text-lg xl:text-xl text-slate-600 dark:text-slate-300 mb-6 md:mb-8 leading-relaxed">
                  Join our distinguished virtual academy offering structured
                  German language education from beginner to advanced levels.
                  Our curriculum follows the Common European Framework of
                  Reference (CEFR) standards, ensuring internationally
                  recognized proficiency certification.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Link
                    href="/register"
                    className="px-6 md:px-8 py-3 md:py-4 bg-primary text-white text-sm md:text-base font-semibold hover:bg-blue-700 transition-colors text-center font-sans"
                  >
                    Begin Your Journey
                  </Link>
                  <Link
                    href="#curriculum"
                    className="px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm md:text-base font-semibold hover:border-primary transition-colors text-center font-sans"
                  >
                    Explore Curriculum
                  </Link>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-sm relative overflow-hidden shadow-2xl">
                  <img
                    src="/hero-image.png"
                    alt="Professional German language learning environment with modern technology and academic materials"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Institutional Stats */}
        <section className="py-8 md:py-12 lg:py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 md:mb-2 font-sans">
                  {isLoadingStats ? <span className="text-lg">Loading...</span> : stats.studentsCount.toLocaleString()}
                </p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans">
                  Enrolled Students
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 md:mb-2 font-sans">
                  {isLoadingStats ? <span className="text-lg">Loading...</span> : stats.instructorsCount.toLocaleString()}
                </p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans">
                  Qualified Instructors
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 md:mb-2 font-sans">
                  {isLoadingStats ? <span className="text-lg">Loading...</span> : `${stats.successRate}%`}
                </p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans">
                  Success Rate
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 md:mb-2 font-sans">
                  {isLoadingStats ? <span className="text-lg">Loading...</span> : stats.levelsCount}
                </p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans">
                  CEFR Levels
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-800"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                A Tradition of Academic Excellence
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Deutsche Virtuelle Schule represents a commitment to delivering
                world-class German language education through innovative virtual
                learning methodologies. Our institution combines classical
                pedagogical approaches with modern technology to ensure
                comprehensive language acquisition.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-700 p-8 border border-slate-200 dark:border-slate-600">
                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    verified
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-sans">
                  Accredited Programs
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our curriculum adheres to CEFR standards and is recognized by
                  international language assessment bodies, ensuring your
                  certification is valued globally.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-700 p-8 border border-slate-200 dark:border-slate-600">
                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    psychology
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-sans">
                  Research-Based Methods
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our teaching methodology is grounded in linguistic research
                  and cognitive science, optimizing retention and practical
                  language application.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-700 p-8 border border-slate-200 dark:border-slate-600">
                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    workspace_premium
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-sans">
                  Comprehensive Support
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  From enrollment through certification, students receive
                  dedicated academic advising, progress monitoring, and
                  personalized feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features - The Advantage */}
        <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                A Premium Digital Campus
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Join a platform designed for success. Our state-of-the-art virtual environment provides everything you need to master German, all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Feature 1: Live Classes */}
              <div className="flex gap-4 items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
                <div className="w-12 h-12 shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">video_camera_front</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                    Immersive Live Sessions
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Connect directly with instructors in secure, real-time video classrooms. Experience interactive lessons with automated attendance and participation tracking.
                  </p>
                </div>
              </div>

              {/* Feature 2: Resources */}
              <div className="flex gap-4 items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
                <div className="w-12 h-12 shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">library_books</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                    Digital Library Access
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Unlimited access to a wealth of study materials including PDFs, video recordings of past classes, and interactive handouts available 24/7.
                  </p>
                </div>
              </div>

              {/* Feature 3: Progress Tracking */}
              <div className="flex gap-4 items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
                <div className="w-12 h-12 shrink-0 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">monitoring</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                    Real-Time Performance
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Track your growth with detailed analytics. Monitor your attendance, assignment grades, and proficiency levels through your personal dashboard.
                  </p>
                </div>
              </div>

              {/* Feature 4: Community */}
              <div className="flex gap-4 items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
                <div className="w-12 h-12 shrink-0 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">forum</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                    Vibrant Community
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Join the conversation. Engage with peers and teachers in dedicated course forums to discuss topics, share insights, and practice language skills.
                  </p>
                </div>
              </div>

              {/* Feature 5: Assessments */}
              <div className="flex gap-4 items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
                <div className="w-12 h-12 shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                    Structured Assessments
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Test your knowledge with regular assignments and quizzes. Receive comprehensive feedback and grading from qualified instructors to guide your improvement.
                  </p>
                </div>
              </div>

              {/* Feature 6: Schedule */}
              <div className="flex gap-4 items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
                <div className="w-12 h-12 shrink-0 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">calendar_month</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                    Smart Scheduling
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Never miss a class. Your integrated academic calendar automatically updates with live session times, assignment deadlines, and exam schedules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum Section */}
        <section
          id="curriculum"
          className="py-20 lg:py-28 bg-white dark:bg-slate-900"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Structured Learning Path
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Our comprehensive curriculum guides you from elementary to
                proficient mastery, following the internationally recognized
                Common European Framework of Reference for Languages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  level: "A1",
                  title: "Elementary I",
                  desc: "Foundation in basic phrases, introductions, and everyday expressions",
                },
                {
                  level: "A2",
                  title: "Elementary II",
                  desc: "Simple conversations about familiar topics and routine tasks",
                },
                {
                  level: "B1",
                  title: "Intermediate I",
                  desc: "Main points on familiar matters, travel situations, and personal interests",
                },
                {
                  level: "B2",
                  title: "Intermediate II",
                  desc: "Complex texts, spontaneous interaction, and detailed expression",
                },
                {
                  level: "C1",
                  title: "Advanced I",
                  desc: "Effective flexible use for social, academic, and professional purposes",
                },
                {
                  level: "C2",
                  title: "Advanced II",
                  desc: "Near-native proficiency with nuanced understanding and expression",
                },
              ].map((course, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800 p-6 border-l-4 border-primary hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary text-white flex items-center justify-center font-bold text-lg font-sans">
                      {course.level}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                      {course.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {course.desc}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Duration: 120 contact hours
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Faculty Section */}
        <section
          id="faculty"
          className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-800"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Distinguished Faculty
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Learn from qualified instructors with advanced degrees in
                linguistics, education, and German studies from prestigious
                European universities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-700 p-6 text-center border border-slate-200 dark:border-slate-600">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-slate-400">
                    person
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                  Qualified Instructors
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  100% of our instructors are qualified experts
                </p>
                <div className="text-xs text-primary font-semibold font-sans uppercase tracking-wider">
                  Authentic Language
                </div>
              </div>

              <div className="bg-white dark:bg-slate-700 p-6 text-center border border-slate-200 dark:border-slate-600">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-slate-400">
                    school
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                  Advanced Credentials
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Master's or PhD in Linguistics or Education required
                </p>
                <div className="text-xs text-primary font-semibold font-sans uppercase tracking-wider">
                  Academic Excellence
                </div>
              </div>

              <div className="bg-white dark:bg-slate-700 p-6 text-center border border-slate-200 dark:border-slate-600">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-slate-400">
                    history_edu
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                  Teaching Experience
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Average 10+ years of language instruction experience
                </p>
                <div className="text-xs text-primary font-semibold font-sans uppercase tracking-wider">
                  Proven Expertise
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {(!isLoadingTestimonials && testimonials.length > 0) || isLoadingTestimonials ? (
          <section
            id="testimonials"
            className="py-20 lg:py-32 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16 md:mb-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                    Student Success Stories
                  </h2>
                  <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {isLoadingTestimonials ? (
                  <div className="col-span-3 text-center py-24 text-slate-500">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-lg font-medium animate-pulse">
                        Fetching our latest success stories...
                      </p>
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
                      className="group bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative"
                    >
                      <div className="absolute top-6 right-8 text-6xl text-primary/10 font-serif leading-none">
                        &rdquo;
                      </div>
                      
                      <div className="mb-8">
                        <div className="flex gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`material-symbols-outlined text-xl ${
                                i < testimonial.rating
                                  ? "text-yellow-400"
                                  : "text-slate-300 dark:text-slate-600"
                              }`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 italic text-lg leading-relaxed relative z-10">
                          {testimonial.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm relative shrink-0">
                          {testimonial.student?.avatarUrl ? (
                            <img
                              src={testimonial.student.avatarUrl}
                              alt="Student"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl uppercase">
                              {testimonial.student?.firstName?.[0]}
                              {testimonial.student?.lastName?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white font-sans text-base truncate">
                            {testimonial.student?.firstName}{" "}
                            {testimonial.student?.lastName}
                          </p>
                          <p className="text-sm text-primary font-medium truncate">
                            {testimonial.student?.studentProfile?.address ||
                              "Verified Graduate"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* Call to Action */}
        <section className="py-20 lg:py-28 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Begin Your German Language Journey
            </h2>
            <p className="text-xl mb-10 text-blue-100 leading-relaxed">
              Join our distinguished community of learners and invest in your
              linguistic future. Enrollment for the upcoming semester is now
              open.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-10 py-4 bg-white text-primary text-lg font-semibold hover:bg-blue-50 transition-colors font-sans"
              >
                Enroll Now
              </Link>
              <Link
                href="/courses"
                className="px-10 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold hover:bg-white hover:text-primary transition-colors font-sans"
              >
                Browse Courses
              </Link>
            </div>
            <p className="mt-8 text-sm text-blue-100">
              Questions? Contact our admissions office at{" "}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com'}`}
                className="underline hover:text-white"
              >
               {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com'}
              </a>
            </p>
          </div>
        </section>

        {/* Footer */}
      {/* Footer - REMOVED (handled by layout) */}
      </main>

      {/* Material Symbols Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
