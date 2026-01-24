"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface GradingData {
  assignment: {
    id: string;
    title: string;
    dueDate: string;
    maxPoints: number;
    course: {
      id: string;
      title: string;
      level: string;
    };
    rubric?: {
      criteria: { id: string; name: string; maxPoints: number }[];
    } | null;
  };
  students: {
    student: {
      id: string;
      firstName: string;
      lastName: string;
      image: string | null;
      email: string;
    };
    status: string;
    submission: {
      id: string;
      submittedAt: string;
      grade: number | null;
      feedback: string | null;
      content: string | null;
      attachmentUrls: string[];
      rubricScores: Record<string, number> | null;
    } | null;
  }[];
}

export default function AssignmentGradingPage() {
  const { user } = useAuth();
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'students' | 'submission' | 'grading'>('students');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [grade, setGrade] = useState<number | string>("");
  const [feedback, setFeedback] = useState("");
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { data, isLoading, isError } = useQuery<GradingData>({
    queryKey: ['grading', assignmentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/teacher/assignments/${assignmentId}/grading`);
      return response.data.data;
    },
    enabled: !!assignmentId
  });

  // Select first student by default when data loads
  useEffect(() => {
    if (data?.students && data.students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(data.students[0].student.id);
    }
  }, [data, selectedStudentId]);

  // Update form when selected student changes
  useEffect(() => {
    if (selectedStudentId && data) {
      const studentData = data.students.find(s => s.student.id === selectedStudentId);
      if (studentData?.submission) {
        setGrade(studentData.submission.grade ?? "");
        setFeedback(studentData.submission.feedback ?? "");
        setRubricScores((studentData.submission.rubricScores as Record<string, number>) || {});
      } else {
        setGrade("");
        setFeedback("");
        setRubricScores({});
      }
      setSubmitStatus('idle');
    }
  }, [selectedStudentId, data]);

  const submitGradeMutation = useMutation({
    mutationFn: async (payload: { studentId: string, grade: number, feedback: string, rubricScores?: Record<string, number> }) => {
      const response = await axiosInstance.post(`/api/teacher/assignments/${assignmentId}/grading`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', assignmentId] });
      toast.success("Grade published successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Failed to publish grade");
    }
  });

  const handleGradeSubmit = () => {
    if (!selectedStudentId || grade === "") return;
    submitGradeMutation.mutate({
      studentId: selectedStudentId,
      grade: Number(grade),
      feedback,
      rubricScores
    });
  };

  const handleRubricScoreChange = (id: string, score: number) => {
    const newScores = { ...rubricScores, [id]: score };
    setRubricScores(newScores);
    
    // Auto-calculate total
    const total = Object.values(newScores).reduce((sum, val) => sum + val, 0);
    setGrade(total);
  };

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    // On mobile, switch to submission view after selecting
    if (window.innerWidth < 1024) {
      setActiveTab('submission');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-red-500">
        Error loading grading data.
      </div>
    );
  }

  const { assignment, students } = data;
  const selectedStudentData = students.find(s => s.student.id === selectedStudentId);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-screen flex flex-col overflow-hidden text-slate-900 dark:text-slate-200 transition-colors duration-200">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark px-4 md:px-6 py-3 shrink-0 z-20 transition-colors duration-200">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden md:block text-slate-900 dark:text-white">
              Deutsche Virtuelle Schule
            </h2>
          </div>
          {/* Breadcrumbs / Context */}
          <div className="hidden lg:flex items-center text-sm gap-2 text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-6">
            <span>Kurse</span>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
            <span>{assignment.course.title}</span>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              Benotung
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              className="text-sm font-medium hover:text-primary transition-colors text-slate-600 dark:text-slate-300"
              href="/teacher/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="text-sm font-medium hover:text-primary transition-colors text-primary"
              href="/teacher/assignments"
            >
              Assignments
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-white dark:ring-surface-dark shadow-sm"
              style={{
                backgroundImage: user?.image ? `url('${user.image}')` : undefined,
                backgroundColor: '#ccc'
              }}
            >
                {!user?.image && <span className="flex items-center justify-center h-full text-white text-xs font-bold">{user?.firstName?.[0]}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Assignment Header Bar */}
      <div className="bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex flex-wrap justify-between items-center gap-4 shrink-0 shadow-sm z-10 transition-colors duration-200">
        <div className="flex flex-col max-w-[70%]">
          <h1 className="text-lg md:text-xl font-bold leading-tight text-slate-900 dark:text-white truncate">
            {assignment.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">
              calendar_today
            </span>
            Due: {new Date(assignment.dueDate).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/teacher/assignments">
            <button className="flex items-center justify-center gap-2 h-9 px-3 md:px-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              <span className="hidden sm:inline">Back</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark overflow-x-auto">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${
            activeTab === 'students'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          Students List
        </button>
        <button
          onClick={() => setActiveTab('submission')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${
            activeTab === 'submission'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          Submission
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${
            activeTab === 'grading'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          Grading
        </button>
      </div>

      {/* Main Content Area: 3-Pane Layout */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        {/* Left Sidebar: Student List */}
        <aside className={`
          ${activeTab === 'students' ? 'flex w-full' : 'hidden'} 
          lg:flex lg:w-80 
          flex-shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark z-10 transition-colors duration-200
        `}>
          {/* Search & Filter */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 material-symbols-outlined text-[20px]">
                search
              </span>
              <input
                className="w-full bg-background-light dark:bg-background-dark border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary placeholder:text-slate-400/70 dark:placeholder:text-slate-500/70 text-slate-900 dark:text-white transition-colors duration-200"
                placeholder="Search student..."
                type="text"
              />
            </div>
          </div>
          {/* Student List Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {students.map((item) => (
              <div 
                key={item.student.id}
                onClick={() => handleStudentSelect(item.student.id)}
                className={`group flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedStudentId === item.student.id 
                    ? 'bg-primary/5 dark:bg-primary/20 border-primary/20' 
                    : 'hover:bg-background-light dark:hover:bg-background-dark border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {item.student.lastName}, {item.student.firstName}
                  </span>
                  {selectedStudentId === item.student.id && (
                    <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"></div>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.submission ? new Date(item.submission.submittedAt).toLocaleDateString() : '--'}</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    item.status === 'GRADED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    item.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    item.status === 'LATE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Document Viewer */}
        <section className={`
          ${activeTab === 'submission' ? 'flex w-full' : 'hidden'} 
          lg:flex flex-1 
          bg-gray-100 dark:bg-[#0b0f17] flex-col relative overflow-hidden transition-colors duration-200
        `}>
          {selectedStudentData ? (
            <>
              {/* Toolbar */}
              <div className="h-12 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-4 shadow-sm z-10 transition-colors duration-200 shrink-0">
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                  <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-none">
                    Submission: {selectedStudentData.student.firstName} {selectedStudentData.student.lastName}
                  </span>
                </div>
                {/* Mobile: Switch to grading action */}
                <button 
                  onClick={() => setActiveTab('grading')}
                  className="lg:hidden text-primary text-sm font-bold flex items-center gap-1"
                >
                  Grade Now 
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
                <div className="bg-white text-black w-full max-w-[800px] min-h-[400px] md:min-h-[600px] shadow-lg rounded-sm p-6 md:p-12 relative">
                  {selectedStudentData.submission ? (
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold mb-6 font-serif">
                            {assignment.title}
                        </h2>
                        <div className="mb-2 font-serif text-sm md:text-base">
                            <strong>Student:</strong> {selectedStudentData.student.firstName} {selectedStudentData.student.lastName}
                        </div>
                        <div className="mb-8 font-serif text-sm md:text-base">
                            <strong>Submitted:</strong> {new Date(selectedStudentData.submission.submittedAt).toLocaleString()}
                        </div>
                        <div className="prose max-w-none text-sm md:text-base">
                            {selectedStudentData.submission.content ? (
                                <p className="whitespace-pre-wrap">{selectedStudentData.submission.content}</p>
                            ) : (
                                <p className="italic text-gray-500">No text content submitted.</p>
                            )}
                        </div>
                        {selectedStudentData.submission.attachmentUrls && selectedStudentData.submission.attachmentUrls.length > 0 && (
                            <div className="mt-8 pt-4 border-t">
                                <h3 className="font-bold mb-2">Attachments:</h3>
                                <ul className="list-disc pl-5">
                                    {selectedStudentData.submission.attachmentUrls.map((url, idx) => (
                                        <li key={idx}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                Attachment {idx + 1}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                        <span className="material-symbols-outlined text-6xl mb-4">assignment_late</span>
                        <p>No submission found for this student.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 p-6 text-center">
              Select a student from the list to view their submission.
            </div>
          )}
        </section>

        {/* Right Sidebar: Grading Panel */}
        <aside className={`
          ${activeTab === 'grading' ? 'flex w-full' : 'hidden'} 
          lg:flex lg:w-[400px] 
          flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark flex-col z-10 shadow-xl transition-colors duration-200
        `}>
          {/* Grading Header */}
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-surface-light dark:bg-surface-dark">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Grading
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                  Total Score
                </p>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-2xl font-bold text-primary">{grade || '--'}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    / {assignment.maxPoints}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-surface-light dark:bg-surface-dark">
            {/* Feedback Section */}
            <div className="space-y-6">
              {assignment.rubric?.criteria && assignment.rubric.criteria.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-widest">
                    Interactive Rubric
                  </h4>
                  <div className="flex flex-col gap-4">
                    {assignment.rubric.criteria.map((c) => (
                      <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {c.name}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            Max: {c.maxPoints}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="range"
                            min="0"
                            max={c.maxPoints}
                            value={rubricScores[c.id] || 0}
                            onChange={(e) => handleRubricScoreChange(c.id, parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <input 
                            type="number"
                            min="0"
                            max={c.maxPoints}
                            value={rubricScores[c.id] || 0}
                            onChange={(e) => handleRubricScoreChange(c.id, Math.min(c.maxPoints, parseInt(e.target.value) || 0))}
                            className="w-16 h-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Feedback
                </h4>
              <div className="relative">
                <textarea
                  className="w-full h-40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-colors duration-200"
                  placeholder="Enter feedback here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Grade (Points)
                </label>
                <input
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-white transition-colors duration-200"
                  type="number"
                  max={assignment.maxPoints}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
            </div>
          </div>
            {/* Helper text for mobile */}
            <div className="lg:hidden text-xs text-slate-400 italic">
               Tip: Switch back to 'Submission' tab to reference student work while grading.
            </div>
          </div>
          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-background-light/50 dark:bg-background-dark/50 space-y-3">

            <button 
                className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleGradeSubmit}
                disabled={!selectedStudentId || grade === "" || submitGradeMutation.isPending}
            >
              <span className="material-symbols-outlined text-[20px]">
                check_circle
              </span>
              {submitGradeMutation.isPending ? 'Saving...' : 'Publish Grade'}
            </button>
          </div>
        </aside>
      </main>

      {/* Custom Scrollbar for better UX in grading panels */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
