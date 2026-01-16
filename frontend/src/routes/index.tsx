import { RouteObject } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from './guards';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '@/layouts';
import StaffLogin from '@/features/auth/StaffLogin';
import AdminLogin from '@/features/auth/AdminLogin';
// import { DashboardLayout } from '../layouts/DashboardLayout';

// Lazy load pages for code splitting
// import { lazy } from 'react';
// const Dashboard = lazy(() => import('../pages/production/Dashboard'));
// const Login = lazy(() => import('../pages/production/Login'));

/**
 * Production application routes
 * 
 * Structure:
 * - Guest routes (login, register, forgot-password)
 * - Protected routes (dashboard, settings, etc.)
 */
export const productionRoutes: RouteObject[] = [
    // Guest routes - redirect to dashboard if authenticated

    {
        path: '/login',
        element: <StaffLogin />
    },
    {
        path: '/admin/login',
        element: <AdminLogin />
    },
    // {
    //     element: <GuestRoute />,
    //     children: [
    //         {
    //             element: <AuthLayout />,
    //             children: [
    //                 // { path: '/login', element: <Login /> },
    //                 // { path: '/register', element: <Register /> },
    //                 // { path: '/forgot-password', element: <ForgotPassword /> },
    //                 // { path: '/reset-password', element: <ResetPassword /> },
    //             ],
    //         },
    //     ],
    // },

    // Protected routes - redirect to login if not authenticated
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    // { path: '/dashboard', element: <Dashboard /> },
                    // { path: '/profile', element: <Profile /> },
                    // { path: '/settings', element: <Settings /> },

                    // Staff management
                    // { path: '/staff', element: <StaffList /> },
                    // { path: '/staff/:id', element: <StaffDetail /> },

                    // Documents
                    // { path: '/documents', element: <Documents /> },
                    // { path: '/documents/:id', element: <DocumentDetail /> },
                ],
            },
        ],
    },
];
