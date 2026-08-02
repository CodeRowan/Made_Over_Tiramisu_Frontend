/**
 * API Client Service
 *
 * Handles all HTTP requests to the backend API.
 * Automatically attaches JWT token to requests.
 * Handles common errors and redirects to login if unauthorized.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://made-over-tiramisu-backend.vercel.app/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Automatically adds JWT token to every request
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 * Handles errors and redirects to login on 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

/**
 * Public client — deliberately has NO auth interceptor.
 *
 * The admin panel and the public site are the same bundle sharing the same
 * browser storage, so if the shared `apiClient` were used for public reads,
 * an admin who's logged in would silently send their token on every public
 * page load too. The backend then treats them as an admin and returns
 * EVERYTHING — including items toggled Hidden — because that's exactly the
 * behavior the admin panel needs. Public-facing components must use this
 * client instead, so the site always shows the true public view regardless
 * of whether the visitor's browser also has an admin session.
 */
const publicClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public-facing reads for the landing page — never carries an admin token
export const publicAPI = {
  getContentSection: (section: string) => publicClient.get(`/content/${section}`),
  getProducts: (limit = 50, skip = 0) =>
    publicClient.get('/products', { params: { limit, skip } }),
  getTestimonials: () => publicClient.get('/testimonials'),
  getInstagramPosts: () => publicClient.get('/instagram'),
  getLocations: () => publicClient.get('/locations'),
  submitContact: (data: { name: string; email: string; phone?: string; message: string }) =>
    publicClient.post('/contact', data),
};

/**
 * API service methods
 */

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword, confirmPassword }),
};

// Products
export const productsAPI = {
  getAll: (limit = 10, skip = 0) =>
    apiClient.get('/products', { params: { limit, skip } }),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: any) => apiClient.post('/products', data),
  update: (id: string, data: any) =>
    apiClient.put(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  search: (query: string) =>
    apiClient.get('/products/search', { params: { q: query } }),
};

// Content
export const contentAPI = {
  getAll: () => apiClient.get('/content'),
  getSection: (section: string) =>
    apiClient.get(`/content/${section}`),
  updateSection: (section: string, data: any) =>
    apiClient.put(`/content/${section}`, data),
  initialize: () => apiClient.post('/content/init'),
};

// Contact Messages
export const contactAPI = {
  submit: (data: { name: string; email: string; phone?: string; message: string }) =>
    apiClient.post('/contact', data),
  getAll: (limit = 10, skip = 0) =>
    apiClient.get('/contact', { params: { limit, skip } }),
  getById: (id: string) => apiClient.get(`/contact/${id}`),
  getUnreadCount: () => apiClient.get('/contact/stats/unread'),
  markAsRead: (id: string) =>
    apiClient.put(`/contact/${id}/read`),
  delete: (id: string) => apiClient.delete(`/contact/${id}`),
};

// Activity Log
export const activityLogAPI = {
  getAll: (limit = 20, skip = 0) =>
    apiClient.get('/activity-log', { params: { limit, skip } }),
  getById: (id: string) => apiClient.get(`/activity-log/${id}`),
  getStats: () => apiClient.get('/activity-log/stats/summary'),
  getAdminLogs: (adminId: string) =>
    apiClient.get(`/activity-log/admin/${adminId}`),
};

// Testimonials
export const testimonialsAPI = {
  getAll: () => apiClient.get('/testimonials'),
  create: (data: any) => apiClient.post('/testimonials', data),
  update: (id: string, data: any) => apiClient.put(`/testimonials/${id}`, data),
  delete: (id: string) => apiClient.delete(`/testimonials/${id}`),
};

// Instagram posts
export const instagramAPI = {
  getAll: () => apiClient.get('/instagram'),
  create: (data: any) => apiClient.post('/instagram', data),
  update: (id: string, data: any) => apiClient.put(`/instagram/${id}`, data),
  delete: (id: string) => apiClient.delete(`/instagram/${id}`),
};

// Locations
export const locationsAPI = {
  getAll: () => apiClient.get('/locations'),
  create: (data: any) => apiClient.post('/locations', data),
  update: (id: string, data: any) => apiClient.put(`/locations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/locations/${id}`),
};

// Upload
export const uploadAPI = {
  uploadImage: (formData: FormData) =>
    apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  uploadMultiple: (formData: FormData) =>
    apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default apiClient;
