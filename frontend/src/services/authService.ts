import { apiClient } from '../lib/api';
import { ApiResponse } from '../lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refresh_token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    
    // Store tokens
    if (response.data.data) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('refresh_token', response.data.data.refresh_token);
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  },

  async me(): Promise<ApiResponse<AuthUser>> {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<ApiResponse<{ token: string; refresh_token: string }>> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await apiClient.post<ApiResponse<{ token: string; refresh_token: string }>>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    );

    if (response.data.data) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('refresh_token', response.data.data.refresh_token);
    }

    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};
