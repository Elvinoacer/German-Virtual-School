"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CreateNewForumThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("PUBLIC");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [courseId, setCourseId] = useState("");

  const { data: sessionData } = useSession(); // Ensure session is used for role check

  const createThreadMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      audience: string;
      isAnonymous: boolean;
      courseId?: string;
    }) => {
      const res = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create thread");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Thread created successfully!");
      router.push(`/forum`);
    },
    onError: (error) => {
      toast.error(`Error: ${(error as Error).message}`);
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in the title and content.");
      return;
    }
    createThreadMutation.mutate({
      title,
      content,
      audience,
      isAnonymous,
      courseId: audience === "COURSE_ONLY" ? courseId : undefined,
    });
  };

  // Helper to fetch courses based on role
  // Basic inline implementation for now
  const { data: availableCourses } = useQuery({
    queryKey: ["my-courses", sessionData?.user?.role],
    enabled: !!sessionData?.user,
    queryFn: async () => {
      if (sessionData?.user?.role === "TEACHER") {
        const res = await fetch(`/api/courses?status=ALL&teacherId=${sessionData.user.id}`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.data.data as { id: string; title: string }[];
      } else if (sessionData?.user?.role === "ADMIN") {
        const res = await fetch("/api/courses?status=ALL");
        if (!res.ok) return [];
        const json = await res.json();
        return json.data.data as { id: string; title: string }[];
      } else if (sessionData?.user?.role === "STUDENT") {
        const res = await fetch("/api/enrollments/me");
        if (!res.ok) return [];
        const json = await res.json();
        // Format enrollment to simple course object
        return (json.data.enrollments as any[]).map((e) => ({
          id: e.courseId,
          title: e.course.title,
        }));
      }
      return [];
    },
  });

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden transition-colors duration-200 min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark px-4 md:px-10 py-3 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="size-8 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined !text-3xl">school</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            German Virtual School
          </h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <Link
              className="text-slate-900 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal"
              href="/student/dashboard"
            >
              Home
            </Link>
            <Link
              className="text-primary text-sm font-medium leading-normal"
              href="/forum"
            >
              Forum
            </Link>
          </div>
        </div>
      </header>

      <main className="layout-container flex h-full grow flex-col min-h-screen">
        <div className="flex flex-1 justify-center py-5 px-4 md:px-10">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 p-4 items-center">
              <Link
                className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal hover:underline"
                href="/student/dashboard"
              >
                Home
              </Link>
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">
                chevron_right
              </span>
              <Link
                className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal hover:underline"
                href="/forum"
              >
                Forum
              </Link>
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">
                chevron_right
              </span>
              <span className="text-slate-900 dark:text-white text-sm font-medium leading-normal">
                Create Thread
              </span>
            </div>
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 px-4 pt-2 pb-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  Start New Discussion
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                  Create a thread to ask questions, share resources, or start a
                  topic.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
              {/* Left Column: Main Form */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Title Field */}
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
                  <label className="flex flex-col w-full">
                    <span className="text-slate-900 dark:text-white text-base font-semibold leading-normal pb-2">
                      Thread Title
                    </span>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={createThreadMutation.isPending}
                      className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-600 bg-background-light dark:bg-slate-800 h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 text-base font-normal transition-all disabled:opacity-50"
                      placeholder="Briefly summarize your question or topic..."
                    />
                  </label>
                </div>
                {/* Content Field */}
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200">
                  <label className="text-slate-900 dark:text-white text-base font-semibold leading-normal pb-2">
                    Message
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={createThreadMutation.isPending}
                    className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-0 bg-transparent min-h-[200px] placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2 text-base font-normal leading-relaxed disabled:opacity-50"
                    placeholder="Write your question or discussion point here..."
                  ></textarea>
                </div>

                {/* Anonymity Toggle */}
                <div
                  className={`bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border transition-all duration-300 ${
                    isAnonymous
                      ? "border-primary/50 bg-primary/5 shadow-md"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex flex-col">
                      <span
                        className={`text-base font-semibold transition-colors duration-300 ${
                          isAnonymous
                            ? "text-primary"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        Post Anonymously
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        Your name will be hidden from other students and
                        teachers.
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        disabled={createThreadMutation.isPending}
                      />
                      <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none ring-offset-2 ring-transparent peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </div>
                  </label>
                </div>

                {/* Audience Selector */}
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
                  <h3 className="text-slate-900 dark:text-white text-base font-semibold leading-normal pb-4">
                    Who can see this?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option 1 */}
                    <label className="cursor-pointer group relative">
                      <input
                        className="peer sr-only"
                        name="audience"
                        type="radio"
                        value="PUBLIC"
                        checked={audience === "PUBLIC"}
                        onChange={(e) => setAudience(e.target.value)}
                        disabled={createThreadMutation.isPending}
                      />
                      <div
                        className="flex flex-col items-center p-4 rounded-xl border-2 bg-background-light dark:bg-slate-800 transition-all h-full text-center relative
                        border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 
                        peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-md"
                      >
                        {audience === "PUBLIC" && (
                          <div className="absolute top-2 right-2 flex items-center justify-center size-5 bg-primary text-white rounded-full scale-110 shadow-sm animate-in zoom-in-50 duration-300">
                            <span className="material-symbols-outlined text-[14px]">
                              check
                            </span>
                          </div>
                        )}
                        <div
                          className={`p-2 rounded-full mb-3 shadow-sm transition-colors ${
                            audience === "PUBLIC"
                              ? "bg-primary text-white"
                              : "bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 group-hover:text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            public
                          </span>
                        </div>
                        <p
                          className={`font-semibold text-sm mb-1 transition-colors ${
                            audience === "PUBLIC"
                              ? "text-primary"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          Public
                        </p>
                      </div>
                    </label>
                    {/* Option 2 */}
                    <label className="cursor-pointer group relative">
                      <input
                        className="peer sr-only"
                        name="audience"
                        type="radio"
                        value="TEACHERS_ONLY"
                        checked={audience === "TEACHERS_ONLY"}
                        onChange={(e) => setAudience(e.target.value)}
                        disabled={createThreadMutation.isPending}
                      />
                      <div
                        className="flex flex-col items-center p-4 rounded-xl border-2 bg-background-light dark:bg-slate-800 transition-all h-full text-center relative
                        border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 
                        peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-md"
                      >
                        {audience === "TEACHERS_ONLY" && (
                          <div className="absolute top-2 right-2 flex items-center justify-center size-5 bg-primary text-white rounded-full scale-110 shadow-sm animate-in zoom-in-50 duration-300">
                            <span className="material-symbols-outlined text-[14px]">
                              check
                            </span>
                          </div>
                        )}
                        <div
                          className={`p-2 rounded-full mb-3 shadow-sm transition-colors ${
                            audience === "TEACHERS_ONLY"
                              ? "bg-primary text-white"
                              : "bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 group-hover:text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            school
                          </span>
                        </div>
                        <p
                          className={`font-semibold text-sm mb-1 transition-colors ${
                            audience === "TEACHERS_ONLY"
                              ? "text-primary"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          Teachers Only
                        </p>
                      </div>
                    </label>
                    {/* Option 3 */}
                    <label className="cursor-pointer group relative">
                      <input
                        className="peer sr-only"
                        name="audience"
                        type="radio"
                        value="COURSE_ONLY"
                        checked={audience === "COURSE_ONLY"}
                        onChange={(e) => setAudience(e.target.value)}
                        disabled={createThreadMutation.isPending}
                      />
                      <div
                        className="flex flex-col items-center p-4 rounded-xl border-2 bg-background-light dark:bg-slate-800 transition-all h-full text-center relative
                        border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 
                        peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-md"
                      >
                        {audience === "COURSE_ONLY" && (
                          <div className="absolute top-2 right-2 flex items-center justify-center size-5 bg-primary text-white rounded-full scale-110 shadow-sm animate-in zoom-in-50 duration-300">
                            <span className="material-symbols-outlined text-[14px]">
                              check
                            </span>
                          </div>
                        )}
                        <div
                          className={`p-2 rounded-full mb-3 shadow-sm transition-colors ${
                            audience === "COURSE_ONLY"
                              ? "bg-primary text-white"
                              : "bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 group-hover:text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            groups
                          </span>
                        </div>
                        <p
                          className={`font-semibold text-sm mb-1 transition-colors ${
                            audience === "COURSE_ONLY"
                              ? "text-primary"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          Courses Only
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                {/* Course Selector (Conditional) */}
                {audience === "COURSE_ONLY" && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
                    <label className="flex flex-col w-full">
                      <span className="text-slate-900 dark:text-white text-base font-semibold leading-normal pb-2">
                        Select a Course
                      </span>
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        disabled={createThreadMutation.isPending}
                        className="form-select flex w-full rounded-lg text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 bg-background-light dark:bg-slate-800 h-12 px-4 text-base font-normal transition-all disabled:opacity-50"
                      >
                        <option value="">-- Select Course --</option>
                        {availableCourses?.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        This thread will only be visible to participants of this
                        course.
                      </p>
                    </label>
                  </div>
                )}

                {/* Submit */}
                <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-4">
                  <div className="flex gap-4 w-full md:w-auto">
                    <button
                      onClick={() => router.back()}
                      className="flex-1 md:flex-none h-10 px-6 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={createThreadMutation.isPending}
                      className="flex-1 md:flex-none h-10 px-6 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                      {createThreadMutation.isPending && (
                        <span className="material-symbols-outlined animate-spin text-xl">
                          progress_activity
                        </span>
                      )}
                      <span>
                        {createThreadMutation.isPending
                          ? "Publishing..."
                          : "Publish Thread"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Right Column: Sidebar */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Guidelines Card */}
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24 transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      lightbulb
                    </span>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                      Posting Guidelines
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="min-w-6 pt-0.5">
                        <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          1
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Check for duplicates
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Search the forum before you post.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="min-w-6 pt-0.5">
                        <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          2
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Be descriptive
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Clear titles help you get better answers faster.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
