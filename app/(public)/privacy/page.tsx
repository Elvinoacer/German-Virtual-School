"use client";

import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us when you create an account, enroll in a course, or participate in our forums. This may include your name, email address, payment information, and educational background. We also automatically collect certain technical information, such as your IP address and browsing behavior on our platform."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, including processing enrollments, tracking attendance (mandatory for certification), and facilitating communication between students and teachers. We also use it to communicate with you about updates, billing, and promotional offers."
    },
    {
      title: "3. Data Security",
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All payment information is processed through secure, PCI-compliant third-party gateways."
    },
    {
      title: "4. GDPR Compliance",
      content: "For users in the European Union, GVS complies with the General Data Protection Regulation (GDPR). This includes your right to access, correct, or delete your personal data. Our operations are governed by the strict privacy standards required for educational institutions in Germany."
    },
    {
      title: "5. Cookies",
      content: "We use cookies and similar technologies to track your activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent."
    },
    {
      title: "6. Data Retention",
      content: "We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, academic reporting, or certification requirements."
    },
    {
      title: "7. Third-Party Services",
      content: "We may employ third-party companies and individuals to facilitate our service (e.g., video conferencing providers, payment processors). These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose."
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-serif transition-colors duration-200">
      {/* Simple Header */}
      {/* Header - REMOVED (handled by layout) */}

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-12 lg:py-24 break-words">
        <div className="mb-12 lg:mb-16 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 font-display">Privacy Policy</h1>
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
            For privacy inquiries or to exercise your data rights, email us at <a href="mailto:privacy@gvs.edu" className="text-primary hover:underline">privacy@gvs.edu</a>
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
