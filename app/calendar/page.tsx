"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  GraduationCap, 
  Sparkles,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  course: {
    id: string;
    title: string;
    level: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["public-calendar"],
    queryFn: async () => {
      const response = await axios.get("/api/calendar");
      return response.data.data;
    },
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const selectedDateEvents = events.filter((event) => 
    isSameDay(parseISO(event.startTime), selectedDate)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 md:py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <img src="/gvs-logo.png" alt="GVS Logo" className="h-8 md:h-10 w-auto dark:brightness-0 dark:invert" />
            <div className="flex flex-col">
              <span className="text-sm md:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                German Virtual School
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-sans uppercase tracking-widest">
                Excellence in German Education
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="hidden sm:inline-block text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/courses" className="hidden sm:inline-block text-sm font-medium hover:text-primary transition-colors">Courses</Link>
            {session ? (
              <Link href="/student/dashboard" className="px-3 py-2 md:px-5 md:py-2.5 bg-primary text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="px-3 py-2 md:px-5 md:py-2.5 bg-primary text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <header className="relative pt-16 pb-12 px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] rounded-full"
          >
            <Sparkles className="size-3" />
            Your Academic Schedule
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            Master German at Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Perfect Pace</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400"
          >
            "Language is the road map of a culture. It tells you where its people come from and where they are going."
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-24 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Calendar Section */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
                <div className="text-left">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    {format(currentDate, "MMMM yyyy")}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium tracking-wide">Select a date to view available sessions</p>
                </div>
                <div className="flex items-center gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <button 
                    onClick={prevMonth}
                    className="p-3 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-xl text-slate-600 dark:text-slate-300 transition-all"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button 
                    onClick={() => {
                        const today = new Date();
                        setCurrentDate(today);
                        setSelectedDate(today);
                    }}
                    className="px-6 py-2 text-sm font-bold bg-white dark:bg-slate-700 shadow-sm rounded-xl text-primary dark:text-white transition-all"
                  >
                    Today
                  </button>
                  <button 
                    onClick={nextMonth}
                    className="p-3 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-xl text-slate-600 dark:text-slate-300 transition-all"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>

              {/* Grid Header */}
              <div className="overflow-x-auto pb-4">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-7 mb-4">
                    {weekDays.map((day) => (
                      <div key={day} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grid Days */}
                  <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800">
                    {calendarDays.map((day, dayIdx) => {
                      const dayEvents = events.filter(e => isSameDay(parseISO(e.startTime), day));
                      const isTodayActive = isSameDay(day, new Date());
                      const isCurrentMonth = isSameMonth(day, monthStart);
                      const isSelected = isSameDay(day, selectedDate);

                      return (
                        <div
                          key={day.toString()}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            min-h-[120px] p-3 border-r border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all relative group
                            ${!isCurrentMonth ? "opacity-20 bg-slate-50/10" : "bg-white dark:bg-slate-900"}
                            ${isSelected ? "bg-primary/5 ring-2 ring-inset ring-primary/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                            ${(dayIdx + 1) % 7 === 0 ? "" : ""}
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span 
                              className={`
                                text-sm font-bold w-8 h-8 flex items-center justify-center rounded-xl transition-all
                                ${isTodayActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-600 dark:text-slate-400"}
                                ${isSelected && !isTodayActive ? "bg-slate-200 dark:bg-slate-700" : ""}
                              `}
                            >
                              {format(day, "d")}
                            </span>
                            {dayEvents.length > 0 && isCurrentMonth && (
                                <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
                            )}
                          </div>
                          
                          <div className="space-y-1.5 overflow-hidden">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div 
                                key={event.id} 
                                className="px-2 py-1 text-[10px] font-bold rounded-lg truncate bg-primary/5 text-primary border border-primary/10 group-hover:scale-105 transition-transform"
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <div className="text-[9px] font-black text-slate-400 pl-1 uppercase tracking-wider">
                                    + {dayEvents.length - 2} more
                                </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-[32px] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="flex-1 space-y-6 relative z-10">
                <h3 className="text-3xl font-black tracking-tight leading-tight">Why Choose Our Academy?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Live Interactive Classes",
                    "Certified German Teachers",
                    "Modern Learning Materials",
                    "Global Community Support"
                  ].map(benefit => (
                    <div key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-300">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="size-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Joined by <span className="text-white font-bold">1,200+</span> happy students</p>
                </div>
              </div>
              <div className="w-56 h-56 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 flex items-center justify-center p-8 shrink-0 relative z-10 rotate-3 animate-float">
                 <div className="text-center">
                    <Sparkles className="size-12 text-primary mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Unlock Your <br /> Potential</p>
                 </div>
              </div>
            </div>
          </section>

          {/* Agenda Sidebar */}
          <aside className="lg:col-span-4 sticky top-32 space-y-8">
            <motion.div 
               key={selectedDate.toString()}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Agenda
                </h3>
                <div className="px-3 py-1.5 bg-primary overflow-hidden rounded-xl text-white text-[10px] font-black uppercase tracking-widest">
                    {format(selectedDate, "MMM d")}
                </div>
              </div>

              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto animate-pulse"></div>
                    <p className="text-sm font-bold text-slate-400">Syncing schedule...</p>
                  </div>
                ) : selectedDateEvents.length === 0 ? (
                  <div className="text-center py-16 space-y-6">
                    <div className="size-20 bg-slate-50 dark:bg-slate-800/50 rounded-[30px] flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                      <CalendarIcon className="size-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-black text-slate-900 dark:text-white">Empty Horizon</p>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                        No classes scheduled for this day yet. Check other dates or explore our courses!
                      </p>
                    </div>
                    <Link href="/courses" className="inline-flex items-center gap-2 text-primary font-black text-sm hover:gap-3 transition-all uppercase tracking-widest">
                      Explore Courses <ChevronRight className="size-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => (
                      <div key={event.id} className="group p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <div className="flex items-start justify-between gap-4 mb-4">
                           <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              <BookOpen className="size-5" />
                           </div>
                           <div className="flex-1">
                             <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{event.course.title}</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                             <Clock className="size-3.5" />
                             {format(parseISO(event.startTime), "h:mm a")}
                           </div>
                           <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                             <Video className="size-3.5" />
                             Virtual Room
                           </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                 <img src={`https://ui-avatars.com/api/?name=${event.teacher.firstName}+${event.teacher.lastName}&background=random`} alt="avatar" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">{event.teacher.firstName}</span>
                           </div>
                           <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                              {event.status}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Newsletter/Action Widget */}
            <div className="bg-primary rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
               <h3 className="text-xl font-black mb-4 relative z-10">Never Miss a Session</h3>
               <p className="text-sm text-blue-50/80 mb-6 font-medium leading-relaxed relative z-10">Sync this academy calendar with your personal Google or Outlook calendar.</p>
               <button className="w-full py-4 bg-white text-primary font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 active:scale-95 relative z-10 flex items-center justify-center gap-2">
                 <CalendarIcon className="size-5" /> Sync Calendar
               </button>
            </div>
          </aside>

        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(3deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
