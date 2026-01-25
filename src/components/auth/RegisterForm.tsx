"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { registerSchema, type RegisterFormData } from "./registerSchema";
import Link from "next/link";
import axios from "@/lib/axios";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: undefined, // Ensure controlled/uncontrolled doesn't warn
    },
  });

  const password = watch("password", "");

  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "STUDENT", // Default to student, can be changed based on form selection
      });

      if (response.data.success) {
        toast.success(
          "Registration successful! Please check your email to verify your account.",
        );
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        (typeof error.response?.data?.error === "string"
          ? error.response?.data?.error
          : null) ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full">
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-3 w-full h-12 bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium transition-all"
          onClick={() =>
            signIn("google", { callbackUrl: "/student/dashboard" })
          }
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Or register with email
        </span>
        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {/* Name Fields */}
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex flex-col flex-1 gap-2">
            <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
              First Name
            </span>
            <input
              {...register("firstName")}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.firstName ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm`}
              placeholder="Johann"
            />
            {errors.firstName && (
              <span className="text-xs text-red-500">
                {errors.firstName.message}
              </span>
            )}
          </label>
          <label className="flex flex-col flex-1 gap-2">
            <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
              Last Name
            </span>
            <input
              {...register("lastName")}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.lastName ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm`}
              placeholder="Schmidt"
            />
            {errors.lastName && (
              <span className="text-xs text-red-500">
                {errors.lastName.message}
              </span>
            )}
          </label>
        </div>

        {/* Email Field */}
        <label className="flex flex-col gap-2">
          <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
            Email Address
          </span>
          <div className="relative">
            <input
              {...register("email")}
              type="email"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm pl-10`}
              placeholder="student@german-school.edu"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-symbols-outlined text-[20px]">
                mail
              </span>
            </div>
          </div>
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </label>

        {/* Password Field */}
        <label className="flex flex-col gap-2">
          <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
            Password
          </span>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.password ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm pr-10`}
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer flex items-center"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {/* Password Strength Indicator */}
          <div className="flex gap-1 mt-1 h-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`flex-1 rounded-full transition-colors duration-300 ${
                  strength >= level
                    ? "bg-green-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              ></div>
            ))}
          </div>
          {errors.password && (
            <span className="text-xs text-red-500">
              {errors.password.message}
            </span>
          )}
        </label>

        {/* Confirm Password Field */}
        <label className="flex flex-col gap-2">
          <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
            Confirm Password
          </span>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type="password"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.confirmPassword ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm`}
              placeholder="Repeat your password"
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>

        {/* Terms Checkbox */}
        <div className="relative">
          <label className="flex items-start gap-3 mt-2 cursor-pointer group">
            <div className="relative flex items-center pt-0.5">
              <input
                {...register("terms")}
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all checked:border-primary checked:bg-primary hover:border-primary"
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                <span className="material-symbols-outlined text-[16px] font-bold">
                  check
                </span>
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
              I agree to the{" "}
              <a
                href="/terms"
                className="text-primary font-medium hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-primary font-medium hover:underline"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.terms && (
            <span className="text-xs text-red-500 block mt-1">
              {errors.terms.message}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="mt-4 w-full h-12 text-base font-bold"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </motion.form>

      {/* Footer Help */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Need help?{" "}
        <a
          href="#"
          className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
        >
          Contact Support
        </a>
      </p>
    </div>
  );
}
