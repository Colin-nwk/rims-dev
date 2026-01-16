import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Wallet, Box, ArrowRight, LayoutGrid } from 'lucide-react';
import { useProductionAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/hooks/useAuth';


const ModuleCard = ({ title, description, icon: Icon, onClick, color, active }: any) => (
    <button
        onClick={onClick}
        disabled={!active}
        className={`text-left w-full group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${active
            ? 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 hover:shadow-xl hover:border-gold-500/50 dark:hover:border-gold-500/50 hover:-translate-y-1'
            : 'bg-slate-50 dark:bg-navy-900/50 border-slate-100 dark:border-navy-800 opacity-60 cursor-not-allowed'
            }`}
    >
        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
            <Icon className="w-32 h-32 transform rotate-12 -mr-8 -mt-8" />
        </div>

        <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-lg ${color}`}>
            <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-medium text-navy-900 dark:text-white mb-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
            {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
            {description}
        </p>

        {active && (
            <div className="flex items-center text-sm font-medium text-gold-600 dark:text-gold-500 group-hover:gap-2 transition-all">
                Access Module <ArrowRight className="w-4 h-4 ml-1" />
            </div>
        )}
        {!active && (
            <div className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                Coming Soon
            </div>
        )}
    </button>
);

const Modules = () => {
    const { user, roles, isAdmin, isStaff } = useProductionAuth();
    const { mutate: logout, isPending } = useLogout();
    const navigate = useNavigate();

    // Determine display name based on user type
    const displayName = user
        ? 'name' in user
            ? user.name
            : `${user.first_name} ${user.surname}`
        : '';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-950 p-4 sm:p-8 transition-colors duration-200">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-navy-900 font-bold text-2xl shadow-lg border-2 border-gold-500">
                        N
                    </div>
                    <span className="text-2xl font-medium tracking-tight text-navy-900 dark:text-white">Nigerian Correctional Service</span>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <>
                            <div className="hidden sm:block text-right mr-2">
                                <p className="text-sm font-medium text-navy-900 dark:text-white">{displayName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{roles.join(', ')}</p>
                            </div>
                        </>
                    )}
                    <button
                        onClick={() => logout()}
                        disabled={isPending}
                        className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 ml-2 disabled:opacity-50"
                    >
                        {isPending ? 'Signing Out...' : 'Sign Out'}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                    <h1 className="text-3xl font-medium text-navy-900 dark:text-white">Welcome, {displayName}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Select a module to continue.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
                    <ModuleCard
                        title="Staff Management"
                        description="Complete employee directory, leave management, document handling, and policy center."
                        icon={Users}
                        color="bg-navy-600"
                        active={true}
                        onClick={() => navigate('/staff-dashboard')}
                    />
                    <ModuleCard
                        title="Finance & Payroll"
                        description="Automated payroll processing, tax document generation, expenses, and financial reporting."
                        icon={Wallet}
                        color="bg-emerald-600"
                        active={false}
                    />
                    <ModuleCard
                        title="Assets & Inventory"
                        description="Track company assets, hardware assignment, lifecycle management, and audits."
                        icon={Box}
                        color="bg-purple-600"
                        active={false}
                    />
                    <ModuleCard
                        title="Facilities"
                        description="Office space management, desk booking, visitor logs, and maintenance requests."
                        icon={Building2}
                        color="bg-orange-600"
                        active={false}
                    />
                    <ModuleCard
                        title="Recruitment"
                        description="Applicant tracking system, interview scheduling, and candidate pipelines."
                        icon={LayoutGrid}
                        color="bg-indigo-600"
                        active={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default Modules;