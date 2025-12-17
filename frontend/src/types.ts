import React from 'react';

export type Role = 'staff' | 'hr' | 'admin';

export interface User {
  id: string; // bigint(20) UNSIGNED
  serviceNumber: string; // service_no
  username?: string; // username
  email: string; // email
  surname: string; // surname
  firstName: string; // first_name
  otherNames?: string; // other_names
  gender?: string; // sex
  
  // Rank & Position
  initialRank?: string; // initial_rank
  presentRank: string; // present_rank (was position)
  level?: string; // level
  department: string; // department
  fileNumber?: string; // file_no
  duty?: string; // duty
  description?: string; // description

  // Location
  assignedState?: string; // assigned_state
  prison?: string; // prison
  
  // Bio
  dateOfBirth?: string; // dob
  stateOfOrigin?: string; // state_of_origin
  lga?: string; // lga
  
  avatarUrl?: string; // photo
  status: 'active' | 'inactive' | 'on-leave'; // status (int)
  lastLogin?: string; // last_login
  
  // App Specific (Derived or Aux)
  role: Role;
  joinDate: string; // created_at
  phone?: string; 
  location?: string; // Derived from assignedState/prison
}

export interface BioData {
  // Personal
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  gender: string;
  // Contact
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Emergency
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  // Banking
  bankName: string;
  accountNumber: string;
}

export interface DocumentVersion {
  id: string;
  dateUploaded: string;
  status: 'approved' | 'pending' | 'rejected';
  size: string;
  uploadedBy: string;
  version: number;
  notes?: string;
  url?: string; // URL for preview
}

export interface Document {
  id: string;
  userId: string; // Added to track ownership
  title: string;
  category: 'ID' | 'Certificate' | 'Contract' | 'Other';
  status: 'approved' | 'pending' | 'rejected';
  dateUploaded: string;
  size: string;
  type: string;
  uploadedBy: string;
  version: number;
  history?: DocumentVersion[];
  notes?: string;
  url?: string; // URL for preview
}

export interface Policy {
  id: string;
  title: string;
  content: string; // Summary
  version: string;
  dateUpdated: string;
  category: 'HR' | 'IT' | 'General' | 'Safety';
  uploadedBy: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  targetRole?: Role | 'all'; 
  targetUserId?: string;
}

export interface ApprovalItem {
  id: string;
  type: 'Profile Update' | 'Document' | 'Leave Request' | 'Bio Data';
  user: string;
  detail: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
  data?: any; // Payload for bio data review or linked document ID
  fieldStatuses?: Record<string, 'approved' | 'rejected'>; // For HR review state
}

export interface Stat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
}

// --- Complaint System Types ---

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  role: Role;
  content: string;
  timestamp: string;
  isInternal?: boolean; // For HR/Admin notes invisible to staff (optional feature)
}

export interface Complaint {
  id: string;
  subject: string;
  category: 'Payroll' | 'Leave' | 'Workplace' | 'IT' | 'Other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'escalated';
  createdBy: string; // UserId
  createdByName: string; // Display name
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}