
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/gvs-logo.png" alt="GVS Logo" className="h-10 w-auto brightness-0 invert" />
              <h3 className="text-xl font-bold text-white font-sans">
                German Virtual School
              </h3>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Providing premier German language education through innovative
              virtual learning platforms since 2020. Accredited programs
              following CEFR standards.
            </p>
            <p className="text-xs text-slate-400">
              Registered Educational Institution
              <br />
              Certificate No. EDU-2020-GVS-001
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 font-sans">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-primary transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-primary transition-colors"
                >
                  Admissions
                </Link>
              </li>
              <li>
                <Link
                  href="/school-info"
                  className="hover:text-primary transition-colors"
                >
                  School Information
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/calendar"
                  className="hover:text-primary transition-colors"
                >
                  Academic Calendar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 font-sans">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/login"
                  className="hover:text-primary transition-colors"
                >
                  Student Portal
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-sm">
          <p>
            © {new Date().getFullYear()} German Virtual School. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
