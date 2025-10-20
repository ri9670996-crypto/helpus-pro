import api from './api';

// User services
export const userService = {
    // Get user dashboard
    getDashboard: async () => {
        return await api.get('/user/dashboard');
    },

    // Update user profile
    updateProfile: async (profileData) => {
        return await api.post('/user/profile/update', profileData);
    },

    // Make investment
    makeInvestment: async (investmentData) => {
        return await api.post('/user/invest', investmentData);
    },

    // Request withdrawal
    requestWithdrawal: async (withdrawalData) => {
        return await api.post('/user/withdraw', withdrawalData);
    },

    // Get investment plans
    getInvestmentPlans: async () => {
        return await api.get('/plans');
    },

    // Get user investments
    getUserInvestments: async (userId) => {
        return await api.get(`/user/investments/${userId}`);
    },

    // Get user withdrawals
    getUserWithdrawals: async (userId) => {
        return await api.get(`/user/withdrawals/${userId}`);
    },

    // Get user commissions
    getUserCommissions: async (userId) => {
        return await api.get(`/user/commissions/${userId}`);
    }
};

// Admin services
export const adminService = {
    // Get admin dashboard
    getDashboard: async () => {
        return await api.get('/admin/dashboard');
    },

    // Get all users
    getUsers: async () => {
        return await api.get('/admin/users');
    },

    // Get user details
    getUserDetails: async (userId) => {
        return await api.get(`/admin/users/${userId}`);
    },

    // Update user status
    updateUserStatus: async (userData) => {
        return await api.post('/admin/users/update-status', userData);
    },

    // Get pending withdrawals
    getPendingWithdrawals: async () => {
        return await api.get('/admin/withdrawals/pending');
    },

    // Update withdrawal status
    updateWithdrawalStatus: async (withdrawalData) => {
        return await api.post('/admin/withdrawals/update', withdrawalData);
    }
};