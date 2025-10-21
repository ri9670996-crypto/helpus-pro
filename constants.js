// Application Constants
export const APP_CONFIG = {
    APP_NAME: process.env.REACT_APP_APP_NAME || 'HelpUs Investment',
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    DEFAULT_BEP20: process.env.REACT_APP_DEFAULT_BEP20 || '0x2269ce1f94e6e2ab5ac933adae12e37ceba2a5cf'
};

export const CURRENCY = {
    USD: 'USD',
    BDT: 'BDT'
};

export const WITHDRAWAL_METHODS = {
    BKASH: 'bkash',
    BEP20: 'bep20'
};

export const INVESTMENT_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed'
};

export const WITHDRAWAL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};