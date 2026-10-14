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
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const articleData: Record<
  string,
  {
    title: string;
    category: string;
    date: string;
    readTime: string;
    gradient: string;
    heroImage: string;
    icon: string;
    intro: string;
    sections: { heading: string; content: string[] }[];
  }
> = {
  "how-kenyans-can-work-in-germany": {
    title: "How Kenyans Can Work in Germany",
    category: "Work",
    date: "March 15, 2026",
    readTime: "8 min read",
    gradient: "from-emerald-400 to-teal-500",
    heroImage: "/images/kenyans_work_germany.png",
    icon: "work",
    intro:
      "Germany actively recruits skilled workers from around the world, and Kenya has become a key source of talent, particularly in healthcare, IT, and engineering. This guide walks you through everything you need to know.",
    sections: [
      {
        heading: "Why Germany Needs Workers",
        content: [
          "Germany's population is aging rapidly, creating an unprecedented demand for skilled workers. The government has responded with the Skilled Immigration Act (Fachkräfteeinwanderungsgesetz), making it easier than ever for qualified international professionals to work in the country.",
          "Key sectors facing critical shortages include healthcare and nursing, information technology, engineering, hospitality and tourism, and skilled technical trades.",
        ],
      },
      {
        heading: "Step 1: Learn German",
        content: [
          "Most jobs in Germany require German language proficiency at the B1 or B2 level. While some IT positions may accept English-only candidates, knowing German dramatically improves your options and salary potential.",
          "German Virtual School offers structured courses from A1 to C2, specifically designed to prepare students for professional environments in Germany.",
        ],
      },
      {
        heading: "Step 2: Get Your Qualifications Recognized",
        content: [
          "Your Kenyan qualifications need to be recognized in Germany. This process varies by profession — regulated professions (like nursing) require formal recognition, while others may only need credential evaluation.",
          "The anabin database and the Recognition Act (Anerkennungsgesetz) govern this process.",
        ],
      },
      {
        heading: "Step 3: Apply for the Skilled Worker Visa",
        content: [
          "With recognized qualifications and a job offer (or the intent to seek employment), you can apply for a Skilled Worker Visa at the German Embassy in Nairobi.",
          "Requirements typically include recognized qualifications, proof of German language proficiency, a job offer or employment contract, health insurance, and financial proof.",
        ],
      },
    ],
  },
  "ausbildung-explained": {
    title: "Ausbildung Explained: Germany's Vocational Training System",
    category: "Training",
    date: "March 10, 2026",
    readTime: "10 min read",
    gradient: "from-amber-400 to-orange-500",
    heroImage: "/images/germany_vocational_training_system.png",
    icon: "engineering",
    intro:
      "Germany's Ausbildung system is one of the most successful vocational training models in the world. Here's everything international students need to know about participating in this unique program.",
    sections: [
      {
        heading: "What is Ausbildung?",
        content: [
          "Ausbildung is a dual vocational training program that combines practical on-the-job training with classroom education. Trainees typically spend 3–4 days per week at a company and 1–2 days at a vocational school (Berufsschule).",
          "Programs last 2–3.5 years depending on the profession, and graduates receive a nationally recognized qualification (Berufsabschluss).",
        ],
      },
      {
        heading: "Earning While Learning",
        content: [
          "One of the biggest advantages is that Ausbildung trainees receive a monthly salary (Ausbildungsvergütung). This typically ranges from €800 to €1,200 per month in the first year, increasing with each subsequent year.",
          "Trainees also receive full social benefits including health insurance, pension contributions, and paid vacation.",
        ],
      },
      {
        heading: "Popular Ausbildung Professions",
        content: [
          "Some of the most popular fields for international students include hospitality management (Hotelkaufmann/frau), healthcare assistance (Pflegefachmann/frau), mechatronics (Mechatroniker/in), IT specialist (Fachinformatiker/in), and industrial clerk (Industriekaufmann/frau).",
        ],
      },
      {
        heading: "How to Apply from Kenya",
        content: [
          "Step 1: Achieve at least B1 German proficiency (B2 preferred). Step 2: Research companies offering Ausbildung positions on platforms like the Federal Employment Agency (Bundesagentur für Arbeit). Step 3: Prepare German-style application documents. Step 4: Interview and secure a training contract. Step 5: Apply for your training visa at the German Embassy.",
        ],
      },
    ],
  },
  "how-to-study-in-germany-for-free": {
    title: "How to Study in Germany for Free",
    category: "Study",
    date: "February 28, 2026",
    readTime: "7 min read",
    gradient: "from-blue-400 to-indigo-500",
    heroImage: "/images/how_to_study_in_germany_for_free.jpg",
    icon: "school",
    intro:
      "Germany is one of the few countries in the world where you can earn a world-class degree with minimal tuition fees. Here's how to make it happen.",
    sections: [
      {
        heading: "Tuition-Free Public Universities",
        content: [
          "Most German public universities charge no tuition fees for international students, regardless of nationality. You typically only pay a semester fee (Semesterbeitrag) of €150–350, which usually includes a public transportation pass.",
          "This applies to both bachelor's and master's programs at most universities across Germany. The exception is Baden-Württemberg, which charges €1,500/semester for non-EU students.",
        ],
      },
      {
        heading: "Living Costs and Financial Requirements",
        content: [
          "While tuition is free, you need to prove financial means for a student visa. The current requirement is approximately €11,208/year in a blocked account (Sperrkonto).",
          "Average monthly expenses range from €850 to €1,200 depending on the city, covering rent, food, insurance, and transportation.",
        ],
      },
      {
        heading: "How to Apply",
        content: [
          "1. Choose your program on DAAD database or university websites. 2. Check language requirements (German or English). 3. Prepare your application documents (translated and certified). 4. Apply through uni-assist or directly to the university. 5. Receive admission and apply for a student visa.",
        ],
      },
      {
        heading: "The Language Advantage",
        content: [
          "While many programs are offered in English, studying in German opens up significantly more options. Most bachelors programs and many masters programs are taught in German, requiring B2 or C1 proficiency.",
          "German Virtual School prepares students specifically for these academic language requirements.",
        ],
      },
    ],
  },
  "best-german-scholarships": {
    title: "Best German Scholarships for African Students",
    category: "Scholarships",
    date: "February 15, 2026",
    readTime: "9 min read",
    gradient: "from-violet-400 to-purple-500",
    heroImage: "/images/best_german_scholarships_for_africans.jpg",
    icon: "emoji_events",
    intro:
      "A comprehensive guide to the best scholarship opportunities for African students looking to study in Germany, including application tips and eligibility criteria.",
    sections: [
      {
        heading: "DAAD Scholarships",
        content: [
          "The DAAD (German Academic Exchange Service) is the largest funding organization for international academic exchange. They offer scholarships for postgraduate studies, research stays, and language courses.",
          "DAAD scholarships typically cover monthly stipend (€934–1,300), health insurance, travel allowance, and study/research allowance.",
        ],
      },
      {
        heading: "Konrad-Adenauer-Stiftung",
        content: [
          "This political foundation supports international students with strong academic records and community engagement. Scholarships cover monthly stipend, health insurance, and academic support.",
        ],
      },
      {
        heading: "Heinrich Böll Foundation",
        content: [
          "Offers scholarships for students committed to sustainability, democracy, and human rights. Open to international students for both bachelor's and master's programs.",
        ],
      },
      {
        heading: "Application Tips",
        content: [
          "Start early — most deadlines are 6–12 months before the study start. Focus on strong motivation letters that connect your goals to Germany. Demonstrate community engagement and leadership. Achieve strong German language certification (B2+). Maintain excellent academic records.",
        ],
      },
    ],
  },
  "german-language-requirements-for-visa": {
    title: "German Language Requirements for Germany Visa",
    category: "Visa",
    date: "January 25, 2026",
    readTime: "6 min read",
    gradient: "from-rose-400 to-pink-500",
    heroImage: "/images/requirements_for_german_visa.jpg",
    icon: "flight_takeoff",
    intro:
      "Different visa categories require different language levels. This guide breaks down exactly what you need for each type of German visa application.",
    sections: [
      {
        heading: "Family Reunification Visa",
        content: [
          "Requires A1 certificate (basic level). This is the minimum language requirement and proves you can handle basic everyday situations in German.",
        ],
      },
      {
        heading: "Student Visa",
        content: [
          "Requirements vary by program. German-taught programs typically require B2–C1 certified proficiency. English-taught programs may not require German certification but B1+ is strongly recommended for daily life.",
        ],
      },
      {
        heading: "Work Visa / Skilled Worker Visa",
        content: [
          "B1–B2 required for most sectors. Regulated professions (healthcare, engineering) may require B2+ with specific professional language certification. IT sector may accept B1 or even English-only in some cases.",
        ],
      },
      {
        heading: "Ausbildung (Training) Visa",
        content: [
          "B1 minimum for most training positions. B2 strongly preferred and gives significant advantages in both the application process and daily training activities.",
        ],
      },
    ],
  },
  "preparing-for-goethe-exam": {
    title: "How to Prepare for Your Goethe Exam",
    category: "Exams",
    date: "January 10, 2026",
    readTime: "8 min read",
    gradient: "from-cyan-400 to-blue-500",
    heroImage: "/images/prepare_for_goethe.jpg",
    icon: "quiz",
    intro:
      "Practical strategies, study tips, and resources to help you pass your Goethe exam on the first attempt. Applicable for all levels from A1 to C2.",
    sections: [
      {
        heading: "Understand the Exam Format",
        content: [
          "Every Goethe exam tests four skills: Reading (Lesen), Listening (Hören), Writing (Schreiben), and Speaking (Sprechen). Understanding the exact format, timing, and scoring criteria is your first step to success.",
        ],
      },
      {
        heading: "Create a Study Schedule",
        content: [
          "Consistent daily practice beats cramming. Aim for at least 1–2 hours of focused German study per day, distributed across all four skills. Dedicate extra time to your weakest areas.",
        ],
      },
      {
        heading: "Practice with Real Exam Materials",
        content: [
          "The Goethe-Institut provides official practice materials on their website. Use these to simulate exam conditions — time yourself, use only the materials allowed in the actual exam, and review your mistakes thoroughly.",
        ],
      },
      {
        heading: "Enroll in a Preparation Course",
        content: [
          "German Virtual School offers structured exam preparation as part of our courses. Our instructors guide you through exam strategies, common pitfalls, and provide individual feedback on practice attempts. This focused preparation significantly improves pass rates.",
        ],
      },
    ],
  },
};

export default function BlogArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = articleData[slug];

  if (!article) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">
            article
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">
            Article Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            The article you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/blog"
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors font-display"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${article.heroImage}')` }}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-0 bg-linear-to-br ${article.gradient} opacity-70`}
        />
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-white/10 blur-[100px]" />

        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 mb-6"
            >
              <Link
                href="/blog"
                className="text-white/60 hover:text-white transition-colors text-sm font-display"
              >
                Blog
              </Link>
              <span className="text-white/30">→</span>
              <span className="text-sm font-semibold font-display">
                {article.category}
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6 font-display"
            >
              {article.title}
            </motion.h1>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-wrap items-center gap-4 text-sm text-white/70"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">
                  calendar_today
                </span>
                {article.date}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">
                  schedule
                </span>
                {article.readTime}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold font-display">
                {article.category}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg lg:text-xl text-slate-700 dark:text-slate-300 leading-relaxed mb-12 border-l-4 border-primary pl-6 italic"
          >
            {article.intro}
          </motion.p>

          {article.sections.map((section) => (
            <motion.div
              key={section.heading}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-display">
                {section.heading}
              </h2>
              {section.content.map((para, j) => (
                <p
                  key={j}
                  className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4"
                >
                  {para}
                </p>
              ))}
            </motion.div>
          ))}

          {/* Article CTA */}
          <div className="mt-16 bg-linear-to-br from-primary/5 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/10 rounded-2xl p-8 border border-primary/10 text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-display">
              Ready to Start Your German Journey?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto">
              German Virtual School offers structured courses from A1 to C2,
              designed to prepare you for opportunities in Germany.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors font-display"
              >
                Enroll Now
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-display"
              >
                More Articles
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
