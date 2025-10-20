-- HelpUs Pro Database Setup
CREATE DATABASE IF NOT EXISTS helpus_pro;
USE helpus_pro;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    referral_code VARCHAR(10) UNIQUE,
    referred_by INT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    bep20_address VARCHAR(255) NULL,
    bkash_number VARCHAR(20),
    balance_usd DECIMAL(15,2) DEFAULT 0.00,
    balance_bdt DECIMAL(15,2) DEFAULT 0.00,
    total_invested_usd DECIMAL(15,2) DEFAULT 0.00,
    total_earned_bdt DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('active','inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phone (phone),
    INDEX idx_referral_code (referral_code),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    investment_usd DECIMAL(15,2) NOT NULL,
    daily_profit_bdt DECIMAL(15,2) NOT NULL,
    status ENUM('active', 'completed') DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount_bdt DECIMAL(15,2) NOT NULL,
    method ENUM('bkash', 'bep20') NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Profits Table
CREATE TABLE IF NOT EXISTS profits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    investment_id INT NOT NULL,
    amount_bdt DECIMAL(15,2) NOT NULL,
    profit_date DATE NOT NULL,
    status ENUM('credited') DEFAULT 'credited',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_profit_date (profit_date),
    UNIQUE KEY unique_daily_profit (user_id, investment_id, profit_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
);

-- Commissions Table
CREATE TABLE IF NOT EXISTS commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    from_user_id INT NOT NULL,
    investment_id INT NOT NULL,
    level INT NOT NULL,
    amount_bdt DECIMAL(15,2) NOT NULL,
    status ENUM('credited') DEFAULT 'credited',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_from_user_id (from_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
);

-- Deposits Table
CREATE TABLE IF NOT EXISTS deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount_usd DECIMAL(15,2) NOT NULL,
    transaction_hash VARCHAR(255),
    bep20_address VARCHAR(255) NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    permissions JSON,
    status ENUM('active','inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_status (status)
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Admin (password: admin123)
INSERT IGNORE INTO admin_users (username, password, role, permissions) 
VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0g8f/sOc7sC2ZmjCcR5NpUV4jQY7W8lW59n4Gi', 'super_admin', 
        '["users", "investments", "withdrawals", "profits", "settings", "reports"]');

-- Insert Investment Plans
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('investment_plans', '[{"id":1,"usd":10,"daily_profit_bdt":70,"name":"Starter Plan"},{"id":2,"usd":50,"daily_profit_bdt":200,"name":"Basic Plan"},{"id":3,"usd":100,"daily_profit_bdt":400,"name":"Standard Plan"},{"id":4,"usd":200,"daily_profit_bdt":800,"name":"Premium Plan"},{"id":5,"usd":500,"daily_profit_bdt":2000,"name":"Professional Plan"},{"id":6,"usd":1000,"daily_profit_bdt":4000,"name":"Executive Plan"},{"id":7,"usd":2000,"daily_profit_bdt":8000,"name":"Elite Plan"},{"id":8,"usd":5000,"daily_profit_bdt":20000,"name":"Royal Plan"}]', 'Investment plans configuration'),

('commission_rates', '{"10":{"level1":100,"level2":50},"50":{"level1":200,"level2":100},"100":{"level1":400,"level2":200},"200":{"level1":800,"level2":400},"500":{"level1":2000,"level2":1000},"1000":{"level1":4000,"level2":2000},"2000":{"level1":8000,"level2":4000},"5000":{"level1":20000,"level2":10000}}', 'Commission rates configuration'),

('system_config', '{"default_bep20":"0x2269ce1f94e6e2ab5ac933adae12e37ceba2a5cf","min_withdrawal":500,"max_withdrawal":25000,"auto_profit_calculation":true}', 'System configuration');

-- User Activities Log Table
CREATE TABLE IF NOT EXISTS user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);