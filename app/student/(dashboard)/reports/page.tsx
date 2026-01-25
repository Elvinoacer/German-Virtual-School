"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface StudentReportsData {
  attendance: {
    percentage: number;
    present: number;
    late: number;
    absent: number;
    totalDays: number;
  };
  performanceTrend: Array<{
    month: string;
    average: number;
  }>;
  evaluations: Array<{
    id: string;
    subject: string;
    teacher: string;
    grade: string;
    trend: string;
    level: string;
  }>;
  teacherNotes: Array<{
    id: string;
    category: string;
    date: string;
    text: string;
    teacher: string;
    avatar: string;
  }>;
  courses: Array<{
    id: string;
    title: string;
  }>;
}

export default function StudentReportsPage() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  
  const { data, isLoading, isError } = useQuery<StudentReportsData>({
    queryKey: ['student-reports'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/student/reports');
      return response.data.data;
    }
  });

  const handleDownloadReport = () => {
    if (!data || !user) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("German Virtual School", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Student Evaluation Report", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Student: ${user.firstName} ${user.lastName}`, 14, 45);
    doc.text(`Date of Issue: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 50);

    // --- Attendance ---
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Attendance Summary", 14, 65);

    autoTable(doc, {
      startY: 70,
      head: [['Metric', 'Value']],
      body: [
        ['Overall Attendance', `${data.attendance.percentage}%`],
        ['Sessions Attended', `${data.attendance.present}`],
        ['Late Arrivals', `${data.attendance.late}`],
        ['Sessions Missed', `${data.attendance.absent}`],
        ['Total Sessions Tracked', `${data.attendance.totalDays}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
      margin: { left: 14, right: 14 }
    });

    // --- Course Evaluation ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Course Evaluation Details", 14, finalY);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Course', 'Instructor', 'Current Grade', 'Trend']],
      body: data.evaluations.map(e => [
        `${e.subject} (${e.level})`, 
        e.teacher, 
        e.grade === 'N/A' ? 'Pending' : e.grade, 
        e.trend === 'up' ? 'Improving' : e.trend === 'down' ? 'Declining' : 'Stable'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] }
    });

    // --- Performance Trend (Text Summary) ---
    const finalY2 = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Historical Performance Trend", 14, finalY2);
    
    autoTable(doc, {
      startY: finalY2 + 5,
      head: [['Month', 'Average Grade (%)']],
      body: data.performanceTrend.map(pt => [pt.month, pt.average.toString()]),
      theme: 'plain',
      styles: { fontSize: 10 }
    });

    // --- Teacher Notes ---
    const finalY3 = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Instructor Feedback & Observations", 14, finalY3);

    let currentY = finalY3 + 10;
    
    data.teacherNotes.forEach(note => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${note.category} Check - ${format(parseISO(note.date), 'MMM dd')}`, 14, currentY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(`"${note.text}"`, pageWidth - 28);
      doc.text(splitText, 14, currentY + 5);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`- Instructor: ${note.teacher}`, 14, currentY + 5 + (splitText.length * 5) + 5);
      
      currentY += 20 + (splitText.length * 5);
    });

    // Save
    doc.save(`GVS_Report_${user.firstName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
        <p>Failed to load reports data. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { attendance, performanceTrend, evaluations, teacherNotes, courses } = data;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col antialiased transition-colors duration-200">
      {/* Top Header Section */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-center md:text-left">
          <div className="flex flex-col gap-3 max-w-2xl">
            <h1 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Academic Progress
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
              Your comprehensive tracking dashboard for attendance, evaluations, and historical performance.
            </p>
          </div>
          <button 
            onClick={handleDownloadReport}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 mx-auto md:mx-0"
          >
            <span className="material-symbols-outlined text-[20px]">
              file_download
            </span>
            GET FORMAL REPORT (PDF)
          </button>
        </div>  

        {/* Top Stats Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Attendance Card */}
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-9xl">analytics</span>
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Live Attendance
              </h3>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
                attendance.percentage >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                attendance.percentage >= 75 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                'bg-red-100 text-red-700 dark:bg-red-900/30'
              }`}>
                {attendance.percentage}% AVG
              </span>
            </div>
            {/* Circular Progress & Legend */}
            <div className="flex flex-col sm:flex-row items-center gap-10 relative z-10">
              <div className="relative size-36 shrink-0">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className={`${
                      attendance.percentage >= 90 ? 'text-green-500' :
                      attendance.percentage >= 75 ? 'text-yellow-500' :
                      'text-red-500'
                    } transition-all duration-1000 ease-out`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${attendance.percentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {attendance.present}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                    Sessions
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4 flex-1 w-full">
                <LegendItem color="bg-green-500" label="Present" value={attendance.present} />
                <LegendItem color="bg-yellow-500" label="Late Arrivals" value={attendance.late} />
                <LegendItem color="bg-red-500" label="Absences" value={attendance.absent} />
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Total Tracked</p>
                   <p className="text-lg font-black">{attendance.totalDays} Classes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <span className="material-symbols-outlined text-9xl">query_stats</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4 relative z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Performance Trend
                </h3>
                <p className="text-sm font-medium text-slate-500">
                   Monthly academic average across all courses
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                 <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase whitespace-nowrap">Filter by</span>
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-black rounded-xl px-4 py-2.5 text-slate-900 dark:text-white cursor-pointer shadow-sm focus:ring-2 ring-primary/20 transition-all flex-1 sm:flex-none"
                >
                  <option>All Subjects</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex-1 w-full relative min-h-[220px] flex items-end justify-between px-2 pb-8 gap-4 sm:gap-8 relative z-10">
               {/* Background Grid Lines */}
               <div className="absolute inset-x-0 top-0 h-px bg-slate-100 dark:bg-slate-800/50"></div>
               <div className="absolute inset-x-0 bottom-[32px] h-px bg-slate-100 dark:bg-slate-800/50"></div>
               <div className="absolute inset-x-0 top-1/2 -translate-y-[16px] h-px bg-slate-100 dark:bg-slate-800/50"></div>

               {performanceTrend.length > 0 ? performanceTrend.map((item, index) => {
                const heightPercent = Math.min(100, Math.max(5, item.average));
                const isZero = item.average === 0;

                return (
                  <div key={index} className="flex flex-col items-center gap-4 flex-1 group/bar h-full justify-end">
                    <div className="relative w-full max-w-[48px] h-full flex items-end">
                      <div 
                        className={`w-full ${isZero ? 'bg-slate-100 dark:bg-slate-800' : 'bg-primary/20 dark:bg-primary/30'} rounded-2xl group-hover/bar:bg-primary transition-all duration-500 relative cursor-pointer group-hover/bar:shadow-lg group-hover/bar:shadow-primary/30`}
                        style={{ height: `${heightPercent}%` }}
                      >
                         {!isZero && (
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-xl translate-y-2 group-hover/bar:translate-y-0">
                             {item.average}% SCORE
                           </div>
                         )}
                      </div>
                    </div>
                    <span className={`text-[11px] font-black tracking-widest uppercase ${isZero ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500'}`}>
                      {item.month}
                    </span>
                  </div>
                );
              }) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 italic">
                   <p className="text-sm">Not enough data to calculate trend yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Course Evaluation & Teacher Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main List */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                 Course Evaluation
               </h3>
               <Link href="/student/grades" className="text-xs font-black text-primary hover:underline tracking-widest uppercase">Detailed View →</Link>
            </div>
            
            <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                      <th className="px-8 py-6">Course Details</th>
                      <th className="px-8 py-6">Instructor</th>
                      <th className="px-8 py-6">Avg Grade</th>
                      <th className="px-8 py-6">Trend</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {evaluations.length > 0 ? evaluations.map((evaluation) => (
                      <tr key={evaluation.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-primary mb-0.5 tracking-widest uppercase">{evaluation.level}</span>
                              <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{evaluation.subject}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{evaluation.teacher}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-xl font-black text-xs ${
                            evaluation.grade === 'N/A' ? 'bg-slate-100 text-slate-400' :
                            Number(evaluation.grade) >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                            Number(evaluation.grade) >= 60 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}>
                            {evaluation.grade === 'N/A' ? 'PENDING' : `${evaluation.grade}%`}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             {evaluation.trend === 'up' && (
                               <div className="flex items-center gap-1.5 text-emerald-500">
                                  <span className="material-symbols-outlined filled text-[20px]">trending_up</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">Rising</span>
                               </div>
                             )}
                             {evaluation.trend === 'down' && (
                               <div className="flex items-center gap-1.5 text-red-500">
                                  <span className="material-symbols-outlined filled text-[20px]">trending_down</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">Declining</span>
                               </div>
                             )}
                             {evaluation.trend === 'flat' && (
                               <div className="flex items-center gap-1.5 text-slate-400">
                                  <span className="material-symbols-outlined filled text-[20px]">trending_flat</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">Stable</span>
                               </div>
                             )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link
                            href={evaluation.grade === 'N/A' ? '#' : `/student/evaluations/${evaluation.id}`}
                            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                               evaluation.grade === 'N/A' 
                               ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                               : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'
                            }`}
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic font-medium">
                           No evaluations recorded yet for active courses.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Teacher Feedback Column */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white px-2">
              Instructor Notes
            </h3>
            <div className="flex flex-col gap-4">
              {teacherNotes.length > 0 ? teacherNotes.map((note) => (
                <div key={note.id} className="bg-white dark:bg-surface-dark p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none flex flex-col gap-5 hover:border-primary/30 transition-all cursor-default group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                      {note.category}
                    </span>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      {format(parseISO(note.date), 'MMM dd')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "{note.text}"
                  </p>
                  <div className="flex items-center gap-4 mt-2 pt-5 border-t border-slate-50 dark:border-slate-800">
                    <div
                      className="size-10 rounded-full bg-cover bg-center border-2 border-slate-100 dark:border-slate-800 bg-slate-100"
                      style={{ backgroundImage: note.avatar ? `url('${note.avatar}')` : undefined }}
                    >
                       {!note.avatar && <span className="flex items-center justify-center h-full text-slate-400 text-xs font-black">{note.teacher.charAt(0)}</span>}
                    </div>
                    <div className="flex flex-col">
                       <p className="text-xs font-black text-slate-900 dark:text-white">
                         {note.teacher}
                       </p>
                       <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Lead Instructor</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 py-16 px-8 text-center flex flex-col items-center justify-center">
                   <div className="size-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-300">
                      <span className="material-symbols-outlined text-3xl">mark_chat_unread</span>
                   </div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No new feedback</p>
                   <p className="text-xs text-slate-500 mt-1 font-medium italic leading-relaxed">Instructor observations from evaluations will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <span className={`size-2.5 rounded-full ${color}`}></span>
        <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          {label}
        </span>
      </div>
      <span className="font-black text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}
