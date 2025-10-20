import api from './api';

// Auth services
export const authService = {
    // User registration
    register: async (userData) => {
        const response = await api.post('/register', userData);
        if (response.success && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },

    // User login
    login: async (credentials) => {
        const response = await api.post('/login', credentials);
        if (response.success && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },

    // Admin login
    adminLogin: async (credentials) => {
        const response = await api.post('/admin/login', credentials);
        if (response.success && response.token) {
            localStorage.setItem('adminToken', response.token);
            localStorage.setItem('admin', JSON.stringify(response.admin));
        }
        return response;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/login';
    },

    // Get current user
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Get current admin
    getCurrentAdmin: () => {
        const admin = localStorage.getItem('admin');
        return admin ? JSON.parse(admin) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Check if admin is authenticated
    isAdminAuthenticated: () => {
        return !!localStorage.getItem('adminToken');
    }
};