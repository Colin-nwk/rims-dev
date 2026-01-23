// src/contexts/AuthContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useAuthUser } from '../hooks/useAuth';
import { StaffUser, AdminUser, authService } from '../services/authService';

interface AuthContextType {
    user: (StaffUser | AdminUser) | null | undefined;
    isLoading: boolean;
    isAuthenticated: boolean;
    isStaff: boolean;
    isAdmin: boolean;
    permissions: string[];
    roles: string[];
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: user, isLoading } = useAuthUser();

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: authService.isAuthenticated(),
                isStaff: authService.isStaff(),
                isAdmin: authService.isAdmin(),
                permissions: authService.getPermissions(),
                roles: authService.getRoles(),
                hasPermission: authService.hasPermission.bind(authService),
                hasRole: authService.hasRole.bind(authService),
                hasAnyPermission: authService.hasAnyPermission.bind(authService),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useProductionAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}