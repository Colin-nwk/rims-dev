import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "@/lib/api/queryClient";
import AdminLogin from "@/pages/auth/AdminLogin";

/**
 * Main Application Component
 * Sets up providers and routing structure
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Routes - Add your dashboard and other routes here */}
          {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/admin-login" replace />} />

          {/* 404 Not Found */}
          <Route path="*" element={<Navigate to="/admin-login" replace />} />
        </Routes>
      </Router>

      {/* Toast Container - handles all toast notifications */}
      <ToastContainer />

      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
