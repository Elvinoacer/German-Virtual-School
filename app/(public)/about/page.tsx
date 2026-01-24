"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePublicStats } from "@/hooks/usePublicStats";

export default function AboutPage() {
  const { stats, isLoading } = usePublicStats();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-serif text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Header/Nav */}
      {/* Header/Nav - REMOVED (handled by layout) */}

      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-32 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest font-sans mb-6">
                Our Mission
              </span>
              <h1 className="text-3xl lg:text-6xl font-bold leading-tight text-slate-900 dark:text-white mb-8 max-w-4xl mx-auto">
                Bridging Cultures Through Academic Excellence
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed italic">
                "Germany is not just a destination; it's a future. We provide the linguistic foundation to build it."
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-8">
                  The GVS Tradition
                </h2>
                <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  <p>
                    Founded in 2020, German Virtual School was established with a singular vision: to democratize access to high-quality German language education globally. We recognized that traditional barriers—geography, rigid schedules, and inconsistent teaching quality—often stood in the way of ambitious learners.
                  </p>
                  <p>
                    Today, we stand as a premier digital institution, combining the rigor of classical German pedagogy with the flexibility of modern virtual classrooms. Our platform isn't just a place to learn; it's a community of over 10,000 students achieving their dreams in higher education and professional careers.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUcAWLnWzv0ACPJJoYUFVj65RVbewO_g_fbawHYz3p2rdg0u931RHluwggn6fpvK3IQMqXuSYmIMgNxJFZ6_iA1Qkb3yhcn7oc1yt3omC4Hibf4oBQFj8lNcv2j7oW5Hd8w5LLq4Qg_Ngd8Czj2pyGL66VJpOUrjSjEDv2xrsrG0XhBN94h0f6GEgxwBCDqW3fzDb3aaTZ3_VWQlOu3tHBwd5aZUXd7yTkV2manY4LHf_8i7ZmllQ6ut-FHkT6AkdHgDceHCGjPlg" 
                    alt="Modern student learning in a digital environment"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Micro-stat overlay */}
                <div className="absolute -bottom-6 -left-6 bg-primary p-8 text-white shadow-xl hidden md:block">
                  <p className="text-4xl font-bold mb-1 font-sans">100%</p>
                  <p className="text-sm uppercase tracking-widest font-sans opacity-80">Qualified Instructors</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section className="py-24 lg:py-32 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Choose Our Academy?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">We don't just teach German; we engineer fluency through research-based institutional practices.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="size-12 bg-white/10 rounded flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white text-3xl">verified</span>
                </div>
                <h3 className="text-xl font-bold font-sans">CEFR Standards</h3>
                <p className="text-slate-400 leading-relaxed">Our curriculum strictly follows the Common European Framework of Reference for Languages, ensuring your progress is measurable and recognized worldwide.</p>
              </div>
              
              <div className="space-y-4">
                <div className="size-12 bg-white/10 rounded flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white text-3xl">groups</span>
                </div>
                <h3 className="text-xl font-bold font-sans">Small Class Sizes</h3>
                <p className="text-slate-400 leading-relaxed">We believe in active participation. Our sessions are designed for engagement, providing you with ample speaking time and personalized feedback from instructors.</p>
              </div>

              <div className="space-y-4">
                <div className="size-12 bg-white/10 rounded flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white text-3xl">auto_graph</span>
                </div>
                <h3 className="text-xl font-bold font-sans">Proven Outcomes</h3>
                <p className="text-slate-400 leading-relaxed">
                  {isLoading ? '...' : `${stats.successRate}%`} of our students pass their proficiency exams on the first attempt, with many securing admissions to elite German universities and global firms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Founder Placeholder */}
        <section className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-800">
           <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
             <div className="size-32 rounded-full overflow-hidden mx-auto mb-8 bg-slate-300 dark:bg-slate-700">
                <img src="https://lh3.googleusercontent.com/a/ACg8ocL_wR5o1fG9eW_n4fB_QGz_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K_n_f_mGj_K" alt="Founder" className="w-full h-full object-cover grayscale opacity-50" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dr. Harvey Gitonga</h3>
             <p className="text-primary font-sans font-semibold uppercase tracking-widest text-sm mb-6">Head of Academic Affairs</p>
             <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              "Our goal is to create a seamless bridge between your current reality and your future in a German-speaking environment. We invite you to join our tradition of excellence."
             </p>
           </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 lg:py-32 bg-primary">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">Start Your Academic Journey Today</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center font-sans">
              <Link href="/register" className="px-10 py-4 bg-white text-primary font-bold hover:bg-slate-100 transition-colors shadow-xl">
                Enroll in GVS
              </Link>
              <Link href="/courses" className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold hover:bg-white/10 transition-colors">
                Explore Programs
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      {/* Footer - REMOVED (handled by layout) */}
      
      {/* Material Symbols */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
