
import { apiClient } from '../lib/api';
import { ApiResponse } from '../lib/api';

export interface LoginRequest {
  service_no: string;
  password: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

// Base user fields that both types share
interface BaseUser {
  id: number;
  email?: string;
  status?: number;
  created_at: string;
  updated_at: string;
}

// Staff-specific fields
export interface StaffUser extends BaseUser {
  service_no: string;
  phone_number: string | null;
  assigned_state: string | null;
  prison: string | null;
  surname: string;
  first_name: string;
  other_names: string;
  sex: string;
  initial_rank: string;
  present_rank: string;
  level: number;
  step: number | null;
  dob: string;
  date_of_first_appointment: string;
  present_appointment_date: string | null;
  command_post_date: string | null;
  initial_command: string | null;
  present_command: string | null;
  state_of_origin: string;
  lga: string;
  department: string;
  file_no: string;
  duty: string;
  description: string;
  photo: string | null;
  last_login: string | null;
  is_verified: number;
  zone_id: number | null;
  retirement_date_formatted: string;
  is_retired: boolean;
  retirement_time_remaining: {
    status: string;
    years: number;
    months: number;
    days: number;
    human_readable: string;
  };
}

// Admin-specific fields
export interface AdminUser extends BaseUser {
  name: string;
  email_verified_at: string;
}

// Single login response structure
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: StaffUser | AdminUser;
  roles: string[];
  permissions: string[];
}

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this._handleLogin('/staff/login', credentials);
  },

  async adminLogin(credentials: AdminLoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this._handleLogin('/user/login', credentials);
  },

  async _handleLogin(endpoint: string, credentials: LoginRequest | AdminLoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(endpoint, credentials);
    
    if (response.data.data) {
      const { access_token, user, roles, permissions } = response.data.data;
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('permissions', JSON.stringify(permissions));
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.clear();
    }
  },

  getUser(): (StaffUser | AdminUser) | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  },

  getPermissions(): string[] {
    const perms = localStorage.getItem('permissions');
    return perms ? JSON.parse(perms) : [];
  },

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  },

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  },

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.some(p => userPermissions.includes(p));
  },

  isStaff(): boolean {
    const user = this.getUser();
    return user ? 'service_no' in user : false;
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user ? 'name' in user && !('service_no' in user) : false;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getDisplayName(user: StaffUser | AdminUser | null | undefined): string {
    if (!user) return '';
    if ('service_no' in user) {
      return `${user.first_name} ${user.surname}`;
    }
    // AdminUser has 'name'
    return (user as AdminUser).name || ''; 
  },
};


/*
* ----- TODO: OLD ------*
 * 
*/

// import { apiClient } from '../lib/api';
// import { ApiResponse } from '../lib/api';

// export interface LoginRequest {
//   service_no: string;
//   password: string;
// }

// export interface AdminLoginRequest {
//   email: string;
//   password: string;
// }
// export interface LoginResponse {
//   user: {
//     id: string;
//     email: string;
//     name: string;
//     role: string;
//   };
//   token: string;
//   refresh_token: string;
// }

// export interface AuthUser {
//   id: string;
//   email: string;
//   name: string;
//   role: string;
// }

// export const authService = {
//   async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
//     const response = await apiClient.post<ApiResponse<LoginResponse>>('/staff/login', credentials);
    
//     // Store tokens
//     if (response.data.data) {
//       localStorage.setItem('auth_token', response.data.data.token);
//       localStorage.setItem('refresh_token', response.data.data.refresh_token);
//     }
    
//     return response.data;
//   },


//    async adminLogin(credentials: AdminLoginRequest): Promise<ApiResponse<LoginResponse>> {
//     const response = await apiClient.post<ApiResponse<LoginResponse>>('/user/login', credentials);
    
//     // Store tokens
//     if (response.data.data) {
//       localStorage.setItem('auth_token', response.data.data.token);
//       localStorage.setItem('refresh_token', response.data.data.refresh_token);
//     }
    
//     return response.data;
//   },

//   async logout(): Promise<void> {
//     try {
//       await apiClient.post('/auth/logout');
//     } finally {
//       localStorage.removeItem('auth_token');
//       localStorage.removeItem('refresh_token');
//     }
//   },

//   async me(): Promise<ApiResponse<AuthUser>> {
//     const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
//     return response.data;
//   },

//   async refreshToken(): Promise<ApiResponse<{ token: string; refresh_token: string }>> {
//     const refreshToken = localStorage.getItem('refresh_token');
//     const response = await apiClient.post<ApiResponse<{ token: string; refresh_token: string }>>(
//       '/auth/refresh',
//       { refresh_token: refreshToken }
//     );

//     if (response.data.data) {
//       localStorage.setItem('auth_token', response.data.data.token);
//       localStorage.setItem('refresh_token', response.data.data.refresh_token);
//     }

//     return response.data;
//   },

//   isAuthenticated(): boolean {
//     return !!localStorage.getItem('auth_token');
//   },
// };

