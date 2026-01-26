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
