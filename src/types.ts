/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'student' | 'department_staff' | 'admin' | 'super_admin';
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Pending' | 'Assigned' | 'Accepted' | 'In Progress' | 'Waiting Verification' | 'Resolved' | 'Closed' | 'Reopened' | 'Escalated';
export type Category = 'Network' | 'Electrical' | 'Plumbing' | 'Maintenance' | 'Security' | 'Hardware' | 'Software' | 'Other';

export interface Complaint {
  id: string;
  description: string;
  category: Category | string;
  department: string | null;
  priority: Priority | string;
  status: Status | string;
  assigned_to: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  ai_explanation?: string;
  ai_summary?: string;
  ai_sentiment?: string;
  ai_urgency_score?: number;
  ai_confidence_score?: number;
  is_duplicate?: boolean;
  duplicate_ref?: string;
  resolution_estimate?: number; 
  user_id?: string;
  image_url?: string | null;

  // New Workflow Fields
  assigned_department?: string | null;
  assigned_staff_id?: string | null;
  assigned_by_id?: string | null;
  assignment_timestamp?: string | null;
  resolution_notes?: string | null;
  verification_status?: 'Pending' | 'Approved' | 'Rejected' | null;
  student_feedback?: 'Resolved' | 'Not Resolved' | null;
  reopened_reason?: string | null;
  escalation_note?: string | null;
  resolution_proof_url?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  department?: string;
  email?: string;
  avatar_url?: string;
}

export interface Message {
  id: string;
  complaint_id: string;
  sender_id: string;
  sender_role: Role;
  message: string | null;
  message_type: 'text' | 'file' | 'voice';
  attachment_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  avgResolutionTime: number;
  byCategory: { name: string; value: number }[];
  overTime: { date: string; complaints: number }[];
  byDepartment: { name: string; value: number }[];
}
