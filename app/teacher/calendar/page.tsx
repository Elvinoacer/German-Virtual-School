"use client";

import { useState, useEffect } from "react";
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
  formatDistanceToNow
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Video, MoreVertical, X, Users } from "lucide-react";
import axios from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "class" | "deadline";
  courseName: string;
  teacherId?: string;
  isAdminMeeting?: boolean;
}

export default function TeacherCalendarPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New session form state
  const [newSession, setNewSession] = useState({
    courseId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const { data: teacherCourses = [] } = useQuery({
    queryKey: ["teacher-courses-calendar", session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(`/courses?status=ALL`);
      return response.data.data.data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["teacher-calendar"],
    queryFn: async () => {
      const response = await axios.get("/teacher/calendar");
      const { sessions, assignments } = response.data.data;

      const sessionEvents: CalendarEvent[] = sessions.map((session: any) => ({
        id: session.id,
        title: session.title || session.course.title,
        date: parseISO(session.startTime),
        time: format(parseISO(session.startTime), "h:mm a"),
        type: "class",
        courseName: session.course.title,
        teacherId: session.teacher.id,
        isAdminMeeting: session.isAdminMeeting || false,
      }));

      const assignmentEvents: CalendarEvent[] = assignments.map((assignment: any) => ({
        id: assignment.id,
        title: `${assignment.title} Due`,
        date: parseISO(assignment.dueDate),
        time: format(parseISO(assignment.dueDate), "h:mm a"),
        type: "deadline",
        courseName: assignment.course.title,
      }));

      return [...sessionEvents, ...assignmentEvents];
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (payload: any) => {
      await axios.post("/sessions", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-calendar"] });
      toast.success("Class scheduled successfully!");
      setIsModalOpen(false);
      setNewSession({ courseId: "", title: "", description: "", startTime: "", endTime: "" });
    },
    onError: () => {
      toast.error("Failed to schedule class");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await axios.delete(`/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-calendar"] });
      toast.success("Class deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete class");
    },
  });

  const handleDelete = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      deleteMutation.mutate(sessionId);
    }
  };



  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create date objects from the local input strings (which browsers treat as local time)
    // and convert to ISO strings to ensure the backend receives the exact intended time in UTC
    const startDate = new Date(newSession.startTime);
    const endDate = new Date(newSession.endTime);

    scheduleMutation.mutate({
        ...newSession,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
    });
  };

  const selectedDateEvents = events.filter((event) => isSameDay(event.date, selectedDate));

  const upcomingClass = events
    .filter((e) => e.type === "class" && e.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your schedule and upcoming classes</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              setSelectedDate(today);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">Schedule Class</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-1">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
            {weekDays.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 auto-rows-fr min-w-[600px]">
              {calendarDays.map((day, dayIdx) => {
                const dayEvents = events.filter(e => isSameDay(e.date, day));
                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] md:min-h-[100px] p-1.5 md:p-2 border-b border-r border-slate-200 dark:border-slate-800 cursor-pointer transition-colors
                      ${!isSameMonth(day, monthStart) ? "bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600" : "bg-white dark:bg-card-dark"}
                      ${isSameDay(day, selectedDate) ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                      ${dayIdx % 7 === 6 ? "border-r-0" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span 
                        className={`
                          text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full
                          ${isSameDay(day, new Date()) 
                            ? "bg-primary text-white" 
                            : "text-slate-700 dark:text-slate-300"}
                        `}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                         <div key={event.id} className={`px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded truncate ${
                           event.type === 'class' 
                             ? 'text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300' 
                             : 'text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300'
                         }`}>
                           {event.title}
                         </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] md:text-xs text-slate-400 pl-1">
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar / Agenda */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Schedule for {format(selectedDate, "MMM d, yyyy")}
            </h3>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">Loading events...</div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No events scheduled for this day.
                </div>
              ) : (
                selectedDateEvents.map((event) => (
                  <div key={event.id} className="flex gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className={`
                      w-1 rounded-full h-full
                      ${event.isAdminMeeting ? 'bg-amber-500' : event.type === 'class' ? 'bg-blue-500' : 'bg-orange-500'}
                    `}></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</h4>
                        {/* More options dropdown would go here, for now just a delete button if it's a class */}
                        {!event.isAdminMeeting && event.type === 'class' && (event as any).teacherId === session?.user?.id && (
                           <button 
                             onClick={() => handleDelete(event.id)}
                             className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                             title="Delete Class"
                           >
                             <span className="material-symbols-outlined text-sm">delete</span>
                           </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {event.time}
                        </div>
                        {event.isAdminMeeting ? (
                          <>
                            <Link href={`/meeting/${event.id}`} className="text-primary hover:underline flex items-center gap-1 font-semibold">
                              <Video className="w-3.5 h-3.5" />
                              Join Meeting
                            </Link>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                              Admin Meeting
                            </span>
                          </>
                        ) : event.type === 'class' && (
                          <>
                            <Link href={`/classroom/${event.id}`} className="flex items-center gap-1 text-primary hover:underline font-medium">
                              <Video className="w-3.5 h-3.5" />
                              Join Classroom
                            </Link>
                            <Link href={`/teacher/sessions/${event.id}/attendance`} className="text-primary hover:underline flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              Report
                            </Link>
                          </>
                        )}
                        {!event.isAdminMeeting && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {event.courseName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg border border-dashed border-primary/30 transition-colors"
              >
                + Schedule New Class
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">Upcoming Class</h3>
            {upcomingClass ? (
              <>
                <p className="text-blue-100 text-sm mb-6">
                  {upcomingClass.title} starts {formatDistanceToNow(upcomingClass.date, { addSuffix: true })}.
                </p>
                <Link href={upcomingClass?.isAdminMeeting ? `/meeting/${upcomingClass.id}` : `/classroom/${upcomingClass.id}`} className="block w-full py-2.5 bg-white text-center text-primary font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                  Join Now
                </Link>
              </>
            ) : (
              <p className="text-blue-100 text-sm">No upcoming classes scheduled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Schedule New Class</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Select Course</label>
                <select 
                  required
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
                  value={newSession.courseId}
                  onChange={(e) => setNewSession({...newSession, courseId: e.target.value})}
                >
                  <option value="">Choose a course...</option>
                  {teacherCourses.map((course: any) => (
                    <option key={course.id} value={course.id}>{course.title} ({course.level})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Session Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Weekly Conversation Practice"
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
                  value={newSession.title}
                  onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
                  rows={2}
                  value={newSession.description}
                  onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input 
                    required
                    type="datetime-local" 
                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input 
                    required
                    type="datetime-local" 
                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={scheduleMutation.isPending}
                  className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {scheduleMutation.isPending ? "Scheduling..." : "Schedule Class Session"}
                </button>
              </div>
              
              <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest">
                Class will be hosted via integrated Jitsi platform
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
