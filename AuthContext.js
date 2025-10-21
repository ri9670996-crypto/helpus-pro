
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Auth context
const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    UPDATE_USER: 'UPDATE_USER',
    SET_LOADING: 'SET_LOADING'
};

// Auth reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN:
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false
            };
        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload }
            };
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };
        default:
            return state;
    }
};

// Initial state
const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true
};

// Mock auth service functions
const authService = {
    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    },
    
    isAdminAuthenticated: () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role === 'admin' || user.role === 'super_admin';
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    
    getToken: () => {
        return localStorage.getItem('token');
    },
    
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            try {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN,
                    payload: {
                        token,
                        user: JSON.parse(user)
                    }
                });
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }, []);

    // Login function
    const login = async (user, token) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            dispatch({
                type: AUTH_ACTIONS.LOGIN,
                payload: { user, token }
            });
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    };

    // Update user function
    const updateUser = (userData) => {
        try {
            const updatedUser = { ...state.user, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            dispatch({
                type: AUTH_ACTIONS.UPDATE_USER,
                payload: userData
            });
            return { success: true };
        } catch (error) {
            console.error('Update user error:', error);
            return { success: false, error: error.message };
        }
    };

    // Check authentication status
    const checkAuth = () => {
        return authService.isAuthenticated();
    };

    // Check admin authentication
    const checkAdminAuth = () => {
        return authService.isAdminAuthenticated();
    };

    const value = {
        // State
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        loading: state.loading,
        
        // Actions
        login,
        logout,
        updateUser,
        checkAuth,
        checkAdminAuth,
        
        // Service functions
        authService
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export auth service for use in other files
export { authService };
export default AuthContext;