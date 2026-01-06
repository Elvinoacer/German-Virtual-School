import axios from '@/lib/axios';
import { Assignment, Submission, PaginatedResponse } from '@/types';

/**
 * Assignment Service
 * Handles all assignment-related API calls
 */

export const assignmentService = {
  /**
   * Get all assignments
   */
  async getAssignments(params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Assignment>> {
    const response = await axios.get('/assignments', { params });
    return response.data;
  },

  /**
   * Get single assignment by ID
   */
  async getAssignment(id: string): Promise<Assignment> {
    const response = await axios.get(`/assignments/${id}`);
    return response.data;
  },

  /**
   * Create assignment (Teacher only)
   */
  async createAssignment(data: Partial<Assignment>): Promise<Assignment> {
    const response = await axios.post('/assignments', data);
    return response.data;
  },

  /**
   * Update assignment (Teacher only)
   */
  async updateAssignment(
    id: string,
    data: Partial<Assignment>
  ): Promise<Assignment> {
    const response = await axios.patch(`/assignments/${id}`, data);
    return response.data;
  },

  /**
   * Delete assignment (Teacher only)
   */
  async deleteAssignment(id: string): Promise<void> {
    await axios.delete(`/assignments/${id}`);
  },

  /**
   * Submit assignment (Student only)
   */
  async submitAssignment(
    assignmentId: string,
    data: FormData
  ): Promise<Submission> {
    const response = await axios.post(
      `/assignments/${assignmentId}/submit`,
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Get submissions for assignment (Teacher only)
   */
  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    const response = await axios.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  /**
   * Grade submission (Teacher only)
   */
  async gradeSubmission(
    submissionId: string,
    data: { score: number; feedback?: string }
  ): Promise<Submission> {
    const response = await axios.post(`/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  /**
   * Get student's submissions
   */
  async getMySubmissions(): Promise<Submission[]> {
    const response = await axios.get('/submissions/my');
    return response.data;
  },
};
