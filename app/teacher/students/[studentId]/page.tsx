"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button, Input } from "@/components/ui";

interface studentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  image: string;
  isVerified: boolean;
  createdAt: string;
  currentTeacherId: string;
  studentProfile: {
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
    emergencyContact: string;
  } | null;
  enrollments: any[];
  receivedNotes: any[];
}

export default function TeacherStudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  
  // Form State for Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Form State for Notes
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("General");

  const { data: student, isLoading } = useQuery<studentData>({
    queryKey: ["student-full-detail", studentId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/teacher/students/${studentId}`);
      const data = res.data.data;
      
      // sync local state for editing (only editable fields)
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      if (data.studentProfile) {
        setDob(data.studentProfile.dateOfBirth ? data.studentProfile.dateOfBirth.split('T')[0] : "");
        setPhone(data.studentProfile.phoneNumber || "");
        setAddress(data.studentProfile.address || "");
        setEmergencyContact(data.studentProfile.emergencyContact || "");
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 mins
  });

  // Current session/user info would be ideal here to filter enrollments, 
  // but we can also rely on the teacherId in the course object.
  // We'll filter this in the render to be safe.

  const { data: evaluations } = useQuery({
    queryKey: ["student-evaluations", studentId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/teacher/evaluations?studentId=${studentId}`);
      return res.data.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.patch(`/teacher/students/${studentId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-full-detail", studentId] });
      setIsEditModalOpen(false);
      toast.success("Student profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const noteMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingNote) {
        return axiosInstance.patch(`/teacher/notes/${editingNote.id}`, data);
      }
      return axiosInstance.post(`/teacher/students/${studentId}/notes`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-full-detail", studentId] });
      setIsNoteModalOpen(false);
      setEditingNote(null);
      setNoteContent("");
      toast.success(editingNote ? "Note updated" : "Note added");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await axiosInstance.delete(`/teacher/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-full-detail", studentId] });
      toast.success("Note deleted");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      firstName,
      lastName,
      studentProfile: {
        dateOfBirth: dob,
        phoneNumber: phone,
        address,
        emergencyContact,
      }
    });
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    noteMutation.mutate({ content: noteContent, category: noteCategory });
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-500">
      {/* Header with quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-4 md:gap-6">
           <div 
             className="size-16 md:size-24 rounded-3xl bg-cover bg-center ring-4 ring-white dark:ring-slate-800 shadow-xl shrink-0"
             style={{ backgroundImage: `url('${student?.avatarUrl || student?.image || "https://ui-avatars.com/api/?name=" + student?.firstName + "+" + student?.lastName}')` }}
           ></div>
           <div>
             <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
               {student?.firstName} {student?.lastName}
               {student?.isVerified ? (
                 <span className="material-symbols-outlined text-green-500 text-xl" title="Verified">verified</span>
               ) : (
                 <span className="material-symbols-outlined text-amber-500 text-xl" title="Pending Verification">hourglass_empty</span>
               )}
             </h1>
             <p className="text-slate-500 font-medium">{student?.email}</p>
             <div className="flex gap-2 mt-3">
               <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">Student</span>
               <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none flex items-center">#{student?.id.slice(0,8)}</span>
             </div>
           </div>
        </div>
        <div className="flex gap-3">
           <Button 
             variant="outline" 
             onClick={() => setIsEditModalOpen(true)}
             className="flex items-center gap-2 font-bold"
           >
             <span className="material-symbols-outlined text-[18px]">edit</span>
             Edit Profile
           </Button>
           <Link 
             href={`/messages?userId=${studentId}`}
             className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
           >
             <span className="material-symbols-outlined text-[18px]">chat</span>
             Send Message
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* Active Enrollments */}
          <section>
            <h2 className="text-xl font-black flex items-center gap-3 mb-6">
              <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
              </div>
              Active Enrollments
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
               {student?.enrollments
                 ?.filter((e: any) => e.course.teacherId === student.currentTeacherId)
                 ?.map((enrollment: any) => (
                  <div key={enrollment.id} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-primary/5 dark:bg-primary/20 flex items-center justify-center text-primary font-black uppercase">
                        {enrollment.course.level}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{enrollment.course.title}</h3>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status: {enrollment.status}</p>
                     </div>
                   </div>
                   <div className="flex gap-3">
                      <Link 
                        href={`/teacher/students/${studentId}/evaluate/${enrollment.courseId}`}
                        className="px-5 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                      >
                        <span className="material-symbols-outlined text-[16px]">assessment</span>
                        Evaluate
                      </Link>
                   </div>
                 </div>
               ))}
               {(!student?.enrollments || student.enrollments.length === 0) && (
                 <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium italic">No active enrollments found.</p>
                 </div>
               )}
            </div>
          </section>

          {/* Evaluation History */}
          <section>
            <h2 className="text-xl font-black flex items-center gap-3 mb-6">
              <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">history</span>
              </div>
              Academic Performance
            </h2>

            <div className="space-y-4">
              {evaluations?.map((evaluation: any) => (
                <div key={evaluation.id} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/40 group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white">{evaluation.course.title}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">
                        {evaluation.term} • {format(new Date(evaluation.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-black text-primary">
                         {Math.round((evaluation.attendanceScore + evaluation.participationScore + evaluation.assignmentScore + evaluation.languageProficiency) / 4)}%
                       </span>
                       <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Average Score</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                     <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-transparent transition-colors group-hover:border-slate-200 dark:group-hover:border-slate-800">
                       <p className="text-[9px] uppercase font-black text-slate-400 mb-2">Attendance</p>
                       <p className="text-lg font-black text-slate-700 dark:text-slate-200">{evaluation.attendanceScore}%</p>
                     </div>
                     <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-transparent transition-colors group-hover:border-slate-200 dark:group-hover:border-slate-800">
                       <p className="text-[9px] uppercase font-black text-slate-400 mb-2">Participation</p>
                       <p className="text-lg font-black text-slate-700 dark:text-slate-200">{evaluation.participationScore}%</p>
                     </div>
                     <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-transparent transition-colors group-hover:border-slate-200 dark:group-hover:border-slate-800">
                       <p className="text-[9px] uppercase font-black text-slate-400 mb-2">Assignments</p>
                       <p className="text-lg font-black text-slate-700 dark:text-slate-200">{evaluation.assignmentScore}%</p>
                     </div>
                     <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-transparent transition-colors group-hover:border-slate-200 dark:group-hover:border-slate-800">
                       <p className="text-[9px] uppercase font-black text-slate-400 mb-2">Proficiency</p>
                       <p className="text-lg font-black text-slate-700 dark:text-slate-200">{evaluation.languageProficiency}%</p>
                     </div>
                  </div>
                  {evaluation.overallComment && (
                    <div className="p-4 bg-primary/5 dark:bg-primary/20 rounded-xl relative italic text-slate-600 dark:text-slate-300 text-sm">
                      <span className="material-symbols-outlined absolute -left-2 -top-2 text-primary opacity-20 text-3xl">format_quote</span>
                      {evaluation.overallComment}
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Link 
                      href={`/student/evaluations/${evaluation.id}`}
                      target="_blank"
                      className="px-4 py-1.5 rounded-lg text-primary text-[11px] font-black uppercase tracking-wider bg-primary/10 hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                      View Full Report
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </Link>
                  </div>
                </div>
              ))}
              {(!evaluations || evaluations.length === 0) && (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 font-medium italic">No evaluations submitted yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Info & Notes */}
        <div className="space-y-8">
           {/* Detailed Profile Info */}
           <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                <span className="material-symbols-outlined text-slate-100 dark:text-slate-800 text-7xl select-none">badge</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 relative">Student Profile</h3>
              <div className="space-y-4 relative">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date of Birth</span>
                    <span className="text-sm font-bold mt-1 text-slate-700 dark:text-slate-200">
                      {student?.studentProfile?.dateOfBirth ? format(new Date(student.studentProfile.dateOfBirth), "MMMM d, yyyy") : "Not Set"}
                    </span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Phone Number</span>
                    <span className="text-sm font-bold mt-1 text-slate-700 dark:text-slate-200">{student?.studentProfile?.phoneNumber || "Not Set"}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Address</span>
                    <span className="text-sm font-bold mt-1 text-slate-700 dark:text-slate-200 line-clamp-2">{student?.studentProfile?.address || "Not Set"}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Emergency Contact</span>
                    <span className="text-sm font-bold mt-1 text-slate-700 dark:text-slate-200">{student?.studentProfile?.emergencyContact || "Not Set"}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Member Since</span>
                    <span className="text-sm font-bold mt-1 text-slate-700 dark:text-slate-200">{student?.createdAt ? format(new Date(student.createdAt), "MMM yyyy") : "N/A"}</span>
                 </div>
              </div>
           </div>

           {/* Teacher Notes Section */}
           <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Professional Notes</h3>
                <button 
                  onClick={() => setIsNoteModalOpen(true)}
                  className="size-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {student?.receivedNotes?.map((note: any) => (
                  <div key={note.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                         {note.category}
                       </span>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingNote(note); setNoteContent(note.content); setNoteCategory(note.category); setIsNoteModalOpen(true); }}
                            className="p-1 text-slate-400 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => { if(confirm("Delete this note?")) deleteNoteMutation.mutate(note.id); }}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                       </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">{note.content}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[9px] font-black text-slate-400">{format(new Date(note.createdAt), "MMM d, h:mm a")}</span>
                      <span className="text-[9px] font-black text-primary uppercase">By {note.teacher.firstName}</span>
                    </div>
                  </div>
                ))}
                {(!student?.receivedNotes || student.receivedNotes.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400 italic">No notes created yet.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-xl bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edit Student Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">First Name</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="First Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Last Name</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Last Name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Birthday</label>
                  <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Phone Number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Emergency Contact</label>
                <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Name and Phone" />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 font-bold" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsNoteModalOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-lg bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{editingNote ? "Edit Note" : "Add Student Note"}</h2>
              <button onClick={() => { setIsNoteModalOpen(false); setEditingNote(null); setNoteContent(""); }} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleNoteSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Category</label>
                <select 
                  value={noteCategory} 
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="General">General</option>
                  <option value="Academic">Academic</option>
                  <option value="Behavior">Behavior</option>
                  <option value="Progress">Progress</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Note Content</label>
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  placeholder="Share professional insights about the student..."
                  className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
              <Button type="submit" className="w-full py-4 text-base font-black shadow-lg shadow-blue-500/20" disabled={noteMutation.isPending}>
                {noteMutation.isPending ? "Processing..." : editingNote ? "Update Note" : "Publish Note"}
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Material Symbols Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
