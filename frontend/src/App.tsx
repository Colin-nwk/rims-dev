import { BrowserRouter as Router, Routes, Route, Navigate, useRoutes } from 'react-router-dom';
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
import { ToastProvider } from './providers/ToastProvider';
import { productionRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
// import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider


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
// export const useToast = useDemoToast; // REPLACED by global useToast
export const useAuth = useDemoAuth;
export const useNotifications = useDemoNotifications;
export const useDocuments = useDemoDocuments;
export const usePolicies = useDemoPolicies;
export const useApprovals = useDemoApprovals;
export const useComplaints = useDemoComplaints;

// Export global hooks
export { useToast } from './providers/ToastProvider';

/**
 * Production routes component using useRoutes hook
 */
function ProductionRoutes() {
  const routes = useRoutes(productionRoutes);
  return routes;
}

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>

        <ToastProvider>
          <Router>
            <Routes>
              {/* Demo routes - preserved for reference during migration */}
              <Route path="/demo/*" element={<DemoApp />} />

              {/* Production routes */}
              <Route path="/*" element={<ProductionRoutes />} />

              {/* Default redirect - change this once production is ready */}
              <Route path="/" element={<Navigate to="/demo" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}