import { APP_CONFIG } from './constants';

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    });
    return formatter.format(amount);
};

// Format BDT currency
export const formatBDT = (amount) => {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2
    }).format(amount);
};

// Shorten address for display
export const shortenAddress = (address, chars = 6) => {
    if (!address) return '';
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
};

// Validate BEP20 address
export const isValidBEP20 = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Get user's BEP20 address or default
export const getBEP20Address = (user) => {
    return user?.bep20_address || APP_CONFIG.DEFAULT_BEP20;
};

// Format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Generate referral link
export const generateReferralLink = (referralCode) => {
    return `${window.location.origin}/register?ref=${referralCode}`;
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};