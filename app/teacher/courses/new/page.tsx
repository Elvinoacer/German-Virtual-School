"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { CourseLevel } from "@/generated/prisma/client";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { FileUpload } from "@/components/ui/FileUpload";

interface Lesson {
  title: string;
  description?: string;
  type: "VIDEO" | "DOCUMENT" | "ARTICLE" | "QUIZ" | "ASSIGNMENT";
  url?: string;
}

interface Module {
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface CourseFormValues {
  title: string;
  description: string;
  level: CourseLevel;
  durationWeeks: number;
  price: number;
  thumbnailUrl?: string;
  category?: string;
  outcomes: { value: string }[];
  modules: Module[];
}

export default function NewCoursePage() {
  const [activeSection, setActiveSection] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CourseFormValues>({
    defaultValues: {
      title: "",
      description: "",
      level: "A1",
      durationWeeks: 4,
      price: 0,
      outcomes: [{ value: "" }],
      modules: [
        {
          title: "Introduction",
          description: "",
          lessons: [{ title: "Welcome", type: "VIDEO", url: "" }]
        }
      ]
    }
  });

  const { fields: outcomeFields, append: appendOutcome, remove: removeOutcome } = useFieldArray({
    control,
    name: "outcomes"
  });

  const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
    control,
    name: "modules"
  });

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        outcomes: data.outcomes.map(o => o.value).filter(v => v.trim() !== ""),
        price: Number(data.price),
        durationWeeks: Number(data.durationWeeks)
      };

      await axios.post("/api/courses/create", payload);
      toast.success("Course created successfully!");
      router.push("/teacher/courses");
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.error?.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white font-display min-h-screen flex flex-col transition-colors duration-200">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col bg-[#f8f9fc] dark:bg-[#0f1520] transition-colors duration-200">
        {/* Page Header & Actions */}
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 dark:bg-[#1a2234]/90 backdrop-blur-md dark:border-gray-800 px-4 py-3 md:px-8 lg:px-12 transition-colors duration-200">
          <div className="mx-auto max-w-5xl">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <Link className="hover:text-primary" href="/teacher/dashboard">
                Home
              </Link>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <Link className="hover:text-primary" href="/teacher/courses">
                Courses
              </Link>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                New Course
              </span>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Create New Course
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-yellow-400"></span>{" "}
                  Drafting your new course
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Save Draft
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    publish
                  </span>
                  {isSubmitting ? "Publishing..." : "Publish Course"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Navigation Progress */}
            <div className="hidden lg:col-span-3 lg:block">
              <nav className="sticky top-28 flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm dark:bg-[#1a2234] dark:shadow-none dark:border dark:border-gray-800 transition-colors duration-200">
                {[
                  { id: "general", label: "General Info", step: 1 },
                  { id: "curriculum", label: "Curriculum", step: 2 },
                  { id: "outcomes", label: "Outcomes", step: 3 },
                  { id: "settings", label: "Settings", step: 4 },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium w-full text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        activeSection === item.id
                          ? "bg-primary text-white"
                          : "border border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {item.step}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Column: Form Sections */}
            <div className="lg:col-span-9 flex flex-col gap-8">
              {/* Section 1: General Info */}
              <section
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2234] transition-colors duration-200"
                id="general"
              >
                <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    1. General Information
                  </h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Course Banner <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <MediaUpload
                      type="image"
                      label="Upload Course Banner"
                      currentUrl={watch("thumbnailUrl")}
                      onUploadComplete={(url) => setValue("thumbnailUrl", url)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("title", { required: "Title is required" })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm py-2.5"
                      placeholder="e.g. Introduction to German B1 Level"
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("description", { required: "Description is required" })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm py-2.5"
                      placeholder="Write a compelling description for your course..."
                      rows={4}
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                        Difficulty Level
                      </label>
                      <select
                        {...register("level")}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm py-2.5"
                      >
                        <option value="A1">Beginner (A1)</option>
                        <option value="A2">Elementary (A2)</option>
                        <option value="B1">Intermediate (B1)</option>
                        <option value="B2">Upper Intermediate (B2)</option>
                        <option value="C1">Advanced (C1)</option>
                        <option value="C2">Proficiency (C2)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                        Duration (Weeks)
                      </label>
                      <input
                        {...register("durationWeeks", { required: true, min: 1 })}
                        type="number"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm py-2.5"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Curriculum Builder */}
              <section
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2234] transition-colors duration-200"
                id="curriculum"
              >
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    2. Curriculum
                  </h2>
                  <button 
                    type="button"
                    onClick={() => appendModule({ title: "", lessons: [{ title: "", type: "VIDEO", url: "" }] })}
                    className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Module
                  </button>
                </div>
                <div className="space-y-6">
                  {moduleFields.map((moduleField, mIndex) => (
                    <div key={moduleField.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-[#131b29]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 mr-4">
                          <input
                            {...register(`modules.${mIndex}.title` as const, { required: "Module title is required" })}
                            placeholder={`Module ${mIndex + 1} Title`}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm py-2"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeModule(mIndex)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                      
                      <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <LessonList control={control} register={register} watch={watch} setValue={setValue} mIndex={mIndex} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Learning Outcomes */}
              <section
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2234] transition-colors duration-200"
                id="outcomes"
              >
                <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    3. Learning Outcomes
                  </h2>
                </div>
                <div className="space-y-4">
                  {outcomeFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`outcomes.${index}.value` as const)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm py-2.5"
                        placeholder="Example: Understand basic German greetings"
                      />
                      <button 
                        type="button"
                        onClick={() => removeOutcome(index)}
                        className="flex items-center justify-center rounded-lg bg-red-50 px-3 text-red-500 hover:bg-red-100 dark:bg-red-900/20"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => appendOutcome({ value: "" })}
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Outcome
                  </button>
                </div>
              </section>

              {/* Section 4: Settings & Pricing */}
              <section
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2234] transition-colors duration-200"
                id="settings"
              >
                <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    4. Settings & Pricing
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Price (KES)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">KES</span>
                      </div>
                      <input
                        {...register("price", { required: true, min: 0 })}
                        type="number"
                        step="0.01"
                        className="block w-full rounded-lg border-gray-300 pl-8 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm py-2.5"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Category
                    </label>
                    <select
                      {...register("category")}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm py-2.5"
                    >
                      <option value="Grammar">Grammar</option>
                      <option value="Conversation">Conversation</option>
                      <option value="Vocabulary">Vocabulary</option>
                      <option value="Culture">Culture</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function LessonList({ control, register, watch, setValue, mIndex }: { control: any, register: any, watch: any, setValue: any, mIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `modules.${mIndex}.lessons` as const
  });

  return (
    <div className="space-y-4">
      {fields.map((field, lIndex) => (
        <div key={field.id} className="rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-[#1a2234] space-y-4 group relative">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400 w-6">{mIndex + 1}.{lIndex + 1}</span>
            <div className="flex-1 space-y-2">
              <input
                {...register(`modules.${mIndex}.lessons.${lIndex}.title` as const, { required: true })}
                placeholder="Lesson Title"
                className="w-full rounded-lg border-gray-300 text-sm py-1.5 dark:bg-gray-800 dark:border-gray-700"
              />
              <textarea
                {...register(`modules.${mIndex}.lessons.${lIndex}.description` as const)}
                placeholder="Short description (optional)"
                rows={2}
                className="w-full rounded-lg border-gray-300 text-xs py-1.5 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <select
              {...register(`modules.${mIndex}.lessons.${lIndex}.type` as const)}
              className="rounded-lg border-gray-300 text-xs py-1.5 dark:bg-gray-800 dark:border-gray-700 self-start mt-1"
            >
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Document</option>
              <option value="ARTICLE">Article</option>
              <option value="QUIZ">Quiz</option>
              <option value="ASSIGNMENT">Assignment</option>
            </select>
            <button 
              type="button"
              onClick={() => remove(lIndex)}
              className="text-gray-400 hover:text-red-500"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="pl-4 md:pl-9">
            <Controller
              control={control}
              name={`modules.${mIndex}.lessons.${lIndex}.type` as const}
              render={({ field: typeField }) => (
                  <div className="space-y-2">
                    {typeField.value === "VIDEO" && (
                      <MediaUpload
                        type="video"
                        label="Upload Lesson Video"
                        currentUrl={watch(`modules.${mIndex}.lessons.${lIndex}.url` as any)}
                        onUploadComplete={(url) => {
                          setValue(`modules.${mIndex}.lessons.${lIndex}.url`, url);
                        }}
                      />
                    )}
                    {typeField.value === "DOCUMENT" && (
                      <FileUpload
                        label="Upload Lesson Document"
                        currentUrl={watch(`modules.${mIndex}.lessons.${lIndex}.url` as any)}
                        onUploadComplete={(url) => {
                          setValue(`modules.${mIndex}.lessons.${lIndex}.url`, url);
                        }}
                      />
                    )}
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Or paste URL directly
                      </label>
                      <input
                        {...register(`modules.${mIndex}.lessons.${lIndex}.url` as const)}
                        placeholder="Resource URL or Link"
                        className="block w-full rounded-lg border-gray-300 text-sm py-1.5 dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                  </div>
              )}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ title: "", type: "VIDEO", url: "" })}
        className="flex items-center gap-1 text-xs font-medium text-primary hover:text-blue-700 mt-2"
      >
        <span className="material-symbols-outlined text-[16px]">add_circle</span>
        Add Lesson
      </button>
    </div>
  );
}
