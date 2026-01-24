"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TeacherAssignmentsData {
  stats: {
    activeAssignments: number;
    pendingGrading: number;
    totalStudents: number;
  };
  assignments: {
    id: string;
    title: string;
    courseName: string;
    dueDate: string;
    status: string;
    submissions: number;
    totalStudents: number;
    progress: number;
    gradedCount: number;
  }[];
  courses: {
    id: string;
    title: string;
  }[];
}

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    dueDate: "",
    description: "",
    maxPoints: 100,
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [resources, setResources] = useState<string[]>([]);
  const [resourceInput, setResourceInput] = useState("");
  const [rubricCriteria, setRubricCriteria] = useState<{ id: string; name: string; maxPoints: number }[]>([]);
  const [rubricInput, setRubricInput] = useState({ name: "", points: 10 });

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string; type: 'image' | 'video' | 'doc' }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, isError } = useQuery<TeacherAssignmentsData>({
    queryKey: ['teacher-assignments'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/teacher/assignments');
      return response.data.data;
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).map(file => {
      let type: 'image' | 'video' | 'doc' = 'doc';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      return {
        file,
        preview: type === 'image' ? URL.createObjectURL(file) : '',
        type
      };
    });

    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const removeSelectedFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const uploadedUrls: string[] = [];
    setIsUploading(true);

    try {
      for (const { file, type } of selectedFiles) {
        if (type === 'image' || type === 'video') {
          // Upload to Cloudinary
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/upload/cloudinary', {
            method: 'POST',
            body: formData,
          });
          const result = await response.json();
          if (result.secure_url) uploadedUrls.push(result.secure_url);
        } else {
          // Upload to Vercel Blob
          const response = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, {
            method: 'POST',
            body: file,
          });
          const result = await response.json();
          if (result.url) uploadedUrls.push(result.url);
        }
      }
      return uploadedUrls;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const createAssignmentMutation = useMutation({
    mutationFn: async (newAssignment: typeof formData) => {
      const uploadToastId = toast.loading("Uploading files and publishing assignment...");
      try {
        const fileUrls = await uploadFiles();
        const payload = {
          ...newAssignment,
          attachmentUrls: [...resources, ...fileUrls],
          rubric: rubricCriteria.length > 0 ? { criteria: rubricCriteria } : undefined
        };
        const response = await axiosInstance.post('/api/assignments', payload);
        toast.success("Assignment published successfully!", { id: uploadToastId });
        return response.data;
      } catch (error: any) {
        toast.error(error.message || "Failed to publish assignment", { id: uploadToastId });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      setFormData({
        title: "",
        courseId: "",
        dueDate: "",
        description: "",
        maxPoints: 100,
      });
      setResources([]);
      setResourceInput("");
      setRubricCriteria([]);
      setRubricInput({ name: "", points: 10 });
      setSelectedFiles([]);
      setFormError("");
    },
    onError: (error: any) => {
      setFormError(error.message || error.response?.data?.error?.message || "Failed to create assignment");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.dueDate) {
      setFormError("Please fill in all required fields");
      return;
    }
    createAssignmentMutation.mutate(formData);
  };

  const { stats, assignments, courses } = data || { stats: { activeAssignments: 0, pendingGrading: 0, totalStudents: 0 }, assignments: [], courses: [] };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200 h-screen flex overflow-hidden">


      {/* Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between transition-colors duration-200">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    Active Assignments
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.activeAssignments}
                  </h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">book</span>
                </div>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between transition-colors duration-200">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    Pending Grading
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.pendingGrading}
                  </h3>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-500">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between transition-colors duration-200">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    Total Students
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.totalStudents}
                  </h3>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-500">
                  <span className="material-symbols-outlined">groups</span>
                </div>
              </div>
            </section>

            {/* Main Dashboard Split */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start">
              {/* Left Column: Create Form (4 cols) */}
              <div className="xl:col-span-5 flex flex-col gap-6">
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
                    {/* Progress Loader Overlay if uploading */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-2"></div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Uploading Assets...</p>
                      </div>
                    )}

                  <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        add_circle
                      </span>
                      Create New Assignment
                    </h3>
                  </div>
                  <form className="p-4 md:p-6 flex flex-col gap-4 md:gap-5" onSubmit={handleSubmit}>
                    {formError && (
                      <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {formError}
                      </div>
                    )}
                    {formSuccess && (
                      <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                        {formSuccess}
                      </div>
                    )}
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Title
                      </label>
                      <input
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-white transition-colors duration-200"
                        placeholder="e.g. Kapitel 3: Verbs Conjugation"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
                    {/* Class & Due Date Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Class
                        </label>
                        <select 
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-white transition-colors duration-200"
                          value={formData.courseId}
                          onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                          required
                        >
                          <option value="">Select Course</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Due Date
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-white text-slate-500 transition-colors duration-200"
                          type="datetime-local"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    {/* Max Points */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Max Points
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-white transition-colors duration-200"
                          type="number"
                          value={formData.maxPoints}
                          onChange={(e) => setFormData({...formData, maxPoints: parseInt(e.target.value)})}
                          required
                        />
                    </div>
                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Instructions
                      </label>
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden transition-colors duration-200">
                        <textarea
                          className="w-full border-none p-3 text-sm focus:ring-0 bg-transparent dark:text-white"
                          placeholder="Enter assignment details here..."
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                      </div>
                    </div>

                    {/* Files & Resources */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Files & Resources
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Cloudinary & Blob
                        </span>
                      </div>
                      
                      {/* File Upload Input */}
                      <div className="relative group">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-6 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                          <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary mb-2 transition-colors">
                            cloud_upload
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                            Tap to upload files
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            Multiple supported
                          </span>
                        </label>
                      </div>

                      {/* URL Resource Input (Legacy Support) */}
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-white transition-colors duration-200"
                          placeholder="Or paste URL..."
                          type="url"
                          value={resourceInput}
                          onChange={(e) => setResourceInput(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (resourceInput) {
                              setResources([...resources, resourceInput]);
                              setResourceInput("");
                            }
                          }}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>

                      {/* Selected Files Previews */}
                      {selectedFiles.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                          {selectedFiles.map((item, idx) => (
                            <div key={idx} className="relative group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm aspect-square flex items-center justify-center">
                              {item.type === 'image' ? (
                                <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                              ) : item.type === 'video' ? (
                                <div className="flex flex-col items-center gap-1 text-amber-500">
                                  <span className="material-symbols-outlined text-3xl">movie</span>
                                  <span className="text-[10px] font-bold">VIDEO</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-primary">
                                  <span className="material-symbols-outlined text-3xl">description</span>
                                  <span className="text-[10px] font-bold">DOC</span>
                                </div>
                              )}
                              
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                <span className="text-white text-[10px] truncate mb-1">
                                  {item.file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSelectedFile(idx)}
                                  className="w-full py-1 bg-red-500 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Resource List (Already uploaded or URLs) */}
                      {resources.length > 0 && (
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Legacy URLs & Assets</p>
                          {resources.map((res, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center gap-2 truncate">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">link</span>
                                <a href={res} target="_blank" rel="noopener noreferrer" className="text-primary truncate max-w-[180px] hover:underline">
                                  {res}
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => setResources(resources.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rubric Criteria (Point-based) */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Grading Criteria (Rubric Points)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-white transition-colors duration-200"
                          placeholder="e.g. Grammar accuracy"
                          type="text"
                          value={rubricInput.name}
                          onChange={(e) => setRubricInput({...rubricInput, name: e.target.value})}
                        />
                        <div className="flex gap-2">
                          <input
                            className="w-24 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary dark:text-white transition-colors duration-200"
                            placeholder="Points"
                            type="number"
                            min="1"
                            value={rubricInput.points}
                            onChange={(e) => setRubricInput({...rubricInput, points: parseInt(e.target.value) || 0})}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (rubricInput.name && rubricInput.points > 0) {
                                setRubricCriteria([...rubricCriteria, { 
                                  id: crypto.randomUUID(), 
                                  name: rubricInput.name, 
                                  maxPoints: rubricInput.points 
                                }]);
                                setRubricInput({ name: "", points: 10 });
                              }
                            }}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      {/* Rubric List */}
                      {rubricCriteria.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                          {rubricCriteria.map((c, idx) => (
                            <div key={c.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{c.name}</span>
                                <span className="text-[10px] text-slate-400">{c.maxPoints} Points</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setRubricCriteria(rubricCriteria.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        className="flex-1 px-4 py-3 rounded-lg bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        type="submit"
                        disabled={createAssignmentMutation.isPending}
                      >
                        {createAssignmentMutation.isPending ? 'Publishing...' : 'Publish Assignment'}
                        <span className="material-symbols-outlined text-[18px]">
                          send
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: List (8 cols) */}
              <div className="xl:col-span-7 flex flex-col gap-6">
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full transition-colors duration-200">
                  {/* Table Header / Filters */}
                  <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      Recent Assignments
                    </h3>
                  </div>
                  {/* Table Content */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg whitespace-nowrap">
                            Assignment Name
                          </th>
                          <th className="px-6 py-4 whitespace-nowrap">Deadline</th>
                          <th className="px-6 py-4 whitespace-nowrap">Status</th>
                          <th className="px-6 py-4 w-48 whitespace-nowrap">Submissions</th>
                          <th className="px-6 py-4 rounded-tr-lg text-right whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                        {assignments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                              No assignments found. Create one to get started!
                            </td>
                          </tr>
                        ) : (
                          assignments.map((assignment) => (
                            <tr key={assignment.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                    {assignment.title}
                                  </span>
                                  <span className="text-xs text-slate-500 whitespace-nowrap">
                                    {assignment.courseName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {new Date(assignment.dueDate).toLocaleDateString()}
                                <br />
                                <span className="text-xs text-slate-400">
                                  {new Date(assignment.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  assignment.status === 'Active' 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/50'
                                }`}>
                                  <span className={`size-1.5 rounded-full ${
                                    assignment.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                                  }`}></span>
                                  {assignment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                                    <span>{assignment.submissions}/{assignment.totalStudents}</span>
                                    <span>{assignment.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                    <div
                                      className="bg-primary h-1.5 rounded-full"
                                      style={{ width: `${assignment.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <Link 
                                  href={`/teacher/assignments/${assignment.id}/grading`}
                                  className="text-primary hover:text-blue-700 transition-colors text-sm font-medium p-2"
                                >
                                  Grade
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      {/* Custom scrollbar styles */}
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
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
