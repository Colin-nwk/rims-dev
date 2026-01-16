import { Outlet } from 'react-router-dom';

/**
 * Layout for authentication pages (login, register, forgot-password)
 * Provides a centered, minimal layout without navigation
 */
export function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md px-4">
                <Outlet />
            </div>
        </div>
    );
}
