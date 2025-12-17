import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  CheckSquare,
  UserCircle,
  MessageSquare,
  Moon,
  Sun,
  BookOpen,
  Search,
  ChevronDown,
  HelpCircle,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  Layers
} from 'lucide-react';
import { User } from '../types';
import { cn } from './ui/Components';
import { useNotifications, useTheme } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  pendingApprovals?: number;
}

const NavigationItem = ({ 
  to, 
  icon: Icon, 
  label, 
  onClick, 
  badge,
  isCollapsed 
}: { 
  to: string; 
  icon: React.ElementType; 
  label: string; 
  onClick?: () => void; 
  badge?: number;
  isCollapsed: boolean;
}) => (
  <NavLink
    to={to}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={({ isActive }) =>
      cn(
        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden",
        isCollapsed ? "justify-center" : "justify-between",
        isActive
          ? "bg-navy-800 text-gold-400 shadow-md shadow-navy-900/10"
          : "text-slate-400 hover:bg-navy-800/50 hover:text-slate-200"
      )
    }
  >
    {({ isActive }) => (
      <>
        <div className={cn("flex items-center gap-3 relative z-10", isCollapsed && "justify-center")}>
          <Icon className={cn("w-5 h-5 transition-colors shrink-0", isActive ? "text-gold-500" : "text-slate-500 group-hover:text-slate-300")} />
          {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
        </div>
        {!isCollapsed && badge !== undefined && badge > 0 && (
          <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900 relative z-10">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {isCollapsed && badge !== undefined && badge > 0 && (
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full"></span>
        )}
        {isActive && <div className="absolute inset-y-0 left-0 w-1 bg-gold-500 rounded-r-full" />}
      </>
    )}
  </NavLink>
);

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, pendingApprovals = 0 }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (path.includes('staff-dashboard')) return 'Dashboard';
    if (!path) return 'Dashboard';
    const mainSection = path.split('/')[0];
    return mainSection.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex transition-colors duration-200 font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy-950/80 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-navy-900 text-white transform transition-all duration-300 ease-in-out border-r border-navy-800 shadow-2xl flex flex-col",
          // Mobile vs Desktop widths and visibility
          isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          "lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:scrollbar-hide", 
          isCollapsed ? "lg:w-20" : "lg:w-72" 
        )}
      >
        {/* Logo Area */}
        <div className={cn("h-16 flex items-center border-b border-navy-800 transition-all duration-300 shrink-0", isCollapsed ? "justify-center px-0" : "px-6 justify-between")}>
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-navy-900 font-bold text-xl shadow-lg border-2 border-gold-500 shrink-0">
              <span className="text-navy-600">N</span>
            </div>
            {!isCollapsed && (
               <span className="text-2xl font-medium tracking-tight text-slate-100 whitespace-nowrap overflow-hidden transition-all duration-300">NCoS</span>
            )}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          {!isCollapsed && (
             <div className="mb-4 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans transition-opacity duration-300">
               Staff Module
             </div>
          )}
          
          <NavigationItem to="/staff-dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
          <NavigationItem to="/policies" icon={BookOpen} label="Policies" onClick={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
          <NavigationItem to="/documents" icon={FileText} label="Documents" onClick={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
          <NavigationItem to="/complaints" icon={MessageSquare} label="Help Desk" onClick={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
          
          {/* Role Based Links */}
          {(user.role === 'hr' || user.role === 'admin') && (
            <>
               {!isCollapsed && (
                  <div className="mt-8 mb-4 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans animate-in fade-in">
                    Management
                  </div>
               )}
               {isCollapsed && <div className="h-4"></div>}
               <NavigationItem to="/staff" icon={Users} label="Staff Directory" onClick={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
               <NavigationItem 
                 to="/approvals" 
                 icon={CheckSquare} 
                 label="Approvals" 
                 badge={pendingApprovals}
                 onClick={() => setIsSidebarOpen(false)} 
                 isCollapsed={isCollapsed}
               />
            </>
          )}

          {user.role === 'admin' && (
            <>
               {!isCollapsed && (
                  <div className="mt-8 mb-4 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans animate-in fade-in">
                    System
                  </div>
               )}
               {isCollapsed && <div className="h-4"></div>}
               <NavigationItem to="/settings" icon={Settings} label="Settings" onClick={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
            </>
          )}

           {/* App Switcher */}
            {!isCollapsed && (
                  <div className="mt-8 mb-4 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans animate-in fade-in">
                    Navigation
                  </div>
            )}
            {isCollapsed && <div className="h-4"></div>}
            <NavigationItem to="/components" icon={Layers} label="Components" onClick={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
            <NavigationItem to="/" icon={LayoutGrid} label="All Modules" onClick={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
        </nav>
        
        {/* Sidebar Footer / Collapse Toggle */}
        <div className="p-4 border-t border-navy-800 hidden lg:flex justify-center shrink-0">
             <button 
                onClick={toggleCollapse}
                className="p-2 text-slate-500 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
             >
                {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
             </button>
        </div>

        {/* Mobile Logout */}
         <div className="p-4 border-t border-navy-800 lg:hidden shrink-0">
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-navy-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Modern Top Header */}
        <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-navy-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-navy-800 sticky top-0 z-30 flex items-center justify-between gap-4 transition-all duration-200 supports-backdrop-filter:bg-white/60">
          
          {/* Left: Mobile Toggle & Title */}
          <div className="flex items-center gap-4 lg:gap-8 min-w-0">
            <button 
              onClick={toggleSidebar}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg font-semibold text-navy-900 dark:text-white truncate hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex items-center max-w-md w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-gold-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-10 py-2 border border-slate-200 dark:border-navy-700 rounded-xl leading-5 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 focus:bg-white dark:focus:bg-navy-800 sm:text-sm transition-all duration-200"
              placeholder="Search..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-400 text-xs font-mono bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-sm px-1.5 py-0.5 shadow-xs">⌘K</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Search Icon (Mobile) */}
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-full transition-colors">
               <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-gold-600 dark:text-slate-400 dark:hover:text-gold-400 hover:bg-gold-50 dark:hover:bg-navy-800 rounded-full transition-all duration-200"
                aria-label="Toggle Theme"
            >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
                <button 
                  className={cn(
                    "relative p-2 rounded-full transition-all duration-200",
                    isNotificationsOpen 
                      ? "bg-gold-50 text-gold-600 dark:bg-navy-800 dark:text-gold-400" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white"
                  )}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-navy-950 animate-pulse"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-navy-800 rounded-2xl shadow-xl shadow-navy-900/10 border border-slate-100 dark:border-navy-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-4 border-b border-slate-50 dark:border-navy-700 flex justify-between items-center bg-slate-50/50 dark:bg-navy-800/50 backdrop-blur-xs">
                            <h3 className="font-semibold text-navy-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                  onClick={markAllAsRead}
                                  className="text-xs text-gold-600 hover:text-gold-700 dark:text-gold-500 dark:hover:text-gold-400 font-medium px-2 py-1 rounded-sm hover:bg-gold-50 dark:hover:bg-navy-700 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-navy-700 rounded-full flex items-center justify-center mb-3">
                                        <Bell className="w-6 h-6 opacity-40" />
                                    </div>
                                    <p className="text-sm font-medium">All caught up!</p>
                                    <p className="text-xs mt-1">No new notifications to show.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50 dark:divide-navy-700">
                                    {notifications.map((notification) => (
                                        <div 
                                          key={notification.id} 
                                          onClick={() => markAsRead(notification.id)}
                                          className={`p-4 hover:bg-slate-50 dark:hover:bg-navy-700/50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-blue-50/30 dark:bg-navy-700/30' : ''}`}
                                        >
                                            <div className={cn(
                                                "w-2 h-2 mt-2 rounded-full shrink-0 transition-colors",
                                                !notification.read ? "bg-gold-500 shadow-xs shadow-gold-500/50" : "bg-slate-200 dark:bg-navy-600"
                                            )}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={cn(
                                                        "text-sm truncate pr-2",
                                                        !notification.read ? "font-semibold text-navy-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">{notification.date}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notification.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 dark:bg-navy-700 hidden sm:block"></div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
               <button
                 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                 className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 border border-transparent hover:border-slate-200 dark:hover:border-navy-700 transition-all duration-200 group"
               >
                 <div className="relative">
                    <img 
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.surname}&background=fbbf24&color=0f172a`} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-navy-700 shadow-xs object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className={cn(
                        "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-navy-900",
                        user.status === 'active' ? "bg-emerald-500" : "bg-amber-500"
                    )}></span>
                 </div>
                 
                 <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-navy-900 dark:text-white leading-none">{user.firstName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize mt-0.5">{user.role}</span>
                 </div>
                 <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block", isUserMenuOpen ? "rotate-180" : "")} />
               </button>

               {/* Dropdown Menu */}
               {isUserMenuOpen && (
                 <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-navy-800 rounded-xl shadow-xl shadow-navy-900/10 border border-slate-100 dark:border-navy-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/50">
                        <p className="text-sm font-bold text-navy-900 dark:text-white">{user.firstName} {user.surname}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                        <button 
                            onClick={() => { navigate('/profile'); setIsUserMenuOpen(false); }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700/50 rounded-lg transition-colors"
                        >
                            <UserCircle className="w-4 h-4" /> My Profile
                        </button>
                         <button 
                            onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700/50 rounded-lg transition-colors"
                        >
                            <Settings className="w-4 h-4" /> Settings
                        </button>
                        <button 
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700/50 rounded-lg transition-colors"
                        >
                            <CreditCard className="w-4 h-4" /> Billing
                        </button>
                         <button 
                             onClick={() => { navigate('/'); setIsUserMenuOpen(false); }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700/50 rounded-lg transition-colors"
                        >
                            <LayoutGrid className="w-4 h-4" /> Switch Module
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-navy-700 my-1 mx-2"></div>
                         <button 
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700/50 rounded-lg transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" /> Help Center
                        </button>
                         <button 
                            onClick={onLogout}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                 </div>
               )}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};