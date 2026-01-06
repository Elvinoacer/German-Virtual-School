"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface Post {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        image: string | null;
        role: string;
    };
}

interface ThreadDetails {
    id: string;
    title: string;
    content: string;
    isLocked: boolean;
    isPinned: boolean;
    createdAt: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        image: string | null;
        role: string;
    };
    posts: Post[];
    course: {
        title: string;
        level: string;
    } | null;
}

export default function ForumThreadDetailsPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  const router = useRouter();
  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false); // New state

  const { data: thread, isLoading, error } = useQuery<ThreadDetails>({
    queryKey: ["forum-thread", threadId],
    queryFn: async () => {
      const res = await fetch(`/api/forum/threads/${threadId}`);
      if (!res.ok) throw new Error("Failed to fetch thread");
      const json = await res.json();
      return json.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (data: { content: string; isAnonymous: boolean }) => {
      const res = await fetch(`/api/forum/threads/${threadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      return res.json();
    },
    onSuccess: () => {
      setReplyContent("");
      setIsAnonymous(false);
      queryClient.invalidateQueries({ queryKey: ["forum-thread", threadId] });
      toast.success("Reply sent!");
    },
    onError: () => {
        toast.error("Error sending reply.");
    }
  });

  const handlePostReply = () => {
      if (!replyContent.trim()) return;
      replyMutation.mutate({ content: replyContent, isAnonymous });
  };

  // Moderation Mutations
  const updateThreadMutation = useMutation({
      mutationFn: async (data: { isLocked?: boolean; isPinned?: boolean }) => {
          const res = await fetch(`/api/forum/threads/${threadId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Failed to update thread');
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["forum-thread", threadId] });
          toast.success("Thread updated");
      }
  });

  const deleteThreadMutation = useMutation({
      mutationFn: async () => {
          const res = await fetch(`/api/forum/threads/${threadId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete thread');
      },
      onSuccess: () => {
          toast.success("Thread deleted");
          router.push('/forum');
      }
  });

  if (isLoading) return <div className="flex justify-center py-20 text-slate-500">Loading thread...</div>;
  if (error || !thread) return <div className="flex justify-center py-20 text-slate-500">Thread not found.</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark px-4 md:px-10 py-3 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            German Virtual School
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-9">
            <Link
              className="text-sm font-medium hover:text-primary transition-colors text-slate-600 dark:text-slate-300"
              href="/courses"
            >
              Courses
            </Link>
            <Link
              className="text-sm font-medium hover:text-primary transition-colors text-slate-600 dark:text-slate-300"
              href="/student/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="text-sm font-medium text-primary"
              href="/forum"
            >
              Forum
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            {user && (
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-slate-100 dark:border-slate-700"
              style={{
                backgroundImage:
                  `url('${user.image || "https://ui-avatars.com/api/?name=" + user.name}')`,
              }}
            ></div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN: Thread Content */}
          <main className="flex-1 w-full lg:w-3/4 flex flex-col gap-6">
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link
                className="hover:text-primary transition-colors"
                href="/student/dashboard"
              >
                Home
              </Link>
              <span>/</span>
              <Link
                className="hover:text-primary transition-colors"
                href="/forum"
              >
                Discussion Forum
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium">
                {thread.title}
              </span>
            </nav>

            {/* Page Header Area */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    {thread.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-[18px]">
                      schedule
                    </span>
                    <span>Started {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              {/* Chips & Moderation Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
                <div className="flex gap-2 flex-wrap">
                  {thread.course && (
                    <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-xs font-bold border border-blue-100 dark:border-blue-900">
                        {thread.course.title}
                    </span>
                  )}
                  {thread.isLocked && (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                        Closed
                    </span>
                  )}
                </div>


                {/* MODERATION TOOLBAR (Teachers/Admins) */}
                {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                    <div className="flex gap-2">
                         <button 
                            onClick={() => updateThreadMutation.mutate({ isLocked: !thread.isLocked })}
                            className={`p-2 rounded-lg border flex items-center gap-2 text-xs font-bold transition-colors ${thread.isLocked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                         >
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                            {thread.isLocked ? 'Unlock' : 'Lock'}
                         </button>
                         <button 
                            onClick={() => updateThreadMutation.mutate({ isPinned: !thread.isPinned })} // Assuming isPinned exists in API/Schema, currently schema has isPinned but UI didn't show it except order.
                            className={`p-2 rounded-lg border flex items-center gap-2 text-xs font-bold transition-colors ${thread.isPinned ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                         >
                            <span className="material-symbols-outlined text-[18px]">push_pin</span>
                            {thread.isPinned ? 'Unpin' : 'Pin'}
                         </button>
                         <button 
                            onClick={() => {
                                if (confirm('Really delete thread?')) deleteThreadMutation.mutate();
                            }}
                            className="p-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 flex items-center gap-2 text-xs font-bold transition-colors"
                         >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Delete
                         </button>
                    </div>
                )}

              </div>
            </div>

            {/* ORIGINAL POST (OP) */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
              <div className="p-4 md:p-6 flex flex-col sm:flex-row gap-6">
                {/* User Info Sidebar */}
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:w-40 shrink-0">
                  <div className="relative">
                    <div
                      className="size-16 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-700 shadow-sm"
                      style={{
                        backgroundImage:
                          `url('${thread.author.image || "https://ui-avatars.com/api/?name=" + thread.author.firstName + "+" + thread.author.lastName}')`,
                      }}
                    ></div>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {thread.author.firstName} {thread.author.lastName}
                    </h3>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {thread.author.role}
                    </div>
                  </div>
                </div>
                {/* Post Content */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-200 font-body whitespace-pre-wrap">
                    {thread.content}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {thread.posts.length} Replies
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>

            {/* REPLIES */}
            {thread.posts.map((post, index) => (
                <div key={post.id} className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ml-0 sm:ml-8 relative transition-colors duration-200">
                {/* Thread line for indentation context */}
                <div className="absolute left-[-20px] top-[-20px] bottom-1/2 w-[20px] border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-xl hidden sm:block"></div>
                <div className="p-4 md:p-5 flex flex-col sm:flex-row gap-5">
                    <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:w-32 shrink-0">
                    <div className="relative">
                        <div
                        className="size-12 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700"
                        style={{
                            backgroundImage:
                            `url('${post.author.image || "https://ui-avatars.com/api/?name=" + post.author.firstName + "+" + post.author.lastName}')`,
                        }}
                        ></div>
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {post.author.firstName} {post.author.lastName}
                        </h3>
                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {post.author.role}
                        </div>
                    </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                    <div className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-200 font-body text-sm whitespace-pre-wrap">
                        {post.content}
                    </div>
                    </div>
                </div>
                <div className="bg-background-light dark:bg-slate-900/50 px-5 py-2 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Reply #{index + 1} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                </div>
                </div>
            ))}

            {/* POST EDITOR */}
            {!thread.isLocked && (
            <div className="mt-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-md transition-colors duration-200">
              <div className="p-4">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y p-0"
                  placeholder="Write your reply here..."
                  rows={6}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                ></textarea>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 rounded-b-xl">
                {/* Anonymity Checkbox */}
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium select-none">Reply anonymously</span>
                 </label>

                <div className="flex gap-3">
                  <button 
                    onClick={handlePostReply}
                    disabled={replyMutation.isPending || !replyContent.trim()}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      send
                    </span>
                    {replyMutation.isPending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            </div>
            )}
          </main>

          {/* RIGHT COLUMN: Sidebar */}
          <aside className="w-full lg:w-1/4 flex flex-col gap-6">
            {/* Topic Info Card */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Topic Info
              </h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Replies
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {thread.posts.length}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
