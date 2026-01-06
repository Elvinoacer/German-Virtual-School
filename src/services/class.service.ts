import axios from '@/lib/axios';
import { Class, Attendance } from '@/types';

/**
 * Class Service
 * Handles all virtual class and attendance-related API calls
 */

export const classService = {
  /**
   * Get all classes
   */
  async getClasses(params?: {
    courseId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Class[]> {
    const response = await axios.get('/classes', { params });
    return response.data;
  },

  /**
   * Get single class by ID
   */
  async getClass(id: string): Promise<Class> {
    const response = await axios.get(`/classes/${id}`);
    return response.data;
  },

  /**
   * Create class (Teacher only)
   */
  async createClass(data: Partial<Class>): Promise<Class> {
    const response = await axios.post('/classes', data);
    return response.data;
  },

  /**
   * Update class (Teacher only)
   */
  async updateClass(id: string, data: Partial<Class>): Promise<Class> {
    const response = await axios.patch(`/classes/${id}`, data);
    return response.data;
  },

  /**
   * Delete class (Teacher only)
   */
  async deleteClass(id: string): Promise<void> {
    await axios.delete(`/classes/${id}`);
  },

  /**
   * Get session token for joining class
   */
  async getSessionToken(classId: string): Promise<{
    token: string;
    meetingUrl: string;
    expiresAt: string;
  }> {
    const response = await axios.post(`/classes/${classId}/join`);
    return response.data;
  },

  /**
   * Record attendance check-in
   */
  async checkIn(classId: string): Promise<Attendance> {
    const response = await axios.post(`/classes/${classId}/check-in`);
    return response.data;
  },

  /**
   * Record attendance check-out
   */
  async checkOut(classId: string): Promise<Attendance> {
    const response = await axios.post(`/classes/${classId}/check-out`);
    return response.data;
  },

  /**
   * Get attendance for class (Teacher only)
   */
  async getClassAttendance(classId: string): Promise<Attendance[]> {
    const response = await axios.get(`/classes/${classId}/attendance`);
    return response.data;
  },

  /**
   * Update attendance manually (Teacher only)
   */
  async updateAttendance(
    attendanceId: string,
    data: Partial<Attendance>
  ): Promise<Attendance> {
    const response = await axios.patch(`/attendance/${attendanceId}`, data);
    return response.data;
  },

  /**
   * Get student's attendance history
   */
  async getMyAttendance(params?: {
    courseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Attendance[]> {
    const response = await axios.get('/attendance/my', { params });
    return response.data;
  },
};
