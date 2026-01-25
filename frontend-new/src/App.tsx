import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "@/lib/api/queryClient";
import { AuthProvider } from "@/contexts/auth";
import { SidebarProvider } from "@/contexts/sidebar";
import { routes } from "@/routes";

/**
 * Routes component using useRoutes hook
 * Renders the route configuration defined in routes/index.tsx
 */
function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

/**
 * Main Application Component
 *
 * Provider hierarchy:
 * 1. QueryClientProvider - React Query for server state
 * 2. AuthProvider - Authentication context (depends on QueryClient)
 * 3. SidebarProvider - Sidebar state management
 * 4. Router - React Router for navigation
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <AppRoutes />
          </Router>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </SidebarProvider>
      </AuthProvider>

      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
