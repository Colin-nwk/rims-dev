import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL;

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor - inject auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle 401 - clear tokens and redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("auth_token");
      window.location.href = "/staff-login";
    }

    // Format error for consistent handling
    const apiError: ApiError = {
      message:
        error.response?.data?.message || error.message || "An error occurred",
      errors: error.response?.data?.errors,
      status: error.response?.status || 500,
    };

    return Promise.reject(apiError);
  },
);

// Helper to get full URL for uploaded files
export const getFileUrl = (path: string | null | undefined): string => {
  if (!path) return "";

  // If already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Get base URL without /api/v1
  const baseUrl = BASE_URL.replace("/api/v1", "");

  // Prepend storage path
  return `${baseUrl}/storage/${path}`;
};

// Helper to convert image URL to base64
export const imageUrlToBase64 = async (
  url: string | null | undefined,
): Promise<string> => {
  if (!url) return "";

  try {
    const fullUrl = getFileUrl(url);
    const response = await fetch(fullUrl, {
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Failed to fetch image:", response.statusText);
      return "";
    }

    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return "";
  }
};

export { apiClient };
