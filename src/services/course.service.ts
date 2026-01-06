import axios from '@/lib/axios';
import { Course, CourseEnrollment, PaginatedResponse } from '@/types';

/**
 * Course Service
 * Handles all course-related API calls
 */

export const courseService = {
  /**
   * Get all courses with pagination and filters
   */
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    teacherId?: string;
  }): Promise<PaginatedResponse<Course>> {
    const response = await axios.get('/courses', { params });
    return response.data;
  },

  /**
   * Get single course by ID
   */
  async getCourse(id: string): Promise<Course> {
    const response = await axios.get(`/courses/${id}`);
    return response.data;
  },

  /**
   * Create new course (Teacher only)
   */
  async createCourse(data: Partial<Course>): Promise<Course> {
    const response = await axios.post('/courses', data);
    return response.data;
  },

  /**
   * Update course (Teacher only)
   */
  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const response = await axios.patch(`/courses/${id}`, data);
    return response.data;
  },

  /**
   * Delete course (Teacher only)
   */
  async deleteCourse(id: string): Promise<void> {
    await axios.delete(`/courses/${id}`);
  },

  /**
   * Enroll in course (Student only)
   */
  async enrollCourse(courseId: string): Promise<CourseEnrollment> {
    const response = await axios.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  /**
   * Get enrolled courses (Student only)
   */
  async getEnrolledCourses(): Promise<CourseEnrollment[]> {
    const response = await axios.get('/courses/enrolled');
    return response.data;
  },

  /**
   * Get course progress (Student only)
   */
  async getCourseProgress(courseId: string): Promise<CourseEnrollment> {
    const response = await axios.get(`/courses/${courseId}/progress`);
    return response.data;
  },

  /**
   * Update course progress (Student)
   */
  async updateCourseProgress(
    courseId: string,
    data: { moduleId: string; completed: boolean }
  ): Promise<CourseEnrollment> {
    const response = await axios.post(`/courses/${courseId}/progress`, data);
    return response.data;
  },
};
