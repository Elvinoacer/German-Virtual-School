"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
  
  // Marketer Join Modal State
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
      if (response.data.success) {
        setJoinSubmitted(true);
      }
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
                    href="/reserve-seat"
                    className="px-6 md:px-8 py-3 md:py-4 bg-primary text-white text-sm md:text-base font-semibold hover:bg-blue-700 transition-colors text-center font-sans"
                  >
                    Reserve Your Seat
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
            <div className={`grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 ${
              !isLoadingStats && (stats?.successRate ?? 0) >= 60 ? 'md:grid-cols-4' : 'md:grid-cols-3'
            }`}>
              <div className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 md:mb-2 font-sans">
                  {isLoadingStats ? <span className="text-lg">Loading...</span> : stats?.studentsCount?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans">
                  Enrolled Students
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 md:mb-2 font-sans">
                  {isLoadingStats ? <span className="text-lg">Loading...</span> : stats?.instructorsCount?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans">
                  Qualified Instructors
                </p>
              </div>
              {!isLoadingStats && (stats?.successRate ?? 0) >= 60 && (
                <div className="text-center">
                  <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 md:mb-2 font-sans">
                    {`${stats?.successRate}%`}
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans">
                    Success Rate
                  </p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 md:mb-2 font-sans">
                  {isLoadingStats ? <span className="text-lg">Loading...</span> : stats?.levelsCount ?? 6}
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
                {
                  level: "REFRESHER",
                  title: "Refresher Course",
                  desc: "Brush up on your skills and regain confidence in German communication",
                },
                {
                  level: "KINDERKURSE",
                  title: "Kinderkurse",
                  desc: "Fun and interactive German lessons designed specifically for children",
                },

              ].map((course, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800 p-6 border-l-4 border-primary hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="min-w-[3rem] px-2 h-12 bg-primary text-white flex items-center justify-center font-bold font-sans shrink-0 rounded-sm">
                      <span className={course.level.length > 3 ? "text-[10px] sm:text-xs tracking-wider uppercase" : "text-lg"}>
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans leading-tight">
                      {course.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                    {course.desc}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Duration: 120 contact hours
                    </p>
                    <Link
                      href={`/reserve-seat?program=${course.level}`}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Reserve Your Seat →
                    </Link>
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

        {/* Marketer Promotional Section */}
        <section className="py-20 lg:py-28 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block mb-4 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold uppercase tracking-widest font-sans rounded-full">
                  Partner Program
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Earn While Sharing Excellence
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Become a registered Marketing Partner and earn substantial commissions for every student you refer to Deutsche Virtuelle Schule. Turn your network into a recurring revenue stream while helping others master the German language.
                </p>
                
                <div className="space-y-4 mb-8">
                  {[
                    "Earn KES 500 instantly on seat reservation",
                    "Earn an additional KES 1,500 on full tuition payment",
                    "Transparent dashboard & direct M-Pesa payouts",
                    "Receive a unique referral code instantly"
                  ].map((perk, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-green-500 mt-1 flex-shrink-0">check_circle</span>
                      <span className="text-slate-700 dark:text-slate-300">{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm md:text-base font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors rounded-xl font-sans text-center"
                  >
                    Request to Join as Partner
                  </button>
                  <Link
                    href="/marketer/login"
                    className="px-8 py-4 bg-transparent border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white text-sm md:text-base font-semibold hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors rounded-xl font-sans text-center"
                  >
                    Marketer Login
                  </Link>
                </div>
              </div>
              <div className="relative">
                {/* Visual placeholder or illustration for marketer area */}
                <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-600 p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-600 pb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">payments</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Partner Dashboard</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Track referrals & commissions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Referred Students</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">124</p>
                      </div>
                      <span className="material-symbols-outlined text-green-500">trending_up</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Earned</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">KES 248,000</p>
                      </div>
                      <span className="material-symbols-outlined text-green-500">account_balance_wallet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join as Marketer Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Partner with Us</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Submit your details below and our admissions team will contact you to set up your marketing account.
              </p>

              {joinSubmitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-xl border border-green-200 dark:border-green-800 text-center">
                  <span className="material-symbols-outlined text-4xl mb-2 text-green-500">check_circle</span>
                  <p className="font-semibold">Request Sent Successfully</p>
                  <p className="text-sm mt-1">We will be in touch shortly via email.</p>
                  <button 
                    onClick={() => setShowJoinModal(false)}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={joinForm.name}
                      onChange={(e) => setJoinForm({...joinForm, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={joinForm.email}
                      onChange={(e) => setJoinForm({...joinForm, email: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={joinForm.phone}
                      onChange={(e) => setJoinForm({...joinForm, phone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">How do you plan to refer students?</label>
                    <textarea 
                      rows={3}
                      value={joinForm.message}
                      onChange={(e) => setJoinForm({...joinForm, message: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white resize-none"
                      placeholder="e.g. I run a student community on social media..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmittingJoin}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
                  >
                    {isSubmittingJoin ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* Pricing & Fees Section */}
        {stats.fees && (stats.fees.courses.length > 0 || stats.fees.seatReservationFee || stats.fees.materialFee) && (
          <section id="pricing" className="py-20 lg:py-28 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-14"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-4">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  Transparent Pricing
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Fees &amp; Course Pricing
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                  All fees are structured per semester. Clear breakdown of all costs — no hidden charges. Flexible installment plans available to help you get started.
                </p>
              </motion.div>

              {/* System Fees (Seat Reservation + Material Fee) */}
              {(stats.fees.seatReservationFee || stats.fees.materialFee) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto"
                >
                  {stats.fees.seatReservationFee && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-xl">confirmation_number</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Seat Reservation</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">One-time, non-refundable</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        KES {stats.fees.seatReservationFee.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Deducted from your total tuition fee. Secures your spot{stats.fees.intakeLabel ? ` for the ${stats.fees.intakeLabel} intake` : ""}.
                      </p>
                    </div>
                  )}
                  {stats.fees.materialFee && (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-800/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-xl">menu_book</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Learning Materials</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">One-time fee</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        KES {stats.fees.materialFee.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Covers all course materials, textbooks, and digital resources{stats.fees.materialFeeDeadline ? `. Due by ${new Date(stats.fees.materialFeeDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Course Fee Cards */}
              {stats.fees.courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.fees.courses.map((course, idx) => {
                    const levelColors: Record<string, string> = {
                      A1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      A2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                      B1: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                      B2: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
                      C1: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                      C2: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    };
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${levelColors[course.level] || "bg-slate-100 text-slate-700"}`}>
                              {course.level}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {course.durationWeeks} weeks
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-3 leading-tight">
                            {course.title}
                          </h3>
                          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            KES {course.price.toLocaleString()}
                          </p>
                          {course.feePlans.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Payment Options</p>
                              {course.feePlans.map((fp, i) => (
                                <div key={i} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 py-1">
                                  <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                                    {fp.billingCycle.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                    {fp.installments > 1 && ` (${fp.installments}x)`}
                                  </span>
                                  <span className="font-semibold">KES {fp.amount.toLocaleString()}{fp.installments > 1 ? "/inst." : ""}</span>
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

              {/* Installment Info Banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-10 max-w-3xl mx-auto bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl p-6 border border-primary/15 dark:border-primary/25 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">credit_score</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Flexible Installment Plans</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tuition fees are payable in installments with a minimum of <strong className="text-primary">KES 9,000</strong> per installment.
                  Start your learning journey today and spread the cost across the semester at your own pace.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                    No interest charged
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                    Min. KES 9,000 per installment
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                    Per semester billing
                  </span>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="py-20 lg:py-28 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Secure Your Spot for The May Intake
            </h2>
            <p className="text-xl mb-6 text-blue-100 leading-relaxed">
              Reserve your seat today with a one-time fee of{" "}
              <span className="font-bold text-white">KSH 2,500</span>.
              This locks your place in our upcoming May intake and is
              deducted from your total tuition fee.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-blue-100">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Locks your seat
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Deducted from total fee
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Non-refundable
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reserve-seat"
                className="px-10 py-4 bg-white text-primary text-lg font-semibold hover:bg-blue-50 transition-colors font-sans"
              >
                Reserve Your Seat — KSH 2,500
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
