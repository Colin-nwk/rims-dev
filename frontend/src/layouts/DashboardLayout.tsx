import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components';
// import { Header } from './components/Header';

/**
 * Main dashboard layout with sidebar and header
 * Used for authenticated pages
 */
export function DashboardLayout() {
    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
