import Link from "next/link";

const footerLinks = {
  explore: [
    { label: "Germany Opportunities", href: "/opportunities" },
    { label: "German Courses", href: "/courses" },
    { label: "Goethe Exam Prep", href: "/exam-prep" },
    { label: "Preparation Services", href: "/services" },
    { label: "Student Resources", href: "/resources" },
  ],
  quickLinks: [
    { label: "Explore Courses", href: "/courses" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Blog", href: "/blog" },
    { label: "About Us", href: "/about" },
    { label: "Become a Partner", href: "/partners" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Student Portal", href: "/login" },
    { label: "School Calendar", href: "/school-info" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-0.5 bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <img
                src="/gvs-logo.png"
                alt="GVS Logo"
                className="h-9 w-auto brightness-0 invert"
              />
              <div>
                <h3 className="text-lg font-bold text-white font-display leading-tight">
                  German Virtual School
                </h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-6 max-w-xs">
              The premier online platform for learning German. CEFR-aligned
              courses from A1 to C2 with qualified instructors and Goethe exam
              preparation.
            </p>
            {/* Social / Contact */}
            <div className="flex flex-col gap-2.5">
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@germanvirtualschool.com"}`}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base">
                  mail
                </span>
                {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
                  "support@germanvirtualschool.com"}
              </a>
              <a
                href="https://wa.me/254116197770"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-green-400 transition-colors"
              >
                <span className="material-symbols-outlined text-base">
                  chat
                </span>
                WhatsApp Support
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider font-display">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider font-display">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider font-display">
              Support
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} German Virtual School. All rights
            reserved.
          </p>
          <p className="text-center sm:text-right">
            Registered Educational Institution · Accredited CEFR Programs
          </p>
        </div>
      </div>
    </footer>
  );
}
