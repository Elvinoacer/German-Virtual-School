"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui";
import { registerSchema, type RegisterFormData } from "./registerSchema";
import Link from "next/link";
import axios from "@/lib/axios";
import { signIn } from "next-auth/react";

interface CalendarData {
  enrollmentStartDate: string | null;
  enrollmentEndDate: string | null;
  orientationDate: string | null;
  firstClassDate: string | null;
  lastClassDate: string | null;
  isEnrollmentOpen: boolean;
  enrollmentMessage: string;
}

interface ReservationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  program?: string;
  timestamp: number;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const program = searchParams.get('program');
  const fromReservation = searchParams.get('from') === 'reservation';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);

  // Check enrollment status on mount
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      try {
        const response = await axios.get("/api/school/calendar");
        if (response.data.success) {
          setCalendarData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to check enrollment status:", error);
        // If we can't check, assume enrollment is open to not block users
        setCalendarData({ isEnrollmentOpen: true, enrollmentMessage: "" } as CalendarData);
      } finally {
        setIsCheckingEnrollment(false);
      }
    };
    checkEnrollmentStatus();
  }, []);

  // Load reservation data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gvs_reservation');
      if (stored) {
        const parsed: ReservationData = JSON.parse(stored);
        // Only use if less than 90 days old
        const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp < ninetyDaysMs) {
          setReservationData(parsed);
        } else {
          localStorage.removeItem('gvs_reservation');
        }
      }
    } catch {
      // localStorage unavailable or data corrupt — ignore
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: undefined, // Ensure controlled/uncontrolled doesn't warn
    },
  });

  // Pre-fill form when reservation data is loaded
  useEffect(() => {
    if (reservationData) {
      setValue('firstName', reservationData.firstName);
      setValue('lastName', reservationData.lastName);
      setValue('email', reservationData.email);
      if (reservationData.program) {
        setValue('interestedProgram', reservationData.program);
      }
    }
  }, [reservationData, setValue]);

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
        interestedProgram: reservationData?.program || program,
      });


      if (response.data.success) {
        // Clear reservation data from localStorage after successful registration
        try {
          localStorage.removeItem('gvs_reservation');
        } catch {
          // ignore
        }
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

  // Show loading while checking enrollment
  if (isCheckingEnrollment) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-500 text-sm">Checking enrollment status...</p>
      </div>
    );
  }

  // Show enrollment closed message
  if (calendarData && !calendarData.isEnrollmentOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center py-8 px-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800"
      >
        <span className="material-symbols-outlined text-5xl text-amber-600 mb-4">
          event_busy
        </span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Enrollment is Currently Closed
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          {calendarData.enrollmentMessage}
        </p>
        
        {calendarData.orientationDate && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Orientation Date</p>
            <p className="font-bold text-primary">
              {new Date(calendarData.orientationDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        )}

        {calendarData.firstClassDate && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Classes Begin</p>
            <p className="font-bold text-primary">
              {new Date(calendarData.firstClassDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Already have an account?
        </p>
        <Link href="/login">
          <Button variant="outline" className="px-8">
            Sign In
          </Button>
        </Link>
      </motion.div>
    );
  }

  // Whether fields should be locked (reservation data available)
  const isFieldLocked = !!reservationData;

  return (

    <div className="flex flex-col gap-6">
      {/* Reservation Badge */}
      {reservationData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3"
        >
          <span
            className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <div>
            <p className="font-semibold text-green-800 dark:text-green-200 text-sm">
              Seat Reserved — Complete Your Registration
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Your details have been pre-filled from your reservation. Just set a password to complete your account.
            </p>
          </div>
        </motion.div>
      )}

      {!reservationData && (
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
      )}

      {/* Divider */}
      {!reservationData && (
        <div className="flex items-center gap-4">
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Or register with email
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {program && !reservationData && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3 text-sm text-primary mb-2">
                <span className="material-symbols-outlined text-[20px]">school</span>
                <span>
                    You are registering for: <strong>{program}</strong>
                </span>
            </div>
        )}

        {/* Name Fields */}
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex flex-col flex-1 gap-2">
            <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
              First Name
              {isFieldLocked && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                  (from reservation)
                </span>
              )}
            </span>
            <input
              {...register("firstName")}
              readOnly={isFieldLocked}
              tabIndex={isFieldLocked ? -1 : undefined}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.firstName ? "border-red-500" : "border-gray-200 dark:border-gray-700"} ${isFieldLocked ? "bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed" : "bg-white dark:bg-gray-800"} h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm`}
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
              {isFieldLocked && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                  (from reservation)
                </span>
              )}
            </span>
            <input
              {...register("lastName")}
              readOnly={isFieldLocked}
              tabIndex={isFieldLocked ? -1 : undefined}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.lastName ? "border-red-500" : "border-gray-200 dark:border-gray-700"} ${isFieldLocked ? "bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed" : "bg-white dark:bg-gray-800"} h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm`}
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
            {isFieldLocked && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                (locked — must match reservation)
              </span>
            )}
          </span>
          <div className="relative">
            <input
              {...register("email")}
              type="email"
              readOnly={isFieldLocked}
              tabIndex={isFieldLocked ? -1 : undefined}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-700"} ${isFieldLocked ? "bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed" : "bg-white dark:bg-gray-800"} h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm pl-10`}
              placeholder="student@german-school.edu"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-symbols-outlined text-[20px]">
                {isFieldLocked ? "lock" : "mail"}
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
              autoFocus={isFieldLocked}
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
