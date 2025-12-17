import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MOCK_USERS, MOCK_NOTIFICATIONS, MOCK_DOCUMENTS, MOCK_POLICIES } from './constants';
import { User, Role, ApprovalItem, Complaint, Message, Notification, Document, Policy } from './types';
import { ToastContainer, ToastMessage, ToastType } from './components/ui/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import StaffList from './pages/StaffList';
import Documents from './pages/Documents';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import BioData from './pages/BioData';
import Complaints from './pages/Complaints';
import Policies from './pages/Policies';
import PolicyDetail from './pages/PolicyDetail';
import ForgotPassword from './pages/ForgotPassword';
import Modules from './pages/Modules';
import Components from './pages/Components';

// --- Theme Context ---
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

// --- Toast Context ---
interface ToastContextType {
  toast: (type: ToastType, message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Notification Context ---
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

// --- Document Context ---
interface DocumentContextType {
  documents: Document[];
  addDocument: (doc: Document) => void;
  updateDocument: (doc: Document) => void;
  updateDocumentStatus: (id: string, status: 'approved' | 'rejected') => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocuments must be used within a DocumentProvider');
  return context;
};

// --- Policy Context ---
interface PolicyContextType {
  policies: Policy[];
  addPolicy: (policy: Policy) => void;
  updatePolicy: (policy: Policy) => void;
  deletePolicy: (id: string) => void;
}

const PolicyContext = createContext<PolicyContextType | undefined>(undefined);

export const usePolicies = () => {
  const context = useContext(PolicyContext);
  if (!context) throw new Error('usePolicies must be used within a PolicyProvider');
  return context;
};

// --- Approval Context ---
interface ApprovalContextType {
  approvals: ApprovalItem[];
  addApproval: (item: Omit<ApprovalItem, 'id' | 'date' | 'status'>) => void;
  processApproval: (id: string, status: 'approved' | 'rejected' | 'partially_approved', fieldStatuses?: Record<string, 'approved' | 'rejected'>) => void;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export const useApprovals = () => {
  const context = useContext(ApprovalContext);
  if (!context) throw new Error('useApprovals must be used within an ApprovalProvider');
  return context;
};

// --- Complaint Context ---
interface ComplaintContextType {
  complaints: Complaint[];
  createComplaint: (subject: string, category: Complaint['category'], priority: Complaint['priority']) => void;
  sendMessage: (complaintId: string, content: string) => void;
  updateStatus: (complaintId: string, status: Complaint['status']) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) throw new Error('useComplaints must be used within a ComplaintProvider');
  return context;
};

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode; allowedRoles?: Role[] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 dark:border-white"></div>
  </div>;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { user, logout } = useAuth();
  const { approvals } = useApprovals();

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Module Selection (Home) */}
      <Route path="/" element={
        <ProtectedRoute>
          <Modules />
        </ProtectedRoute>
      } />

      {/* Staff Module Routes */}
      <Route path="/staff-dashboard" element={
        <ProtectedRoute>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/bio-data" element={
        <ProtectedRoute>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <BioData />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/documents" element={
        <ProtectedRoute>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <Documents />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/policies" element={
        <ProtectedRoute>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <Policies />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/policies/:id" element={
        <ProtectedRoute>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <PolicyDetail />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/complaints" element={
        <ProtectedRoute>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <Complaints />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/components" element={
        <ProtectedRoute>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <Components />
          </Layout>
        </ProtectedRoute>
      } />

      {/* HR & Admin Routes */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['hr', 'admin']}>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <StaffList />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/approvals" element={
        <ProtectedRoute allowedRoles={['hr', 'admin']}>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <Approvals />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Only Routes */}
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout user={user!} onLogout={logout} pendingApprovals={pendingCount}>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('nexus_theme') as Theme) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = (type: ToastType, message: string, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message, title, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Document State (Shared)
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);

  const addDocument = (doc: Document) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const updateDocument = (updatedDoc: Document) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const updateDocumentStatus = (id: string, status: 'approved' | 'rejected') => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  // Policy State
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES);

  const addPolicy = (policy: Policy) => {
    setPolicies(prev => [policy, ...prev]);
  };

  const updatePolicy = (updatedPolicy: Policy) => {
    setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
  };

  const deletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  // Approval State
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    { id: '1', type: 'Profile Update', user: 'John Doe', detail: 'Changed Address', date: '2 hours ago', status: 'pending' },
    { id: '2', type: 'Document', user: 'Sarah Chen', detail: 'Driver License Upload', date: '5 hours ago', status: 'pending', data: { documentId: 'd2' } },
    { id: '3', type: 'Leave Request', user: 'Marcus Reynolds', detail: 'Annual Leave (5 days)', date: '1 day ago', status: 'pending' },
  ]);

  // Notifications State
  const [allNotifications, setAllNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('nexus_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  // Complaint State (Mock)
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 'c1',
      subject: 'Payroll Discrepancy - October',
      category: 'Payroll',
      priority: 'high',
      status: 'open',
      createdBy: 'u1', // Sarah
      createdByName: 'Sarah Chen',
      createdAt: '2023-11-01T10:00:00',
      updatedAt: '2023-11-01T10:00:00',
      messages: [
        { id: 'm1', senderId: 'u1', senderName: 'Sarah Chen', role: 'staff', content: 'Hi, I noticed a discrepancy in my overtime calculation for October. It seems 4 hours are missing.', timestamp: '10:00 AM' }
      ]
    },
    {
      id: 'c2',
      subject: 'Laptop Overheating',
      category: 'IT',
      priority: 'medium',
      status: 'in-progress',
      createdBy: 'u4', // John
      createdByName: 'John Doe',
      createdAt: '2023-10-28T14:30:00',
      updatedAt: '2023-10-29T09:15:00',
      messages: [
        { id: 'm1', senderId: 'u4', senderName: 'John Doe', role: 'staff', content: 'My laptop fan is running constantly and it gets very hot.', timestamp: 'Oct 28' },
        { id: 'm2', senderId: 'u2', senderName: 'Marcus Reynolds', role: 'hr', content: 'I have forwarded this to IT support. They will contact you shortly.', timestamp: 'Oct 29' }
      ]
    }
  ]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('nexus_notifications', JSON.stringify(allNotifications));
  }, [allNotifications]);

  const userNotifications = user ? allNotifications.filter(n => {
    if (n.targetUserId && n.targetUserId === user.id) return true;
    if (n.targetRole && n.targetRole === user.role) return true;
    if (n.targetRole === 'all') return true;
    if (!n.targetRole && !n.targetUserId) return true;
    return false;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const addNotification = (item: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...item,
      id: `n${Date.now()}`,
      date: 'Just now',
      read: false
    };
    setAllNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setAllNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    if (!user) return;
    setAllNotifications(prev => prev.map(n => {
      const isVisible = (n.targetUserId === user.id) || (n.targetRole === user.role) || (n.targetRole === 'all') || (!n.targetRole && !n.targetUserId);
      return isVisible ? { ...n, read: true } : n;
    }));
  };

  const addApproval = (item: Omit<ApprovalItem, 'id' | 'date' | 'status'>) => {
    const newItem: ApprovalItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      date: 'Just now',
      status: 'pending'
    };
    setApprovals(prev => [newItem, ...prev]);
    addNotification({
      title: 'New Approval Request',
      message: `${item.user} submitted a ${item.type}`,
      type: 'info',
      targetRole: 'hr'
    });
  };

  const processApproval = (id: string, status: 'approved' | 'rejected' | 'partially_approved', fieldStatuses?: Record<string, 'approved' | 'rejected'>) => {
    setApprovals(prev => prev.map(item => {
      if (item.id === id) {

        // If this is a document approval, update the document status as well
        if (item.type === 'Document' && item.data?.documentId) {
          updateDocumentStatus(item.data.documentId, status as 'approved' | 'rejected');
        }

        const targetUser = MOCK_USERS.find(u => `${u.firstName} ${u.surname}` === item.user);
        if (targetUser) {
          addNotification({
            title: `Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your ${item.type} has been ${status}.`,
            type: status === 'approved' ? 'success' : 'alert',
            targetUserId: targetUser.id
          });
        }
        return { ...item, status, fieldStatuses };
      }
      return item;
    }));
  };

  const createComplaint = (subject: string, category: Complaint['category'], priority: Complaint['priority']) => {
    if (!user) return;
    const newComplaint: Complaint = {
      id: `c${Date.now()}`,
      subject,
      category,
      priority,
      status: 'open',
      createdBy: user.id,
      createdByName: `${user.firstName} ${user.surname}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setComplaints(prev => [newComplaint, ...prev]);
    addNotification({
      title: 'New Support Ticket',
      message: `${user.firstName} created a ticket: ${subject}`,
      type: 'warning',
      targetRole: 'hr'
    });
  };

  const sendMessage = (complaintId: string, content: string) => {
    if (!user) return;
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: user.id,
      senderName: `${user.firstName} ${user.surname}`,
      role: user.role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setComplaints(prev => prev.map(c =>
      c.id === complaintId
        ? { ...c, messages: [...c.messages, newMessage], updatedAt: new Date().toISOString() }
        : c
    ));

    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
      if (user.role !== 'staff') {
        addNotification({
          title: 'New Reply on Ticket',
          message: `New reply on ticket: ${complaint.subject}`,
          type: 'info',
          targetUserId: complaint.createdBy
        });
      }
    }
  };

  const updateStatus = (complaintId: string, status: Complaint['status']) => {
    setComplaints(prev => prev.map(c =>
      c.id === complaintId ? { ...c, status } : c
    ));

    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
      addNotification({
        title: 'Ticket Status Updated',
        message: `Ticket "${complaint.subject}" is now ${status}`,
        type: 'info',
        targetUserId: complaint.createdBy
      });
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('nexus_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: Role) => {
    setIsLoading(true);
    setTimeout(() => {
      const foundUser = MOCK_USERS.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('nexus_user', JSON.stringify(foundUser));
        toast('success', `Welcome back, ${foundUser.firstName}!`);
      } else {
        const demoUser = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
        setUser(demoUser);
        localStorage.setItem('nexus_user', JSON.stringify(demoUser));
        toast('success', `Welcome back, ${demoUser.firstName}! (Demo Access)`);
      }
      setIsLoading(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
    toast('info', 'You have been signed out.');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        <ToastContext.Provider value={{ toast }}>
          <NotificationContext.Provider value={{ notifications: userNotifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
            <DocumentContext.Provider value={{ documents, addDocument, updateDocument, updateDocumentStatus }}>
              <PolicyContext.Provider value={{ policies, addPolicy, updatePolicy, deletePolicy }}>
                <ApprovalContext.Provider value={{ approvals, addApproval, processApproval }}>
                  <ComplaintContext.Provider value={{ complaints, createComplaint, sendMessage, updateStatus }}>
                    <Router>
                      <AppContent />
                      <ToastContainer toasts={toasts} removeToast={removeToast} />
                    </Router>
                  </ComplaintContext.Provider>
                </ApprovalContext.Provider>
              </PolicyContext.Provider>
            </DocumentContext.Provider>
          </NotificationContext.Provider>
        </ToastContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}