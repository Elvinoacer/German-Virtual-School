"use client";

import Link from "next/link";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using the German Virtual School (GVS) platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily download one copy of the materials (information or software) on GVS's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not modify or copy the materials, use the materials for any commercial purpose, or attempt to decompile or reverse engineer any software contained on the platform."
    },
    {
      title: "3. Enrollment and Fees",
      content: "Enrollment in courses is subject to availability and GVS's approval. All fees are clearly stated and must be paid according to the defined billing cycle. GVS reserves the right to adjust fees or terms for future cycles with proper notice."
    },
    {
      title: "4. Code of Conduct",
      content: "Students and teachers are expected to maintain a professional and respectful environment at all times. Harassment, discrimination, or disruptive behavior in virtual classrooms or forums will result in immediate termination of access without refund."
    },
    {
      title: "5. Intellectual Property",
      content: "All course materials, including videos, PDFs, assignments, and curriculum designs, are the intellectual property of German Virtual School or its licensors. Unauthorized distribution or reproduction is strictly prohibited."
    },
    {
      title: "6. Limitation of Liability",
      content: "In no event shall GVS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GVS's platform."
    },
    {
      title: "7. Modifications",
      content: "GVS may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service."
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-serif transition-colors duration-200">
      {/* Simple Header */}
      {/* Header - REMOVED (handled by layout) */}

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-12 lg:py-24 break-words">
        <div className="mb-12 lg:mb-16 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 font-display">Terms of Service</h1>
          <p className="text-slate-500 dark:text-slate-400 font-sans uppercase tracking-widest text-sm">
            Last Updated: January 5, 2026
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 font-sans text-sm mb-6">
            Questions about our terms? Contact our legal department at <a href="mailto:legal@gvs.edu" className="text-primary hover:underline">legal@gvs.edu</a>
          </p>
          <Link href="/" className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold font-sans rounded-sm hover:opacity-90 transition-opacity inline-block">
            Back to Home
          </Link>
        </div>
      </main>

      {/* Material Symbols */}
      {/* Material Symbols - REMOVED (handled by layout) */}
    </div>
  );
}
