"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

interface SchoolInfo {
  school: {
    name: string;
    supportEmail: string | null;
  };
  enrollment: {
    status: "open" | "closed" | "upcoming";
    message: string;
    startDate: string | null;
    endDate: string | null;
  };
  calendar: {
    orientationDate: string | null;
    firstClassDate: string | null;
    lastClassDate: string | null;
  };
  currentTerm: {
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  fees: {
    semesterFee: number;
    currency: string;
  } | null;
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalTeachers: number;
  };
  testimonials: Array<{
    id: string;
    content: string;
    rating: number;
    studentName: string;
    createdAt: string;
  }>;
}

function DateCard({ 
  icon, 
  label, 
  date, 
  highlight = false 
}: { 
  icon: string; 
  label: string; 
  date: string | null; 
  highlight?: boolean;
}) {
  if (!date) return null;
  
  const dateObj = new Date(date);
  const isPast = dateObj < new Date();
  
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border ${
      highlight ? "border-primary/30 shadow-lg shadow-primary/10" : "border-slate-200 dark:border-slate-700"
    } transition-all hover:shadow-md`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`size-10 rounded-xl flex items-center justify-center ${
          isPast 
            ? "bg-slate-100 dark:bg-slate-700 text-slate-400" 
            : highlight 
              ? "bg-primary text-white" 
              : "bg-blue-50 dark:bg-blue-900/20 text-primary"
        }`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {isPast && (
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
            COMPLETED
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-bold ${isPast ? "text-slate-400" : "text-slate-900 dark:text-white"}`}>
        {format(dateObj, "EEEE, MMMM d, yyyy")}
      </p>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-center hover:shadow-md transition-all">
      <div className={`size-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
        <span className="material-symbols-outlined text-2xl text-white">{icon}</span>
      </div>
      <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value.toLocaleString()}</p>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          className={`material-symbols-outlined text-base ${
            star <= rating ? "text-amber-400" : "text-slate-300"
          }`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function SchoolInfoPage() {
  const { data, isLoading, isError } = useQuery<SchoolInfo>({
    queryKey: ["school-info"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/school/info");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-slate-500">Loading school information...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
          <p className="text-slate-600 dark:text-slate-400">Failed to load school information.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                {data.school.name}
              </h1>
              <p className="text-blue-100 text-lg max-w-xl">
                Your gateway to German language education. Join our vibrant community of learners and expert instructors.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-xl text-center"
              >
                Apply Now
              </Link>
              <Link 
                href="/courses" 
                className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all text-center"
              >
                View Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Enrollment Status Banner */}
        <div className={`rounded-2xl p-6 md:p-8 mb-12 ${
          data.enrollment.status === "open" 
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
            : data.enrollment.status === "upcoming"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`size-14 rounded-2xl flex items-center justify-center ${
                data.enrollment.status === "open" 
                  ? "bg-white/20" 
                  : data.enrollment.status === "upcoming"
                    ? "bg-white/20"
                    : "bg-slate-300 dark:bg-slate-600"
              }`}>
                <span className="material-symbols-outlined text-3xl">
                  {data.enrollment.status === "open" ? "how_to_reg" : data.enrollment.status === "upcoming" ? "schedule" : "event_busy"}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">
                  Enrollment Status
                </p>
                <p className="text-xl font-bold">
                  {data.enrollment.message}
                </p>
              </div>
            </div>
            {data.enrollment.status === "open" && (
              <Link 
                href="/register" 
                className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-center shrink-0"
              >
                Register Now →
              </Link>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Our Community
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard 
              icon="menu_book" 
              value={data.stats.totalCourses} 
              label="Courses Available" 
              color="bg-primary"
            />
            <StatCard 
              icon="groups" 
              value={data.stats.totalStudents} 
              label="Active Students" 
              color="bg-emerald-500"
            />
            <StatCard 
              icon="school" 
              value={data.stats.totalTeachers} 
              label="Expert Teachers" 
              color="bg-purple-500"
            />
          </div>
        </section>

        {/* Important Dates */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            Important Dates
          </h2>
          <p className="text-slate-500 text-center mb-8">
            {data.currentTerm ? `${data.currentTerm.name}` : "Academic Calendar"}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DateCard 
              icon="edit_calendar" 
              label="Enrollment Opens" 
              date={data.enrollment.startDate} 
            />
            <DateCard 
              icon="event_busy" 
              label="Enrollment Closes" 
              date={data.enrollment.endDate}
              highlight={data.enrollment.status === "open"}
            />
            <DateCard 
              icon="groups" 
              label="Orientation Day" 
              date={data.calendar.orientationDate} 
              highlight
            />
            <DateCard 
              icon="play_circle" 
              label="Classes Begin" 
              date={data.calendar.firstClassDate}
              highlight
            />
            <DateCard 
              icon="celebration" 
              label="Classes End" 
              date={data.calendar.lastClassDate} 
            />
            {data.currentTerm && (
              <DateCard 
                icon="event" 
                label="Term Ends" 
                date={data.currentTerm.endDate} 
              />
            )}
          </div>
        </section>

        {/* Fees Section */}
        {data.fees && data.fees.semesterFee > 0 && (
          <section className="mb-16">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Semester Fee</h2>
              <p className="text-slate-400 mb-6">Invest in your future with German language proficiency</p>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-5xl md:text-6xl font-black">
                  {data.fees.currency} {data.fees.semesterFee.toLocaleString()}
                </span>
                <span className="text-slate-400">/semester</span>
              </div>
              <ul className="flex flex-wrap justify-center gap-4 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                  Live virtual classes
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                  Learning resources
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                  Progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                  Certificate of completion
                </li>
              </ul>
              <Link 
                href="/register" 
                className="inline-block bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg"
              >
                Start Your Journey
              </Link>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {data.testimonials.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
              What Our Students Say
            </h2>
            <p className="text-slate-500 text-center mb-8">Real feedback from our community</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                >
                  <StarRating rating={testimonial.rating} />
                  <p className="text-slate-600 dark:text-slate-300 mt-4 mb-6 line-clamp-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {testimonial.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{testimonial.studentName}</p>
                      <p className="text-xs text-slate-500">Student</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="text-center">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 md:p-12">
            <span className="material-symbols-outlined text-5xl text-primary mb-4">contact_support</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Have Questions?
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Our team is here to help you with any questions about enrollment, courses, or the German Virtual School experience.
            </p>
            {data.school.supportEmail && (
              <a 
                href={`mailto:${data.school.supportEmail}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                <span className="material-symbols-outlined">mail</span>
                {data.school.supportEmail}
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
