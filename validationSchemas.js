import { body, param, query } from 'express-validator';

// Auth validation schemas
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('referralCode')
    .optional()
    .isLength({ min: 6, max: 10 })
    .withMessage('Referral code must be between 6 and 10 characters')
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
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

export const emailVerificationValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
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
    .withMessage('Please provide a valid phone number'),
  
  body('country')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('city')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  
  body('dateOfBirth')
    .optional()
    .isDate()
    .withMessage('Please provide a valid date of birth'),
  
  body('language')
    .optional()
    .isIn(['en', 'bn', 'es', 'fr'])
    .withMessage('Language must be one of: en, bn, es, fr'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'BDT', 'INR'])
    .withMessage('Currency must be one of: USD, EUR, GBP, BDT, INR'),
  
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be one of: light, dark, auto')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
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
    .withMessage('Wallet address must be at least 10 characters long'),
  
  body('accountNumber')
    .optional()
    .isLength({ min: 5 })
    .withMessage('Account number must be at least 5 characters long')
];

// User preferences validation
export const updatePreferencesValidation = [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications must be a boolean'),
  
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),
  
  body('language')
    .optional()
    .isIn(['en', 'bn', 'es', 'fr'])
    .withMessage('Language must be either English, Bengali, Spanish, or French')
];

// Admin validation schemas
export const updateUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('status')
    .optional()
    .isIn(['active', 'suspended', 'banned', 'pending'])
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
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string')
    .isLength({ max: 50 })
    .withMessage('Sort field too long'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('Order must be asc, desc, 1, or -1')
];

// File upload validations
export const fileValidation = (fieldName, maxSizeMB = 5, allowedMimeTypes = []) => [
  body(fieldName)
    .optional()
    .custom((value, { req }) => {
      if (!req.file) return true;
      
      // Check file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (req.file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }
      
      // Check MIME type
      if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(req.file.mimetype)) {
        throw new Error(`File type must be one of: ${allowedMimeTypes.join(', ')}`);
      }
      
      return true;
    })
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
  profile: {
    updateProfile: updateProfileValidation,
    changePassword: changePasswordValidation,
    updatePreferences: updatePreferencesValidation
  },
  investment: {
    create: createInvestmentValidation,
    update: updateInvestmentValidation
  },
  withdrawal: {
    create: createWithdrawalValidation
  },
  admin: {
    updateUser: updateUserValidation,
    updateWithdrawalStatus: updateWithdrawalStatusValidation
  },
  query: {
    pagination: paginationValidation
  }
};