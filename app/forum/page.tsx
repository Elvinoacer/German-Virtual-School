"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  isAnonymous: boolean;
  authorNameHidden?: boolean; // Present if viewer is teacher/admin
  createdAt: string;
  audience: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    role: string;
  };
  _count: {
    posts: number;
  };
}

export default function ForumThreadListPage() {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const [filterAudience, setFilterAudience] = useState<string>("");

  const { data: threads, isLoading } = useQuery({
    queryKey: ['forum-threads', filterAudience],
    queryFn: async () => {
       const res = await axiosInstance.get('/forum/threads', {
         params: { audience: filterAudience || undefined }
       });
       // API returns { success, data: { data: threads[], pagination } }
       return res.data.data?.data as Thread[] || [];
    }
  });

  const regularThreads = threads || [];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-row gap-8">
          <main className="flex-1 min-w-0">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forum</h1>
                <Link href="/forum/new" className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                    New Topic
                </Link>
             </div>

              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar mb-6">
                <select 
                    className="h-10 px-4 bg-background-light dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-primary/20 min-w-[120px] transition-colors duration-200"
                    onChange={(e) => setFilterAudience(e.target.value)}
                    value={filterAudience}
                >
                  <option value="">All Topics</option>
                  <option value="PUBLIC">Public</option>
                  <option value="COURSE_ONLY">My Courses</option>
                  {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                    <option value="TEACHERS_ONLY">Teachers Only</option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-4">
                  {isLoading && <p>Loading...</p>}
                  {!isLoading && regularThreads.length === 0 && <p>No topics found.</p>}
                  {regularThreads.map(thread => (
                     <Link href={`/forum/${thread.id}`} key={thread.id}>
                        <div className={`group flex flex-col sm:flex-row gap-4 p-4 md:p-5 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer ${thread.isLocked ? 'opacity-75 bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    thread.audience === 'TEACHERS_ONLY' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                    thread.audience === 'COURSE_ONLY' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                    {thread.audience === 'PUBLIC' ? 'Public' : thread.audience === 'COURSE_ONLY' ? 'Course' : 'Teacher'}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">
                                    schedule
                                    </span>{" "}
                                     {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                                </span>
                                {thread.isLocked && (
                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">lock</span>
                                        Closed
                                    </span>
                                )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                                {thread.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                                {thread.content}
                                </p>
                            </div>
                            
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-1 min-w-[100px] border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                    {thread.isAnonymous || thread.author.id === 'anonymous' ? (
                                        <>
                                            <span className="text-xs text-slate-900 dark:text-white font-medium italic">
                                                Anonymous
                                            </span>
                                            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-surface-dark">
                                                ?
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-900 dark:text-white font-medium block">
                                                    {thread.author.firstName} {thread.author.lastName[0]}.
                                                </span>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-surface-dark"
                                                 style={thread.author.avatarUrl ? { backgroundImage: `url('${thread.author.avatarUrl}')`, backgroundSize: 'cover' } : {}}
                                            >
                                                {!thread.author.avatarUrl && `${thread.author.firstName[0]}${thread.author.lastName[0]}`}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="text-right">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {thread._count.posts} Replies
                                </div>
                                </div>
                            </div>

                        </div>
                     </Link>
                  ))}
              </div>
          </main>
          
           <aside className="hidden lg:flex w-80 flex-col gap-6 shrink-0">
             <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-blue-600 p-6 text-white shadow-md">
               <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-xl"></div>
               <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
               <h4 className="relative text-lg font-bold mb-2">
                 Need Tutoring?
               </h4>
               <p className="relative text-sm text-blue-100 mb-4">
                 Book a 1-on-1 session today.
               </p>
               <button className="relative w-full py-2 bg-white text-primary font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors">
                 Book Session
               </button>
             </div>
           </aside>
        </div>
      </div>
    </div>
  );
}
