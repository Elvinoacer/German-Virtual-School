"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicHeader() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path.startsWith("#")) return false; // Don't highlight hash links actively standard way
    return pathname === path ? "text-primary" : "text-slate-700 dark:text-slate-300";
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <img src="/gvs-logo.png" alt="GVS Logo" className="h-8 md:h-10 w-auto dark:brightness-0 dark:invert" />
            <div className="flex flex-col">
              <h1 className="text-sm md:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                German Virtual School
              </h1>
              <p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-sans uppercase tracking-widest">
                Excellence in German Education
              </p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-sans">
            <Link
              href="/about"
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive("/about")}`}
            >
              About
            </Link>
            <Link
              href="/courses"
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive("/courses")}`}
            >
              Curriculum
            </Link>
            {/* Hash links only work on home page or if we handle them specifically. 
                For specific pages like 'Faculty' or 'Testimonials' which are sections on Home,
                we might want to link to /#faculty if we are not on home.
            */}
             <Link
              href="/#faculty"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            >
              Faculty
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors font-sans"
            >
              Student Portal
            </Link>
            <Link
              href="/reserve-seat"
              className="px-3 py-1.5 md:px-4 lg:px-6 md:py-2 lg:py-2.5 bg-primary text-white text-xs md:text-sm font-semibold hover:bg-blue-700 transition-colors font-sans rounded-lg"
            >
              Reserve a Seat
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
