"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    profile?: {
      mentorId?: string | null;
    } | null;
  } | null;
}

export default function AssignTeacherModal({ isOpen, onClose, student }: AssignTeacherModalProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const queryClient = useQueryClient();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && student) {
      setSelectedTeacherId(student.profile?.mentorId || "");
    }
  }, [isOpen, student]);

  // Fetch all teachers
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['admin-teachers-list'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/teachers');
      return response.data.data?.teachers || [];
    },
    enabled: isOpen
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!student) return;
      const response = await axiosInstance.patch(`/admin/students/${student.id}/assign-teacher`, {
        teacherId: selectedTeacherId || null // Send null to remove assignment
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success(selectedTeacherId ? "Teacher assigned successfully" : "Assignment removed successfully");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update teacher assignment");
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">
            Assign Teacher
          </h3>
          <p className="text-[#4c669a] text-sm mb-6">
            Assign a mentor/teacher to <span className="font-semibold">{student?.firstName} {student?.lastName}</span>.
            They will see this student in their "My Students" list.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1">
                Select Teacher
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e7ebf3] dark:border-[#2d3748] bg-[#f3f4f6] dark:bg-[#2d3748] dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoadingTeachers}
              >
                <option value="">-- No Teacher Assigned --</option>
                {teachersData?.map((teacher: Teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
              {isLoadingTeachers && <p className="text-xs text-[#4c669a] mt-1">Loading teachers...</p>}
            </div>
          </div>
        </div>

        <div className="bg-[#f8f9fc] dark:bg-[#1a202c]/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e7ebf3] dark:border-[#2d3748]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#4c669a] hover:text-[#0d121b] dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => assignMutation.mutate()}
            disabled={assignMutation.isPending}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {assignMutation.isPending && (
              <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
            )}
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
