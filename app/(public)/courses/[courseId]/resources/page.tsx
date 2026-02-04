"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export default function CourseResourcesPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources", courseId, search],
    queryFn: async () => {
      const res = await axios.get(`/courses/${courseId}/resources`);
      return res.data.data; // Added .data because of successResponse wrapper
    },
    enabled: !!courseId,
  });

  const handleAction = async (resourceId: string, action: "view" | "download") => {
    try {
      await axios.patch(`/courses/${courseId}/resources`, {
        id: resourceId,
        action,
      });
      refetch();
    } catch (err) {
      console.error("Failed to track action:", err);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden transition-colors duration-200">
      {/* ...existing code... */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative transition-colors duration-200">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            {/* ...existing code for header, filters, etc... */}
            {/* Resource Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-12">
              {isLoading && <div>Loading resources...</div>}
              {error && (
                <div className="text-red-500">Failed to load resources</div>
              )}
              {data && Array.isArray(data) && data.length === 0 && (
                <div className="col-span-3 text-center text-slate-500">
                  No resources found.
                </div>
              )}
              {data &&
                Array.isArray(data) &&
                data.map((resource: any) => (
                  <div
                    key={resource.id}
                    className="group bg-white dark:bg-[#151b2b] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`size-12 rounded-lg flex items-center justify-center ${
                          resource.type === "pdf"
                            ? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
                            : resource.type === "video"
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400"
                            : resource.type === "audio"
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[28px]">
                          {resource.type === "pdf"
                            ? "picture_as_pdf"
                            : resource.type === "video"
                            ? "play_circle"
                            : resource.type === "audio"
                            ? "headphones"
                            : resource.type === "link"
                            ? "link"
                            : "description"}
                        </span>
                      </div>
                      {/* ...actions like edit/delete can go here... */}
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {resource.description}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <div className="flex flex-col gap-1">
                          <span>
                            {resource.createdAt
                              ? new Date(resource.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">history</span>
                            v{resource.version ?? 1}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">download</span>
                            {resource.downloadCount ?? 0} Downloads
                          </span>
                        </div>
                        <span>
                          {resource.fileSize
                            ? `${(resource.fileSize / 1024 / 1024).toFixed(
                                2
                              )} MB`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[14px]">
                            analytics
                          </span>
                          {resource.viewCount ?? 0} Views
                        </span>
                        <div className="flex gap-1">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleAction(resource.id, "view")}
                            className="size-8 flex items-center justify-center rounded-full text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Preview"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              visibility
                            </span>
                          </a>
                          <a
                            href={resource.url}
                            download
                            onClick={() => handleAction(resource.id, "download")}
                            className="size-8 flex items-center justify-center rounded-full text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Download"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              download
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
      {/* ...existing code... */}
    </div>
  );
}
