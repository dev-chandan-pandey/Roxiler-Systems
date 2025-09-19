import axios from 'axios';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: "http://localhost:10000/api",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.Authorization;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.client.post('/auth/login', { email, password });
  }

  async register(userData) {
    return this.client.post('/auth/register', userData);
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  async updatePassword(currentPassword, newPassword) {
    return this.client.put('/auth/password', { currentPassword, newPassword });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.client.get('/admin/dashboard');
  }

  async addUser(userData) {
    return this.client.post('/admin/users', userData);
  }

  async addStore(storeData) {
    return this.client.post('/admin/stores', storeData);
  }

  async getUsers(filters = {}) {
    return this.client.get('/admin/users', { params: filters });
  }

  async getStores(filters = {}) {
    return this.client.get('/admin/stores', { params: filters });
  }

  async getUserDetails(userId) {
    return this.client.get(`/admin/users/${userId}`);
  }

  // User endpoints
  async getUserStores(filters = {}) {
    return this.client.get('/user/stores', { params: filters });
  }

  async submitRating(storeId, rating) {
    return this.client.post(`/user/stores/${storeId}/rating`, { rating });
  }

  // Store owner endpoints
  async getStoreOwnerDashboard() {
    return this.client.get('/store/dashboard');
  }

  async getStoreRaters(filters = {}) {
    return this.client.get('/store/raters', { params: filters });
  }
}

export const api = new ApiService();
