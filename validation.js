import * as yup from 'yup';

// Phone validation for Bangladesh
export const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;

// Validation schemas
export const loginSchema = yup.object({
    phone: yup
        .string()
        .matches(phoneRegex, 'Please enter a valid Bangladeshi phone number')
        .required('Phone number is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
});

export const registerSchema = yup.object({
    username: yup
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
        .required('Username is required'),
    phone: yup
        .string()
        .matches(phoneRegex, 'Please enter a valid Bangladeshi phone number')
        .required('Phone number is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    full_name: yup
        .string()
        .max(100, 'Full name must be less than 100 characters'),
    email: yup
        .string()
        .email('Please enter a valid email address'),
    referral_code: yup
        .string()
        .max(10, 'Referral code must be less than 10 characters')
});

export const profileSchema = yup.object({
    full_name: yup
        .string()
        .max(100, 'Full name must be less than 100 characters'),
    email: yup
        .string()
        .email('Please enter a valid email address'),
    bkash_number: yup
        .string()
        .matches(phoneRegex, 'Please enter a valid Bangladeshi phone number'),
    bep20_address: yup
        .string()
        .test('bep20-format', 'Invalid BEP20 address format', (value) => {
            if (!value) return true; // Optional field
            return /^0x[a-fA-F0-9]{40}$/.test(value);
        })
});

export const withdrawalSchema = yup.object({
    amount_bdt: yup
        .number()
        .typeError('Amount must be a number')
        .min(500, 'Minimum withdrawal amount is 500 BDT')
        .max(25000, 'Maximum withdrawal amount is 25,000 BDT')
        .required('Amount is required'),
    method: yup
        .string()
        .oneOf(['bkash', 'bep20'], 'Please select a valid withdrawal method')
        .required('Withdrawal method is required'),
    account_number: yup
        .string()
        .required('Account number is required')
});

export const depositSchema = yup.object({
    amount_usd: yup
        .number()
        .typeError('Amount must be a number')
        .min(10, 'Minimum deposit amount is 10 USD')
        .required('Amount is required'),
    transaction_hash: yup
        .string()
        .matches(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format')
        .required('Transaction hash is required')
});