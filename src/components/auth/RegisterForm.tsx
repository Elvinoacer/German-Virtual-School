'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { registerSchema, type RegisterFormData } from './registerSchema';
import Link from 'next/link';
import axios from '@/lib/axios';
import { signIn } from 'next-auth/react';

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
    }
  });

  const password = watch('password', '');

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
      const response = await axios.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'STUDENT', // Default to student, can be changed based on form selection
      });

      if (response.data.success) {
        toast.success('Registration successful! Please sign in.');
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error?.message || 
                         (typeof error.response?.data?.error === 'string' ? error.response?.data?.error : null) || 
                         'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2 h-12"
          onClick={() => signIn("google", { callbackUrl: "/student/dashboard" })}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
          </svg>
          <span className="hidden sm:inline">Google</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2 h-12"
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/student/dashboard" })}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 23 23">
            <path d="M1 1h10v10H1z" fill="#f35325"></path>
            <path d="M12 1h10v10H12z" fill="#81bc06"></path>
            <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
            <path d="M12 12h10v10H12z" fill="#ffba08"></path>
          </svg>
          <span className="hidden sm:inline">Microsoft</span>
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
              {...register('firstName')}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.firstName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm`}
              placeholder="Johann"
            />
            {errors.firstName && (
              <span className="text-xs text-red-500">{errors.firstName.message}</span>
            )}
          </label>
          <label className="flex flex-col flex-1 gap-2">
            <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
              Last Name
            </span>
            <input
              {...register('lastName')}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.lastName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm`}
              placeholder="Schmidt"
            />
             {errors.lastName && (
              <span className="text-xs text-red-500">{errors.lastName.message}</span>
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
              {...register('email')}
              type="email"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm pl-10`}
              placeholder="student@german-school.edu"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-symbols-outlined text-[20px]">mail</span>
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
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm pr-10`}
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer flex items-center"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          <div className="flex gap-1 mt-1 h-1">
             {[1, 2, 3, 4].map((level) => (
                <div
                    key={level}
                    className={`flex-1 rounded-full transition-colors duration-300 ${
                        strength >= level ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                ></div>
             ))}
          </div>
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password.message}</span>
          )}
        </label>

        {/* Confirm Password Field */}
        <label className="flex flex-col gap-2">
          <span className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
            Confirm Password
          </span>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type="password"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 h-12 px-4 text-base font-normal placeholder:text-gray-400 transition-all shadow-sm`}
              placeholder="Repeat your password"
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
          )}
        </label>

        {/* Terms Checkbox */}
        <div className="relative">
            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
            <div className="relative flex items-center pt-0.5">
                <input
                {...register('terms')}
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all checked:border-primary checked:bg-primary hover:border-primary"
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                I agree to the <a href="#" className="text-primary font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-primary font-medium hover:underline">Privacy Policy</a>.
            </span>
            </label>
             {errors.terms && (
            <span className="text-xs text-red-500 block mt-1">{errors.terms.message}</span>
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
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Creating Account...
                </span>
            ) : (
                'Create Account'
            )}
        </Button>
      </motion.form>

      {/* Footer Help */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Need help? <a href="#" className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors">Contact Support</a>
      </p>
    </div>
  );
}
