import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DemoApp, {
  useDemoTheme,
  useDemoToast,
  useDemoAuth,
  useDemoNotifications,
  useDemoDocuments,
  useDemoPolicies,
  useDemoApprovals,
  useDemoComplaints,
  type ThemeContextType,
  type ToastContextType,
  type AuthContextType,
  type NotificationContextType,
  type DocumentContextType,
  type PolicyContextType,
  type ApprovalContextType,
  type ComplaintContextType,
} from './DemoApp';
import { QueryProvider } from './providers/QueryProvider';

// Re-export types for backwards compatibility
export type {
  ThemeContextType,
  ToastContextType,
  AuthContextType,
  NotificationContextType,
  DocumentContextType,
  PolicyContextType,
  ApprovalContextType,
  ComplaintContextType,
};

// Re-export demo hooks with original names for backwards compatibility
export const useTheme = useDemoTheme;
export const useToast = useDemoToast;
export const useAuth = useDemoAuth;
export const useNotifications = useDemoNotifications;
export const useDocuments = useDemoDocuments;
export const usePolicies = useDemoPolicies;
export const useApprovals = useDemoApprovals;
export const useComplaints = useDemoComplaints;

// Production app imports will go here as you migrate
// import { ProductionLayout } from './components/ProductionLayout';
// import ProductionDashboard from './pages/production/Dashboard';

export default function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          {/* Demo routes - preserved for reference during migration */}
          <Route path="/demo/*" element={<DemoApp />} />

          {/* Production routes - add your new routes here as you migrate */}
          {/* Example:
          <Route path="/dashboard" element={<ProductionDashboard />} />
          <Route path="/login" element={<ProductionLogin />} />
          */}

          {/* Default redirect - change this to your production home once ready */}
          <Route path="/" element={<Navigate to="/demo" replace />} />

          {/* Catch-all redirect to demo for now */}
          {/* <Route path="*" element={<Navigate to="/demo" replace />} */}
        </Routes>
      </Router>
    </QueryProvider>
  );
}