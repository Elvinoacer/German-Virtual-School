'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Input, Checkbox } from '@/components/ui';
import { loginSchema, type LoginFormData } from './loginSchema';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'UnverifiedAccount') {
      toast.error('Your account is waiting for verification by an administrator.');
    } else if (error === 'AccessDenied') {
      toast.error('Access denied. You do not have permission to view this resource.');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  


  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
        return;
      }

      // Get session to determine redirect
      const session = await getSession();
      
      if (session?.user?.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (session?.user?.role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }

      toast.success('Welcome back!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900 dark:text-gray-200"
        >
          Email Address
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          placeholder="student@gvs.de"
          className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 sm:text-sm px-4 placeholder:text-gray-400 transition-colors"
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-900 dark:text-gray-200"
        >
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary h-12 sm:text-sm px-4 pr-10 placeholder:text-gray-400 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            {...register('rememberMe')}
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-surface-light dark:bg-surface-dark dark:border-gray-600"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </Button>

      {/* SSO Section */}
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background-light dark:bg-background-dark px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2"
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
          className="flex items-center justify-center gap-2"
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

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        By logging in, you agree to our{' '}
        <a
          href="#"
          className="font-medium text-primary hover:text-primary-hover hover:underline"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="#"
          className="font-medium text-primary hover:text-primary-hover hover:underline"
        >
          Privacy Policy
        </a>
        .
      </p>
    </motion.form>
  );
}
