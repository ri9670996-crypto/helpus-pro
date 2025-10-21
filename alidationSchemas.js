import { body, param, query } from 'express-validator';

// Auth validation schemas
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const emailVerificationValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
];

// Investment validation schemas
export const createInvestmentValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('plan')
    .isIn(['basic', 'premium', 'vip'])
    .withMessage('Invalid investment plan'),
  body('duration')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days')
];

export const updateInvestmentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid investment ID'),
  body('status')
    .optional()
    .isIn(['active', 'paused', 'cancelled'])
    .withMessage('Invalid status')
];

// Withdrawal validation schemas
export const createWithdrawalValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('method')
    .isIn(['bank', 'crypto', 'paypal'])
    .withMessage('Invalid withdrawal method'),
  body('walletAddress')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Wallet address must be at least 10 characters long')
];

// Profile validation schemas
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

export const updatePreferencesValidation = [
  body('notifications')
    .optional()
    .isObject()
    .withMessage('Notifications must be an object'),
  body('language')
    .optional()
    .isIn(['en', 'bn'])
    .withMessage('Language must be either English or Bengali')
];

// Admin validation schemas
export const updateUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('status')
    .optional()
    .isIn(['active', 'suspended', 'banned'])
    .withMessage('Invalid status'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'superadmin'])
    .withMessage('Invalid role')
];

export const updateWithdrawalStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid withdrawal ID'),
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'processing'])
    .withMessage('Invalid withdrawal status'),
  body('adminNote')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin note must be less than 500 characters')
];

// Query parameter validations
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Export all validations
export default {
  auth: {
    register: registerValidation,
    login: loginValidation,
    forgotPassword: forgotPasswordValidation,
    resetPassword: resetPasswordValidation,
    emailVerification: emailVerificationValidation
  },
  investment: {
    create: createInvestmentValidation,
    update: updateInvestmentValidation
  },
  withdrawal: {
    create: createWithdrawalValidation
  },
  user: {
    updateProfile: updateProfileValidation,
    changePassword: changePasswordValidation,
    updatePreferences: updatePreferencesValidation
  },
  admin: {
    updateUser: updateUserValidation,
    updateWithdrawalStatus: updateWithdrawalStatusValidation
  },
  query: {
    pagination: paginationValidation
  }
};