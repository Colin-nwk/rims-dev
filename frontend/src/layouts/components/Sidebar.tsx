import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, Settings, LogOut } from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/staff', icon: Users, label: 'Staff' },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xl font-bold text-slate-900 dark:text-white">RIMS</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
