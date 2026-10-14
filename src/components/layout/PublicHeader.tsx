"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  {
    label: "Opportunities",
    href: "/opportunities",
    children: [
      {
        label: "Study in Germany",
        href: "/opportunities/study",
        icon: "school",
      },
      { label: "Work in Germany", href: "/opportunities/work", icon: "work" },
      {
        label: "Ausbildung Pathway",
        href: "/opportunities/ausbildung",
        icon: "engineering",
      },
    ],
  },
  {
    label: "Courses",
    href: "/courses",
    children: [
      { label: "German Courses", href: "/courses", icon: "menu_book" },
      { label: "Goethe Exam Prep", href: "/exam-prep", icon: "quiz" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "Visa Readiness",
        href: "/services#visa",
        icon: "flight_takeoff",
      },
      {
        label: "Interview Coaching",
        href: "/services#interview",
        icon: "record_voice_over",
      },
      {
        label: "CV & Application",
        href: "/services#cv",
        icon: "description",
      },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
  },
  {
    label: "More",
    href: "#",
    children: [
      { label: "Blog", href: "/blog", icon: "article" },
      {
        label: "Success Stories",
        href: "/success-stories",
        icon: "emoji_events",
      },
    ],
  },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string, children?: { href: string }[]) => {
    if (href === "/") return pathname === "/";
    if (pathname.startsWith(href)) return true;
    if (children) {
      return children.some((child) => {
        const cleanHref = child.href.split("#")[0];
        return pathname.startsWith(cleanHref);
      });
    }
    return false;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-slate-200/30 dark:shadow-slate-900/50 border-b border-slate-200/50 dark:border-slate-700/50"
            : "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 md:gap-2.5 shrink-0 min-w-0"
            >
              <img
                src="/gvs-logo.png"
                alt="GVS Logo"
                className="h-8 md:h-9 w-auto dark:brightness-0 dark:invert"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] md:text-[15px] xl:text-base 2xl:text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display leading-tight whitespace-nowrap">
                  German Virtual School
                </span>
                <span className="hidden 2xl:block text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-medium whitespace-nowrap">
                  Excellence in German Education
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              ref={dropdownRef}
              className="hidden xl:flex items-center gap-0.5"
            >
              {navLinks.map((link) => (
                <div key={link.href} className="relative">
                  {link.children ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === link.href ? null : link.href,
                          )
                        }
                        className={`flex items-center gap-1 px-2.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                          isActive(link.href, link.children)
                            ? "text-primary bg-primary/5"
                            : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        {link.label}
                        <span
                          className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                            activeDropdown === link.href ? "rotate-180" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      <AnimatePresence>
                        {activeDropdown === link.href && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1 w-60 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden z-50"
                          >
                            <div className="p-2">
                              {link.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                                    isActive(child.href)
                                      ? "text-primary bg-primary/5 font-medium"
                                      : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-lg opacity-60">
                                    {child.icon}
                                  </span>
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setActiveDropdown(null)}
                      className={`px-2.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                        isActive(link.href)
                          ? "text-primary bg-primary/5"
                          : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 shrink-0">
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors px-2.5 py-2 rounded-lg hover:bg-primary/5"
              >
                <span className="material-symbols-outlined text-[18px]">
                  login
                </span>
                <span className="hidden 2xl:inline">Portal</span>
              </Link>
              <Link
                href="/register"
                className="group relative px-3.5 md:px-4 lg:px-5 py-2 lg:py-2.5 bg-primary text-white text-[11px] md:text-xs lg:text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 font-display whitespace-nowrap"
              >
                <span className="relative z-10">Enroll Now</span>
                <div className="absolute inset-0 bg-linear-to-r from-primary via-indigo-500 to-primary bg-size-[200%_100%] animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-2xl">
                  {mobileOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-sm bg-white dark:bg-slate-900 shadow-2xl xl:hidden overflow-y-auto"
            >
              <div className="p-5">
                {/* Close button */}
                <div className="flex items-center justify-between mb-8">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <img
                      src="/gvs-logo.png"
                      alt="GVS"
                      className="h-8 w-auto dark:brightness-0 dark:invert"
                    />
                    <span className="font-bold text-slate-900 dark:text-white font-display">
                      GVS
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Mobile Links */}
                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      pathname === "/"
                        ? "text-primary bg-primary/5"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base opacity-60">
                      home
                    </span>
                    Home
                  </Link>
                  {navLinks.map((link) => (
                    <div key={link.href}>
                      {link.children ? (
                        <>
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === link.href ? null : link.href,
                              )
                            }
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                              isActive(link.href, link.children)
                                ? "text-primary bg-primary/5"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {link.label}
                            <span
                              className={`material-symbols-outlined text-lg transition-transform ${
                                activeDropdown === link.href ? "rotate-180" : ""
                              }`}
                            >
                              expand_more
                            </span>
                          </button>
                          <AnimatePresence>
                            {activeDropdown === link.href && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 pb-2 space-y-0.5">
                                  {link.children.map((child) => (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-base opacity-50">
                                        {child.icon}
                                      </span>
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                            isActive(link.href)
                              ? "text-primary bg-primary/5"
                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {link.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile CTA */}
                <div className="mt-8 space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors font-display"
                  >
                    Enroll Now
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-6 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Student Portal
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
