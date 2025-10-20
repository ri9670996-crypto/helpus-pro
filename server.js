import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Configuration
const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET,
    bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    defaultBEP20: process.env.DEFAULT_BEP20 || '0x2269ce1f94e6e2ab5ac933adae12e37ceba2a5cf'
};

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// Utility Functions
const utils = {
    generateReferralCode: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    
    hashPassword: async (password) => {
        return await bcrypt.hash(password, config.bcryptRounds);
    },
    
    comparePassword: async (password, hash) => {
        return await bcrypt.compare(password, hash);
    },
    
    generateToken: (payload) => {
        return jwt.sign(payload, config.jwtSecret, { 
            expiresIn: process.env.JWT_EXPIRE || '30d' 
        });
    },
    
    verifyToken: (token) => {
        return jwt.verify(token, config.jwtSecret);
    },
    
    isValidBEP20: (address) => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
    
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    formatCurrency: (amount) => {
        return parseFloat(amount).toFixed(2);
    },
    
    getCurrentDate: () => {
        return new Date().toISOString().split('T')[0];
    }
};

// Authentication Middleware
const authMiddleware = {
    authenticateUser: async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. No token provided.'
                });
            }
            
            const decoded = utils.verifyToken(token);
            const [users] = await pool.execute(
                'SELECT id, username, phone, status FROM users WHERE id = ? AND status = "active"',
                [decoded.userId]
            );
            
            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token or user not found.'
                });
            }
            
            req.user = users[0];
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    },
    
    authenticateAdmin: async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. No token provided.'
                });
            }
            
            const decoded = utils.verifyToken(token);
            const [admins] = await pool.execute(
                'SELECT id, username, role, permissions FROM admin_users WHERE id = ? AND status = "active"',
                [decoded.adminId]
            );
            
            if (admins.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token or admin not found.'
                });
            }
            
            req.admin = admins[0];
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    }
};

// ==================== PUBLIC ROUTES ====================

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        await pool.execute('SELECT 1');
        
        res.json({
            success: true,
            message: '🚀 HelpUs Investment Server Running!',
            environment: config.nodeEnv,
            timestamp: new Date().toISOString(),
            database: 'Connected ✅'
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'Server running but database connection failed',
            error: error.message
        });
    }
});

// Get Investment Plans
app.get('/api/plans', async (req, res) => {
    try {
        const [settings] = await pool.execute(
            'SELECT setting_value FROM system_settings WHERE setting_key = "investment_plans"'
        );
        
        if (settings.length === 0) {
            return res.json({ success: false, message: 'No investment plans found' });
        }
        
        const plans = JSON.parse(settings[0].setting_value);
        res.json({ success: true, plans });
    } catch (error) {
        console.error('Plans fetch error:', error);
        res.json({ success: false, message: 'Error fetching investment plans' });
    }
});

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, phone, password, full_name, email, referral_code } = req.body;
        
        // Validation
        if (!username || !phone || !password) {
            return res.json({ 
                success: false, 
                message: 'Username, phone and password are required' 
            });
        }
        
        if (password.length < 6) {
            return res.json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }
        
        if (email && !utils.isValidEmail(email)) {
            return res.json({ 
                success: false, 
                message: 'Please provide a valid email address' 
            });
        }

        const user_referral_code = utils.generateReferralCode();
        const hashedPassword = await utils.hashPassword(password);
        let referred_by = null;

        // Check referral code
        if (referral_code) {
            const [refUsers] = await pool.execute(
                'SELECT id FROM users WHERE referral_code = ?', 
                [referral_code]
            );
            if (refUsers.length > 0) {
                referred_by = refUsers[0].id;
            }
        }

        // Create user
        const [result] = await pool.execute(
            `INSERT INTO users (username, phone, password, referral_code, full_name, email, referred_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, phone, hashedPassword, user_referral_code, full_name, email, referred_by]
        );

        // Generate JWT token
        const token = utils.generateToken({ userId: result.insertId });

        // Log activity
        await pool.execute(
            'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
            [result.insertId, 'registration', 'User registered successfully']
        );

        res.json({ 
            success: true, 
            message: 'Registration successful!',
            token,
            user: {
                id: result.insertId,
                username: username,
                phone: phone,
                referral_code: user_referral_code
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('username')) {
                return res.json({ success: false, message: 'Username already exists' });
            } else if (error.message.includes('phone')) {
                return res.json({ success: false, message: 'Phone number already registered' });
            }
        }
        
        res.json({ 
            success: false, 
            message: 'Registration failed. Please try again.' 
        });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        if (!phone || !password) {
            return res.json({ 
                success: false, 
                message: 'Phone and password are required' 
            });
        }

        const [users] = await pool.execute(
            `SELECT id, username, phone, password, full_name, email, referral_code,
                    balance_usd, balance_bdt, total_invested_usd, total_earned_bdt,
                    bep20_address, bkash_number, status
             FROM users WHERE phone = ? AND status = 'active'`,
            [phone]
        );

        if (users.length === 0) {
            return res.json({ 
                success: false, 
                message: 'Invalid phone number or user inactive' 
            });
        }

        const user = users[0];
        const isValidPassword = await utils.comparePassword(password, user.password);
        
        if (!isValidPassword) {
            return res.json({ 
                success: false, 
                message: 'Invalid password' 
            });
        }

        // Update last login
        await pool.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        // Generate JWT token
        const token = utils.generateToken({ userId: user.id });

        // Log activity
        await pool.execute(
            'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
            [user.id, 'login', 'User logged in successfully']
        );

        res.json({ 
            success: true, 
            message: 'Login successful!', 
            token,
            user: userWithoutPassword 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.json({ 
            success: false, 
            message: 'Login failed. Please try again.' 
        });
    }
});

// ==================== PROTECTED USER ROUTES ====================

// Get User Dashboard
app.get('/api/user/dashboard', authMiddleware.authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user data
        const [users] = await pool.execute(
            `SELECT id, username, phone, full_name, email, referral_code,
                    balance_usd, balance_bdt, total_invested_usd, total_earned_bdt,
                    bep20_address, bkash_number
             FROM users WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        const userBEP20 = user.bep20_address || config.defaultBEP20;

        // Get stats in parallel for better performance
        const [
            [investments],
            [withdrawals],
            [profits],
            [commissions]
        ] = await Promise.all([
            pool.execute(
                `SELECT COUNT(*) as active_investments, 
                        COALESCE(SUM(investment_usd), 0) as active_investment_usd
                 FROM investments WHERE user_id = ? AND status = 'active'`,
                [userId]
            ),
            pool.execute(
                `SELECT COALESCE(SUM(amount_bdt), 0) as pending_withdrawals 
                 FROM withdrawals WHERE user_id = ? AND status = 'pending'`,
                [userId]
            ),
            pool.execute(
                `SELECT COALESCE(SUM(amount_bdt), 0) as today_profit 
                 FROM profits WHERE user_id = ? AND profit_date = CURDATE()`,
                [userId]
            ),
            pool.execute(
                `SELECT COALESCE(SUM(amount_bdt), 0) as total_commission 
                 FROM commissions WHERE user_id = ?`,
                [userId]
            )
        ]);

        const dashboardData = {
            user: {
                id: user.id,
                username: user.username,
                balance_usd: parseFloat(user.balance_usd),
                balance_bdt: parseFloat(user.balance_bdt),
                total_invested_usd: parseFloat(user.total_invested_usd),
                total_earned_bdt: parseFloat(user.total_earned_bdt),
                referral_code: user.referral_code,
                bep20_address: userBEP20,
                bkash_number: user.bkash_number
            },
            stats: {
                active_investments: investments[0].active_investments,
                active_investment_usd: parseFloat(investments[0].active_investment_usd),
                pending_withdrawals: parseFloat(withdrawals[0].pending_withdrawals),
                today_profit: parseFloat(profits[0].today_profit),
                total_commission: parseFloat(commissions[0].total_commission)
            }
        };

        res.json({ success: true, data: dashboardData });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.json({ 
            success: false, 
            message: 'Error fetching dashboard data' 
        });
    }
});

// Update User Profile
app.post('/api/user/profile/update', authMiddleware.authenticateUser, async (req, res) => {
    try {
        const { full_name, email, bkash_number, bep20_address } = req.body;
        const userId = req.user.id;

        // BEP20 address validation
        if (bep20_address && !utils.isValidBEP20(bep20_address)) {
            return res.json({
                success: false,
                message: 'Invalid BEP20 address format'
            });
        }

        // Update user profile
        await pool.execute(`
            UPDATE users 
            SET full_name = ?, email = ?, bkash_number = ?, bep20_address = ?
            WHERE id = ?
        `, [full_name, email, bkash_number, bep20_address || null, userId]);

        // Log activity
        await pool.execute(
            'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
            [userId, 'profile_update', 'User updated profile information']
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.json({
            success: false,
            message: 'Profile update failed'
        });
    }
});

// Make Investment
app.post('/api/user/invest', authMiddleware.authenticateUser, async (req, res) => {
    try {
        const { plan_id } = req.body;
        const userId = req.user.id;

        if (!plan_id) {
            return res.json({ success: false, message: 'Plan ID is required' });
        }

        // Get investment plans
        const [settings] = await pool.execute(
            'SELECT setting_value FROM system_settings WHERE setting_key = "investment_plans"'
        );
        
        if (settings.length === 0) {
            return res.json({ success: false, message: 'No investment plans available' });
        }

        const plans = JSON.parse(settings[0].setting_value);
        const plan = plans.find(p => p.id === parseInt(plan_id));

        if (!plan) {
            return res.json({ success: false, message: 'Invalid investment plan' });
        }

        // Check user balance
        const [users] = await pool.execute(
            'SELECT balance_usd, referred_by FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        const userBalance = parseFloat(users[0].balance_usd);
        const investmentAmount = plan.usd;

        if (userBalance < investmentAmount) {
            return res.json({ 
                success: false, 
                message: 'Insufficient USDT balance for this investment' 
            });
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Deduct from user balance
            await connection.execute(
                `UPDATE users 
                 SET balance_usd = balance_usd - ?, 
                     total_invested_usd = total_invested_usd + ? 
                 WHERE id = ?`,
                [investmentAmount, investmentAmount, userId]
            );

            // Create investment record
            const [investmentResult] = await connection.execute(
                `INSERT INTO investments (user_id, plan_id, investment_usd, daily_profit_bdt, start_date) 
                 VALUES (?, ?, ?, ?, CURDATE())`,
                [userId, plan_id, investmentAmount, plan.daily_profit_bdt]
            );

            // Calculate commissions (to be implemented)
            // await calculateCommissions(userId, users[0].referred_by, investmentAmount, investmentResult.insertId);

            await connection.commit();

            // Log activity
            await pool.execute(
                'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
                [userId, 'investment', `Invested $${investmentAmount} in ${plan.name}`]
            );

            res.json({ 
                success: true, 
                message: 'Investment successful!',
                investment: {
                    id: investmentResult.insertId,
                    investment_usd: investmentAmount,
                    daily_profit_bdt: plan.daily_profit_bdt,
                    plan_name: plan.name
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Investment error:', error);
        res.json({ 
            success: false, 
            message: 'Investment failed. Please try again.' 
        });
    }
});

// Request Withdrawal
app.post('/api/user/withdraw', authMiddleware.authenticateUser, async (req, res) => {
    try {
        const { amount_bdt, method, account_number } = req.body;
        const userId = req.user.id;

        if (!amount_bdt || !method || !account_number) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        const withdrawalAmount = parseFloat(amount_bdt);

        // Get system config
        const [configSettings] = await pool.execute(
            'SELECT setting_value FROM system_settings WHERE setting_key = "system_config"'
        );
        
        const systemConfig = configSettings.length > 0 ? JSON.parse(configSettings[0].setting_value) : {};
        const minWithdrawal = systemConfig.min_withdrawal || 500;
        const maxWithdrawal = systemConfig.max_withdrawal || 25000;

        if (withdrawalAmount < minWithdrawal) {
            return res.json({ 
                success: false, 
                message: `Minimum withdrawal amount is ${minWithdrawal} BDT` 
            });
        }

        if (withdrawalAmount > maxWithdrawal) {
            return res.json({ 
                success: false, 
                message: `Maximum withdrawal amount is ${maxWithdrawal} BDT` 
            });
        }

        // Check user balance
        const [users] = await pool.execute(
            'SELECT balance_bdt FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        const userBalance = parseFloat(users[0].balance_bdt);

        if (userBalance < withdrawalAmount) {
            return res.json({ 
                success: false, 
                message: 'Insufficient BDT balance for withdrawal' 
            });
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Deduct from user balance
            await connection.execute(
                'UPDATE users SET balance_bdt = balance_bdt - ? WHERE id = ?',
                [withdrawalAmount, userId]
            );

            // Create withdrawal request
            const [withdrawalResult] = await connection.execute(
                `INSERT INTO withdrawals (user_id, amount_bdt, method, account_number) 
                 VALUES (?, ?, ?, ?)`,
                [userId, withdrawalAmount, method, account_number]
            );

            await connection.commit();

            // Log activity
            await pool.execute(
                'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
                [userId, 'withdrawal_request', `Requested ${withdrawalAmount} BDT withdrawal via ${method}`]
            );

            res.json({ 
                success: true, 
                message: 'Withdrawal request submitted successfully!',
                withdrawal: {
                    id: withdrawalResult.insertId,
                    amount_bdt: withdrawalAmount,
                    method: method,
                    status: 'pending'
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Withdrawal error:', error);
        res.json({ 
            success: false, 
            message: 'Withdrawal request failed. Please try again.' 
        });
    }
});

// ==================== ADMIN ROUTES ====================

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        const [admins] = await pool.execute(
            'SELECT id, username, password, role, permissions FROM admin_users WHERE username = ? AND status = "active"',
            [username]
        );

        if (admins.length === 0) {
            return res.json({ success: false, message: 'Admin not found' });
        }

        const admin = admins[0];
        const validPassword = await utils.comparePassword(password, admin.password);
        
        if (!validPassword) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        // Update last login
        await pool.execute(
            'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [admin.id]
        );

        const { password: _, ...adminWithoutPassword } = admin;
        const token = utils.generateToken({ adminId: admin.id });

        // Log admin activity
        await pool.execute(
            'INSERT INTO admin_logs (admin_id, action, description) VALUES (?, ?, ?)',
            [admin.id, 'login', 'Admin logged in successfully']
        );

        res.json({ 
            success: true, 
            message: 'Admin login successful!',
            token,
            admin: adminWithoutPassword
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.json({ success: false, message: 'Admin login failed' });
    }
});

// Get Admin Dashboard Stats
app.get('/api/admin/dashboard', authMiddleware.authenticateAdmin, async (req, res) => {
    try {
        const [
            [users],
            [investments],
            [withdrawals],
            [profits]
        ] = await Promise.all([
            pool.execute(`
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_users_today,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
                FROM users
            `),
            pool.execute(`
                SELECT 
                    COUNT(*) as total_investments,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_investments,
                    COALESCE(SUM(investment_usd), 0) as total_investment_usd
                FROM investments
            `),
            pool.execute(`
                SELECT 
                    COUNT(*) as total_withdrawals,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_withdrawals,
                    COALESCE(SUM(amount_bdt), 0) as total_withdrawal_amount
                FROM withdrawals
            `),
            pool.execute(`
                SELECT 
                    COALESCE(SUM(amount_bdt), 0) as total_profits,
                    COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN amount_bdt ELSE 0 END), 0) as today_profits
                FROM profits
            `)
        ]);

        const stats = {
            users: users[0],
            investments: investments[0],
            withdrawals: withdrawals[0],
            profits: profits[0]
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.json({ success: false, message: 'Error fetching admin dashboard' });
    }
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global Error Handler
app.use((error, req, res, next) => {
    console.error('🚨 Unhandled Error:', error);
    
    res.status(500).json({
        success: false,
        message: config.nodeEnv === 'production' 
            ? 'Internal server error' 
            : error.message,
        ...(config.nodeEnv === 'development' && { stack: error.stack })
    });
});

// Start Server
const PORT = config.port;

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 HELPUS INVESTMENT SERVER STARTED!');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🕒 Started: ${new Date().toISOString()}`);
    console.log(`✅ Health: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});