import { User, Document, Notification, Policy } from './types';
import { Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    serviceNumber: 'NCoS/23/001',
    email: 'staff@nexus.com',
    firstName: 'Sarah',
    surname: 'Chen',
    role: 'staff',
    department: 'Engineering',
    presentRank: 'Inspector',
    initialRank: 'Assistant Inspector',
    level: '08',
    assignedState: 'Lagos',
    prison: 'Kirikiri Maximum',
    status: 'active',
    joinDate: '2023-01-15',
    avatarUrl: 'https://picsum.photos/200/200',
    phone: '+1 (555) 0123-4567',
    location: 'Lagos, NG',
    gender: 'Female',
    stateOfOrigin: 'Edo',
    username: 'schen'
  },
  {
    id: 'u2',
    serviceNumber: 'NCoS/20/045',
    email: 'hr@nexus.com',
    firstName: 'Marcus',
    surname: 'Reynolds',
    role: 'hr',
    department: 'Human Resources',
    presentRank: 'Superintendent',
    initialRank: 'Inspector',
    level: '10',
    assignedState: 'FCT',
    prison: 'Headquarters',
    status: 'active',
    joinDate: '2020-03-10',
    avatarUrl: 'https://picsum.photos/201/201',
    phone: '+1 (555) 9876-5432',
    location: 'Abuja, NG',
    gender: 'Male',
    stateOfOrigin: 'Rivers',
    username: 'mreynolds'
  },
  {
    id: 'u3',
    serviceNumber: 'NCoS/18/112',
    email: 'admin@nexus.com',
    firstName: 'Evelyn',
    surname: 'Vance',
    role: 'admin',
    department: 'Operations',
    presentRank: 'Controller',
    initialRank: 'Superintendent',
    level: '14',
    assignedState: 'FCT',
    prison: 'Headquarters',
    status: 'active',
    joinDate: '2018-06-22',
    avatarUrl: 'https://picsum.photos/202/202',
    phone: '+1 (555) 1111-2222',
    location: 'Abuja, NG',
    gender: 'Female',
    stateOfOrigin: 'Kaduna',
    username: 'evance'
  },
  {
    id: 'u4',
    serviceNumber: 'NCoS/22/099',
    email: 'john@nexus.com',
    firstName: 'John',
    surname: 'Doe',
    role: 'staff',
    department: 'Marketing',
    presentRank: 'Assistant II',
    initialRank: 'Assistant II',
    level: '06',
    assignedState: 'Kano',
    prison: 'Kano Central',
    status: 'on-leave',
    joinDate: '2022-11-01',
    avatarUrl: 'https://picsum.photos/203/203',
    location: 'Kano, NG',
    gender: 'Male',
    stateOfOrigin: 'Lagos',
    username: 'jdoe'
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  { 
    id: 'd1', 
    userId: 'u1',
    title: 'Employment Contract', 
    category: 'Contract', 
    status: 'approved', 
    dateUploaded: '2023-01-15', 
    size: '2.4 MB', 
    type: 'PDF', 
    uploadedBy: 'Sarah Chen',
    version: 1,
    history: [],
    notes: 'Initial contract signing',
    url: 'https://pdfobject.com/pdf/sample.pdf' // Sample public PDF
  },
  { 
    id: 'd2', 
    userId: 'u1',
    title: 'Driver\'s License', 
    category: 'ID', 
    status: 'pending', 
    dateUploaded: '2024-03-20', 
    size: '1.1 MB', 
    type: 'JPG', 
    uploadedBy: 'Sarah Chen',
    version: 2,
    notes: 'Updated expiry date',
    url: 'https://picsum.photos/800/600', // Sample Image
    history: [
      {
        id: 'd2_v1',
        dateUploaded: '2021-03-15',
        status: 'approved',
        size: '1.0 MB',
        uploadedBy: 'Sarah Chen',
        version: 1,
        notes: 'Initial upload of ID',
        url: 'https://picsum.photos/800/600?grayscale'
      }
    ]
  },
  { 
    id: 'd3', 
    userId: 'u1',
    title: 'AWS Certification', 
    category: 'Certificate', 
    status: 'approved', 
    dateUploaded: '2023-06-10', 
    size: '3.5 MB', 
    type: 'PDF', 
    uploadedBy: 'Sarah Chen',
    version: 1,
    history: [],
    notes: 'Professional Architect Cert'
  },
  { 
    id: 'd4', 
    userId: 'u4',
    title: 'Tax Form W-2', 
    category: 'Other', 
    status: 'rejected', 
    dateUploaded: '2023-12-31', 
    size: '0.5 MB', 
    type: 'PDF', 
    uploadedBy: 'John Doe',
    version: 1,
    history: [],
    notes: '2023 Tax Return'
  },
  {
    id: 'd5',
    userId: 'u2', // HR User
    title: 'HR Certification',
    category: 'Certificate',
    status: 'approved',
    dateUploaded: '2023-05-15',
    size: '1.8 MB',
    type: 'PDF',
    uploadedBy: 'Marcus Reynolds',
    version: 1,
    history: [],
    notes: 'SHRM Certification'
  }
];

export const MOCK_POLICIES: Policy[] = [
  {
    id: 'p1',
    title: 'Employee Handbook 2024',
    content: 'Comprehensive guide to company procedures, code of conduct, and benefits.',
    version: '2.0',
    dateUpdated: '2024-01-10',
    category: 'General',
    uploadedBy: 'Marcus Reynolds'
  },
  {
    id: 'p2',
    title: 'Remote Work Policy',
    content: 'Guidelines for working from home, including hours, communication expectations, and equipment.',
    version: '1.5',
    dateUpdated: '2024-03-15',
    category: 'HR',
    uploadedBy: 'Marcus Reynolds'
  },
  {
    id: 'p3',
    title: 'IT Security Protocols',
    content: 'Required security measures for all company devices and data handling.',
    version: '3.1',
    dateUpdated: '2023-11-20',
    category: 'IT',
    uploadedBy: 'Evelyn Vance'
  },
  {
    id: 'p4',
    title: 'Health & Safety Guidelines',
    content: 'Emergency procedures and workplace safety standards.',
    version: '1.0',
    dateUpdated: '2023-09-05',
    category: 'Safety',
    uploadedBy: 'Marcus Reynolds'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Document Approved', message: 'Your employment contract has been approved by HR.', date: '2 hours ago', type: 'success', read: false },
  { id: 'n2', title: 'New Policy Update', message: 'Please review the updated remote work policy.', date: '1 day ago', type: 'info', read: true },
  { id: 'n3', title: 'Leave Request Pending', message: 'Your leave request for July 15th is pending approval.', date: '3 days ago', type: 'warning', read: true },
];

export const STATS_ICONS = {
  staff: Users,
  docs: FileText,
  approve: CheckCircle,
  alert: AlertCircle
};