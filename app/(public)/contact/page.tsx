"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

const contactMethods = [
  {
    icon: "mail",
    title: "Email Us",
    value:
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
      "support@germanvirtualschool.com",
    href: `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@germanvirtualschool.com"}`,
    desc: "For general inquiries, enrollment questions, and support",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: "chat",
    title: "WhatsApp",
    value: "+254 116 197 770",
    href: "https://wa.me/254116197770",
    desc: "Quick responses during business hours (Mon–Fri, 9AM–6PM EAT)",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: "support_agent",
    title: "Support Center",
    value: "Student Portal",
    href: "/login",
    desc: "Enrolled students can access support through the student portal",
    gradient: "from-violet-500 to-purple-600",
  },
];

const faqs = [
  {
    q: "How do I enroll in a course?",
    a: "Visit our Reserve Your Seat page to secure your spot in the upcoming intake. You'll need to pay a one-time reservation fee which is deducted from your total tuition.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa, bank transfer, credit/debit cards, and other mobile money options through our secure payment platform.",
  },
  {
    q: "Can I pay in installments?",
    a: "Yes! We offer flexible installment plans with no interest charged. Minimum installment amounts are displayed on our pricing page.",
  },
  {
    q: "How are classes conducted?",
    a: "All classes are live virtual sessions conducted through our secure video platform. You'll interact directly with qualified instructors in real-time.",
  },
  {
    q: "Do you provide certificates?",
    a: "Yes, we provide certificates of completion for each level. Our courses also prepare you for internationally recognized Goethe-Institut examinations.",
  },
  {
    q: "What level should I start at?",
    a: "If you're a complete beginner, start at A1. If you have some German background, contact us for a free placement assessment.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission — in production connect to contact API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
    toast.success("Message sent successfully!");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-primary/10 blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div className="text-center max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold mb-6 font-display"
            >
              <span className="material-symbols-outlined text-lg">
                contact_support
              </span>
              Get In Touch
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 font-display"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Have questions about enrollment, courses, or your journey to
              Germany? Our team is here to help you every step of the way.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="relative -mt-8 z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.title}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  method.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 text-center"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-br ${method.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="material-symbols-outlined text-white text-2xl">
                    {method.icon}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-display">
                  {method.title}
                </h3>
                <p className="text-sm font-semibold text-primary mb-2">
                  {method.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {method.desc}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + FAQ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">
                Send Us a Message
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Fill out the form below and we&apos;ll get back to you within 24
                hours.
              </p>

              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-green-600 text-3xl">
                      check_circle
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2 font-display">
                    Message Sent!
                  </h3>
                  <p className="text-green-700 dark:text-green-400 mb-6">
                    Thank you for reaching out. We&apos;ll respond within 24
                    hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors font-display"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white transition-colors"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white transition-colors"
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Subject *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option value="enrollment">Course Enrollment</option>
                        <option value="courses">Course Information</option>
                        <option value="fees">Fees & Payment</option>
                        <option value="partnership">Partnership Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white resize-none transition-colors"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-display"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">
                          send
                        </span>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Quick answers to common questions about German Virtual School.
              </p>

              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === i ? null : i)
                      }
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <span
                        className={`material-symbols-outlined text-slate-400 text-lg shrink-0 transition-transform duration-200 ${
                          expandedFaq === i ? "rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-5 pb-5"
                      >
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-linear-to-r from-primary via-indigo-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 font-display">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Don&apos;t wait — reserve your seat in our upcoming intake and begin
            your German language journey today.
          </p>
          <Link
            href="/reserve-seat"
            className="px-10 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-100 hover:shadow-xl transition-all font-display inline-block"
          >
            Reserve Your Seat
          </Link>
        </div>
      </section>
    </div>
  );
}
