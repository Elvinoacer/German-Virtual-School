"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";

interface CalendarData {
  enrollmentStartDate: string | null;
  enrollmentEndDate: string | null;
  orientationDate: string | null;
  firstClassDate: string | null;
  lastClassDate: string | null;
  isEnrollmentOpen: boolean;
  enrollmentMessage: string;
}

interface CalendarEventProps {
  icon: string;
  label: string;
  date: string | null;
  isPast?: boolean;
  isHighlighted?: boolean;
}

function CalendarEvent({ icon, label, date, isPast, isHighlighted }: CalendarEventProps) {
  if (!date) return null;
  
  const dateObj = new Date(date);
  const formattedDate = format(dateObj, "EEE, MMM d, yyyy");
  const isToday = new Date().toDateString() === dateObj.toDateString();
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      isToday ? "bg-primary/10 border border-primary/20" :
      isHighlighted ? "bg-blue-50 dark:bg-blue-900/10" :
      isPast ? "opacity-60" : ""
    }`}>
      <div className={`size-10 rounded-xl flex items-center justify-center ${
        isToday ? "bg-primary text-white" :
        isPast ? "bg-slate-100 dark:bg-slate-800 text-slate-400" :
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
      }`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`font-bold ${isToday ? "text-primary" : "text-slate-900 dark:text-white"}`}>
          {formattedDate}
          {isToday && <span className="ml-2 text-xs font-bold text-primary">(Today)</span>}
        </p>
      </div>
      {isPast && (
        <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
      )}
    </div>
  );
}

export default function SchoolCalendarCard() {
  const { data: calendar, isLoading } = useQuery<CalendarData>({
    queryKey: ['school-calendar'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/school/calendar');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!calendar) return null;

  const now = new Date();
  const hasAnyDates = calendar.enrollmentStartDate || calendar.enrollmentEndDate || 
                      calendar.orientationDate || calendar.firstClassDate || calendar.lastClassDate;

  if (!hasAnyDates) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary text-2xl">calendar_month</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">School Calendar</h3>
        </div>
        <p className="text-slate-500 text-sm italic">No calendar dates have been set yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">calendar_month</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">School Calendar</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          calendar.isEnrollmentOpen 
            ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
            : "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
        }`}>
          {calendar.isEnrollmentOpen ? "Enrollment Open" : "Enrollment Closed"}
        </div>
      </div>

      <div className="space-y-2">
        <CalendarEvent
          icon="edit_calendar"
          label="Enrollment Opens"
          date={calendar.enrollmentStartDate}
          isPast={calendar.enrollmentStartDate ? new Date(calendar.enrollmentStartDate) < now : false}
        />
        <CalendarEvent
          icon="event_busy"
          label="Enrollment Closes"
          date={calendar.enrollmentEndDate}
          isPast={calendar.enrollmentEndDate ? new Date(calendar.enrollmentEndDate) < now : false}
        />
        <CalendarEvent
          icon="groups"
          label="Orientation Day"
          date={calendar.orientationDate}
          isPast={calendar.orientationDate ? new Date(calendar.orientationDate) < now : false}
          isHighlighted
        />
        <CalendarEvent
          icon="school"
          label="Classes Begin"
          date={calendar.firstClassDate}
          isPast={calendar.firstClassDate ? new Date(calendar.firstClassDate) < now : false}
          isHighlighted
        />
        <CalendarEvent
          icon="celebration"
          label="Classes End"
          date={calendar.lastClassDate}
          isPast={calendar.lastClassDate ? new Date(calendar.lastClassDate) < now : false}
        />
      </div>
    </div>
  );
}
