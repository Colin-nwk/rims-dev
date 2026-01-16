import { MainLayout } from '@/layouts/MainLayout';
import { authService } from '@/services/authService';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { authService } from '../../services/authService';

interface ProtectedRouteProps {
    redirectTo?: string;
}

/**
 * Wrapper for routes that require authentication
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({ redirectTo = '/login' }: ProtectedRouteProps) {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // return (
    //     <MainLayout>
    //     <Outlet />
    //     </MainLayout>);

    return <Outlet />;
}

/**
 * Wrapper for guest-only routes (login, register, etc.)
 * Redirects to dashboard if already authenticated
 */
export function GuestRoute({ redirectTo = '/dashboard' }: ProtectedRouteProps) {
    const isAuthenticated = authService.isAuthenticated();

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}
