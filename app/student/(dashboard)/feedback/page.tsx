"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is used, or alert
import { useAuth } from "@/hooks/useAuth";

type FeedbackFormValues = {
  content: string;
  rating: number;
};

export default function StudentFeedbackPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    defaultValues: {
      rating: 5,
      content: "",
    },
  });

  const rating = watch("rating");

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      setIsSubmitting(true);
      await axios.post("/api/testimonials", data);
      toast.success("Feedback submitted successfully!");
      reset();
      // Optionally redirect or show success state
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Share Your Experience
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Your feedback helps us improve and helps other students make informed decisions.
        </p>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              How would you rate your experience?
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue("rating", star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <span
                    className={`material-symbols-outlined text-3xl ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-current" // Assuming filled style or using icon font variant
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm">{errors.rating.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Tell us more (Optional)
            </label>
            <textarea
              {...register("content", { required: "Please share your thoughts" })}
              rows={5}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:text-white placeholder:text-slate-400"
              placeholder="What did you like best? How has the course helped you?"
            />
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <span>Submit Feedback</span>
                  <span className="material-symbols-outlined text-lg">send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
