"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";

type Testimonial = {
  id: string;
  content: string;
  rating: number;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
};

export default function AdminFeedbackPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTestimonials = async () => {
    try {
      const { data } = await axios.get("/testimonials");
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleUpdateStatus = async (id: string, updates: Partial<Testimonial>) => {
    try {
        // Optimistic update
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        
        await axios.patch(`/testimonials/${id}`, updates);
        toast.success("Updated successfully");
    } catch (error) {
        console.error(error);
        toast.error("Update failed");
        fetchTestimonials(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this testimonial?")) return;

      try {
          setTestimonials(prev => prev.filter(t => t.id !== id));
          await axios.delete(`/testimonials/${id}`);
          toast.success("Deleted successfully");
      } catch (error) {
          console.error(error);
          toast.error("Delete failed");
          fetchTestimonials();
      }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading feedback...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Student Testimonials
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and feature student feedback on the landing page ({testimonials.filter(t => t.isFeatured).length}/3 featured)
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {testimonials.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500">No testimonials yet.</p>
            </div>
        ) : (
            testimonials.map((testimonial) => (
            <div
                key={testimonial.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center"
            >
                {/* User Info */}
                <div className="flex items-center gap-4 min-w-[200px]">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                    {testimonial.student.avatarUrl ? (
                    <Image
                        src={testimonial.student.avatarUrl}
                        alt="Avatar"
                        fill
                        className="object-cover"
                    />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                        {testimonial.student.firstName[0]}
                    </div>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.student.firstName} {testimonial.student.lastName}
                    </h3>
                    <p className="text-xs text-slate-500">{testimonial.student.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(testimonial.createdAt), "MMM d, yyyy")}
                    </p>
                </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {i < testimonial.rating ? "star" : "star_rate"} 
                        </span>
                        ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        "{testimonial.content}"
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                    <button
                        onClick={() => {
                            // If we are featuring, we should also ensure it's approved
                            const newFeaturedStatus = !testimonial.isFeatured;
                            handleUpdateStatus(testimonial.id, { 
                                isFeatured: newFeaturedStatus,
                                ...(newFeaturedStatus && { isApproved: true }) // Auto-approve if featuring
                            });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-2
                        ${testimonial.isFeatured 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary/50"}`}
                    >
                        <span className="material-symbols-outlined text-base">
                            {testimonial.isFeatured ? "star" : "star_outline"}
                        </span>
                        {testimonial.isFeatured ? "Featured" : "Feature"}
                    </button>

                    
                     {/* Approval Button (If we want explicit approval before featuring, currently redundant if featuring implies approval, but good for moderation) */}
                    <button 
                        onClick={() => handleUpdateStatus(testimonial.id, { isApproved: !testimonial.isApproved })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-2
                         ${testimonial.isApproved
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                            : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"}`}
                    >
                        <span className="material-symbols-outlined text-base">
                            {testimonial.isApproved ? "check_circle" : "pending"}
                        </span>
                         {testimonial.isApproved ? "Approved" : "Approve"}
                    </button>

                    <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">delete</span>
                        Delete
                    </button>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
}
