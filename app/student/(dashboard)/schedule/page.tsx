'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { 
  format, 
  addDays, 
  subDays,
  startOfToday, 
  isSameDay, 
  parseISO, 
  isPast,
  isFuture,
  isToday
} from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Video, 
  PlayCircle, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  MonitorPlay,
  User as UserIcon,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ScheduleSession {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
  recordingUrl: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  objectives: string[];
  homework: string | null;
  course: {
    id: string;
    title: string;
    level: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    image: string | null;
    avatarUrl: string | null;
  };
}

interface ScheduleData {
  sessions: ScheduleSession[];
  stats: {
    totalSessions: number;
    upcomingCount: number;
    liveNowCount: number;
  };
}

export default function StudentSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  const { data, isLoading, isError } = useQuery<ScheduleData>({
    queryKey: ['student-schedule'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/student/schedule');
      return res.data.data;
    }
  });

  // Calculate day headers for the selector (Next 14 days)
  const daysHeader = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
  }, []);

  const filteredSessions = useMemo(() => {
    if (!data?.sessions) return [];
    return data.sessions.filter(session => isSameDay(parseISO(session.startTime), selectedDate));
  }, [data, selectedDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6">
        <div className="size-20 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
          <span className="material-symbols-outlined text-4xl">warning</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Failed to load schedule</h2>
        <p className="text-text-subtle mb-6">Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-20 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 md:pt-10 space-y-8 md:space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
             <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white mb-2">My Schedule</h1>
            <p className="text-text-subtle font-medium text-base md:text-lg">Stay ahead of your learning journey with live classes and recordings.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <StatSmall label="Live Now" value={stats.liveNowCount} color="red" pulse />
            <StatSmall label="Upcoming" value={stats.upcomingCount} color="blue" />
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Class Calendar</h3>
             <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button 
                  onClick={() => setSelectedDate(startOfToday())}
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-colors"
                >
                  TODAY
                </button>
                <button 
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                >
                  <ChevronRight className="size-5" />
                </button>
             </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
             {daysHeader.map((day, idx) => {
               const active = isSameDay(day, selectedDate);
               const today = isToday(day);
               return (
                 <button
                   key={idx}
                   onClick={() => setSelectedDate(day)}
                   className={`flex flex-col items-center justify-center min-w-[80px] py-4 rounded-2xl transition-all snap-start ${
                     active 
                       ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                       : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:border-primary/50'
                   }`}
                 >
                   <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-white/70' : 'text-slate-400'}`}>
                      {format(day, 'EEE')}
                   </span>
                   <span className="text-2xl font-black mb-1">{format(day, 'd')}</span>
                   {today && <div className={`size-1.5 rounded-full ${active ? 'bg-white' : 'bg-primary'}`}></div>}
                 </button>
               );
             })}
          </div>
        </div>

        {/* Sessions List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-black text-text-main dark:text-white flex items-center gap-3">
               Classes for {format(selectedDate, 'MMMM d, yyyy')}
               {isToday(selectedDate) && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black uppercase rounded">Today</span>}
            </h2>

            {filteredSessions.length > 0 ? (
              <div className="space-y-6">
                {filteredSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center px-10">
                 <div className="size-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                    <CalendarIcon className="size-10 text-slate-300" />
                 </div>
                 <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Day is empty!</h4>
                 <p className="text-slate-500 max-w-xs font-medium">No classes scheduled for this day. Enjoy your free time or catch up on recordings.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
             {/* Weekly Summary */}
             <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Clock size={120} />
                </div>
                <h3 className="text-xl font-black mb-6 relative z-10">This Week</h3>
                <div className="space-y-6 relative z-10">
                   <WeekStat label="Completed Sessions" value={data.sessions.filter(s => isPast(parseISO(s.endTime))).length} icon="check_circle" color="emerald" />
                   <WeekStat label="Total Weekly Hours" value={Math.round(data.sessions.reduce((acc, s) => acc + (parseISO(s.endTime).getTime() - parseISO(s.startTime).getTime()) / 3600000, 0))} icon="schedule" color="blue" />
                   <WeekStat label="Courses Active" value={new Set(data.sessions.map(s => s.course.id)).size} icon="book_5" color="purple" />
                </div>
             </div>

             {/* Help Card */}
             <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-8 rounded-[2.5rem]">
                <div className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                   <Info />
                </div>
                <h4 className="text-lg font-black mb-2">Joining Live Classes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                   You can join live sessions up to 5 minutes before the start time. Ensure your camera and microphone are working for the best experience.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                   <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline text-left">Internal Virtual Classes Guide</button>
                   <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline text-left">Technical Support</button>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function SessionCard({ session }: { session: ScheduleSession }) {
  const isLive = session.status === 'LIVE' || (new Date(session.startTime) <= new Date() && new Date(session.endTime) >= new Date());
  const isPastSession = isPast(parseISO(session.endTime));
  const startTime = parseISO(session.startTime);
  const endTime = parseISO(session.endTime);

  return (
    <div className={`bg-white dark:bg-surface-dark border rounded-[2rem] overflow-hidden transition-all duration-500 group ${
      isLive ? 'border-red-500 shadow-2xl shadow-red-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl'
    }`}>
      <div className="flex flex-col md:flex-row">
        {/* Time Indicator */}
        <div className={`p-6 md:p-8 md:w-48 flex flex-row md:flex-col items-center justify-between md:justify-center text-center gap-4 transition-colors ${
          isLive ? 'bg-red-500 text-white' : 'bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800'
        }`}>
           <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLive ? 'text-white/70' : 'text-slate-400'}`}>
             {format(startTime, 'HH:mm')}
           </span>
           <span className="text-2xl font-black">START</span>
           <div className={`h-1 w-8 rounded-full my-2 ${isLive ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
           <span className={`text-sm font-bold ${isLive ? 'text-white/80' : 'text-slate-500'}`}>
             Till {format(endTime, 'HH:mm')}
           </span>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 flex flex-col gap-6">
           <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                 <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                    {session.course.level}
                 </span>
                 <span className="text-sm font-bold text-slate-400">•</span>
                 <span className="text-sm font-bold text-slate-500">{session.course.title}</span>
              </div>
              
              {isLive ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full animate-pulse">
                   <div className="size-2 bg-red-600 rounded-full"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Live Now</span>
                </div>
              ) : isPastSession ? (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completed</span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Scheduled</span>
              )}
           </div>

           <div>
              <h3 className="text-2xl font-black group-hover:text-primary transition-colors leading-tight mb-2">
                {session.title}
              </h3>
              {session.description && (
                <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2">{session.description}</p>
              )}
           </div>

           <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-50 dark:border-slate-900">
              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                    {session.teacher.image || session.teacher.avatarUrl ? (
                      <img 
                        src={session.teacher.image || session.teacher.avatarUrl || ''} 
                        alt={session.teacher.firstName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                         <UserIcon size={20} />
                      </div>
                    )}
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{session.teacher.firstName} {session.teacher.lastName}</p>
                 </div>
              </div>

              <div className="flex gap-3">
                 {isLive ? (
                   <Link href={`/classroom/${session.id}`} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">
                      <MonitorPlay size={18} />
                      Enter Classroom
                   </Link>
                 ) : isPastSession ? (
                   session.recordingUrl ? (
                     <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                        <PlayCircle size={18} />
                        Watch Recording
                     </a>
                   ) : (
                     <button disabled className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl font-black text-sm cursor-not-allowed">
                        Session Closed
                     </button>
                   )
                 ) : (
                   <button 
                     onClick={() => toast.info("Waiting for session to start...")}
                     className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                   >
                      <Clock size={18} />
                      Class Pending
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatSmall({ label, value, color, pulse }: { label: string; value: number; color: 'red' | 'blue'; pulse?: boolean }) {
  const colors = {
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${colors[color]} ${pulse ? 'animate-pulse' : ''}`}>
       <span className="text-xs font-black uppercase tracking-widest">{label}</span>
       <span className="text-lg font-black">{value}</span>
    </div>
  );
}

function WeekStat({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  const colorMap: any = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };
  return (
    <div className="flex items-center gap-4">
       <span className={`material-symbols-outlined ${colorMap[color]}`}>{icon}</span>
       <div className="flex flex-col">
          <span className="text-2xl font-black leading-none mb-1">{value}</span>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</span>
       </div>
    </div>
  );
}
