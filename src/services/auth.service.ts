import axios from '@/lib/axios';
import {
  User,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ApiResponse,
} from '@/types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export const authService = {
  /**
   * Login user
   */
  async login(data: LoginFormData): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const response = await axios.post('/auth/login', data);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterFormData): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await axios.post('/auth/logout');
  },

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordFormData): Promise<ApiResponse<null>> {
    const response = await axios.post('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    data: ResetPasswordFormData
  ): Promise<ApiResponse<null>> {
    const response = await axios.post(`/auth/reset-password/${token}`, data);
    return response.data;
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    const response = await axios.post(`/auth/verify-email/${token}`);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const response = await axios.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axios.patch('/auth/profile', data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> {
    const response = await axios.post('/auth/change-password', data);
    return response.data;
  },
};
