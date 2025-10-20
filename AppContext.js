import React, { createContext, useContext, useReducer } from 'react';

// App context
const AppContext = createContext();

// App actions
const APP_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_SUCCESS: 'SET_SUCCESS',
    CLEAR_MESSAGE: 'CLEAR_MESSAGE'
};

// App reducer
const appReducer = (state, action) => {
    switch (action.type) {
        case APP_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload,
                error: null,
                success: null
            };
        case APP_ACTIONS.SET_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: null
            };
        case APP_ACTIONS.SET_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                success: action.payload
            };
        case APP_ACTIONS.CLEAR_MESSAGE:
            return {
                ...state,
                error: null,
                success: null
            };
        default:
            return state;
    }
};

// Initial state
const initialState = {
    loading: false,
    error: null,
    success: null
};

// App provider component
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Set loading
    const setLoading = (loading) => {
        dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading });
    };

    // Set error
    const setError = (error) => {
        dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error });
    };

    // Set success
    const setSuccess = (success) => {
        dispatch({ type: APP_ACTIONS.SET_SUCCESS, payload: success });
    };

    // Clear messages
    const clearMessages = () => {
        dispatch({ type: APP_ACTIONS.CLEAR_MESSAGE });
    };

    const value = {
        ...state,
        setLoading,
        setError,
        setSuccess,
        clearMessages
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use app context
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};