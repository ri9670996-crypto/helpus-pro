-- =============================================
-- HELPUS INVESTMENT PLATFORM - DATABASE MIGRATION
-- =============================================
-- Version: 1.0.0
-- Created: 2024
-- Description: Complete database schema for HelpUs Investment Platform
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `phone` VARCHAR(15) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100),
    `email` VARCHAR(100),
    `referral_code` VARCHAR(10) UNIQUE,
    `referred_by` INT,
    `balance_usd` DECIMAL(15,2) DEFAULT 0.00,
    `balance_bdt` DECIMAL(15,2) DEFAULT 0.00,
    `total_invested_usd` DECIMAL(15,2) DEFAULT 0.00,
    `total_earned_bdt` DECIMAL(15,2) DEFAULT 0.00,
    `bep20_address` VARCHAR(42),
    `bkash_number` VARCHAR(15),
    `nagad_number` VARCHAR(15),
    `bank_account` JSON,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `email_verified` BOOLEAN DEFAULT FALSE,
    `phone_verified` BOOLEAN DEFAULT FALSE,
    `kyc_status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    `last_login` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_phone` (`phone`),
    INDEX `idx_referral` (`referral_code`),
    INDEX `idx_referred_by` (`referred_by`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`referred_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== INVESTMENT PLANS TABLE ====================
CREATE TABLE IF NOT EXISTS `investment_plans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `usd_amount` DECIMAL(15,2) NOT NULL,
    `daily_profit_bdt` DECIMAL(15,2) NOT NULL,
    `monthly_profit_bdt` DECIMAL(15,2) NOT NULL,
    `duration_days` INT DEFAULT 30,
    `profit_percentage` DECIMAL(5,2) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `min_investment` DECIMAL(15,2) DEFAULT 0.00,
    `max_investment` DECIMAL(15,2) DEFAULT 10000.00,
    `features` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_active` (`is_active`),
    INDEX `idx_amount` (`usd_amount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== INVESTMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS `investments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `plan_id` INT NOT NULL,
    `investment_usd` DECIMAL(15,2) NOT NULL,
    `daily_profit_bdt` DECIMAL(15,2) NOT NULL,
    `total_profit_bdt` DECIMAL(15,2) DEFAULT 0.00,
    `current_profit_bdt` DECIMAL(15,2) DEFAULT 0.00,
    `status` ENUM('active', 'completed', 'cancelled', 'pending') DEFAULT 'active',
    `start_date` DATE NOT NULL,
    `end_date` DATE,
    `expected_end_date` DATE NOT NULL,
    `last_profit_date` DATE,
    `transaction_hash` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_plan` (`plan_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_dates` (`start_date`, `end_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`plan_id`) REFERENCES `investment_plans`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== DEPOSITS TABLE ====================
CREATE TABLE IF NOT EXISTS `deposits` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `amount_usd` DECIMAL(15,2) NOT NULL,
    `amount_bdt` DECIMAL(15,2) NOT NULL,
    `transaction_hash` VARCHAR(255) NOT NULL,
    `from_address` VARCHAR(255),
    `to_address` VARCHAR(255) NOT NULL,
    `network` ENUM('bep20', 'erc20', 'trc20') DEFAULT 'bep20',
    `status` ENUM('pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'pending',
    `confirmed_at` TIMESTAMP NULL,
    `admin_notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_transaction` (`transaction_hash`),
    INDEX `idx_created` (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== WITHDRAWALS TABLE ====================
CREATE TABLE IF NOT EXISTS `withdrawals` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `amount_bdt` DECIMAL(15,2) NOT NULL,
    `fee_bdt` DECIMAL(15,2) DEFAULT 0.00,
    `net_amount_bdt` DECIMAL(15,2) NOT NULL,
    `method` ENUM('bkash', 'nagad', 'rocket', 'bank', 'bep20') NOT NULL,
    `account_number` VARCHAR(255) NOT NULL,
    `account_name` VARCHAR(255),
    `transaction_id` VARCHAR(255),
    `status` ENUM('pending', 'approved', 'rejected', 'processing', 'completed') DEFAULT 'pending',
    `admin_notes` TEXT,
    `processed_by` INT,
    `processed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_method` (`method`),
    INDEX `idx_created` (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`processed_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== PROFITS TABLE ====================
CREATE TABLE IF NOT EXISTS `profits` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `investment_id` INT NOT NULL,
    `amount_bdt` DECIMAL(15,2) NOT NULL,
    `profit_date` DATE NOT NULL,
    `type` ENUM('daily', 'bonus', 'referral') DEFAULT 'daily',
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_investment` (`investment_id`),
    INDEX `idx_date` (`profit_date`),
    INDEX `idx_type` (`type`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`investment_id`) REFERENCES `investments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== COMMISSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS `commissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `referred_user_id` INT NOT NULL,
    `investment_id` INT NOT NULL,
    `level` INT NOT NULL,
    `percentage` DECIMAL(5,2) NOT NULL,
    `amount_bdt` DECIMAL(15,2) NOT NULL,
    `investment_amount_usd` DECIMAL(15,2) NOT NULL,
    `status` ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    `paid_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_referred` (`referred_user_id`),
    INDEX `idx_investment` (`investment_id`),
    INDEX `idx_level` (`level`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`referred_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`investment_id`) REFERENCES `investments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== USER ACTIVITIES TABLE ====================
CREATE TABLE IF NOT EXISTS `user_activities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `activity_type` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `metadata` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_type` (`activity_type`),
    INDEX `idx_created` (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== ADMIN USERS TABLE ====================
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` ENUM('super_admin', 'admin', 'moderator', 'support') DEFAULT 'admin',
    `permissions` JSON,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `last_login` TIMESTAMP NULL,
    `created_by` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_username` (`username`),
    INDEX `idx_role` (`role`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SYSTEM SETTINGS TABLE ====================
CREATE TABLE IF NOT EXISTS `system_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) UNIQUE NOT NULL,
    `setting_value` JSON NOT NULL,
    `description` TEXT,
    `is_public` BOOLEAN DEFAULT FALSE,
    `updated_by` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_key` (`setting_key`),
    INDEX `idx_public` (`is_public`),
    FOREIGN KEY (`updated_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== ADMIN LOGS TABLE ====================
CREATE TABLE IF NOT EXISTS `admin_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` INT NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `metadata` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_admin` (`admin_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_created` (`created_at`),
    FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `admin_id` INT,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    `is_read` BOOLEAN DEFAULT FALSE,
    `action_url` VARCHAR(500),
    `sent_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_admin` (`admin_id`),
    INDEX `idx_read` (`is_read`),
    INDEX `idx_type` (`type`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== KYC DOCUMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS `kyc_documents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `document_type` ENUM('nid', 'passport', 'driving_license') NOT NULL,
    `document_number` VARCHAR(100) NOT NULL,
    `front_image` VARCHAR(500),
    `back_image` VARCHAR(500),
    `selfie_image` VARCHAR(500),
    `status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    `verified_by` INT,
    `verified_at` TIMESTAMP NULL,
    `rejection_reason` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_document` (`document_type`, `document_number`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`verified_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SUPPORT TICKETS TABLE ====================
CREATE TABLE IF NOT EXISTS `support_tickets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `ticket_number` VARCHAR(20) UNIQUE NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    `status` ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    `assigned_to` INT,
    `resolved_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_ticket` (`ticket_number`),
    INDEX `idx_status` (`status`),
    INDEX `idx_priority` (`priority`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assigned_to`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TICKET REPLIES TABLE ====================
CREATE TABLE IF NOT EXISTS `ticket_replies` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ticket_id` INT NOT NULL,
    `user_id` INT,
    `admin_id` INT,
    `message` TEXT NOT NULL,
    `attachments` JSON,
    `is_internal` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_ticket` (`ticket_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_admin` (`admin_id`),
    FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS `sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `admin_id` INT,
    `token` VARCHAR(500) NOT NULL,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `last_activity` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_user` (`user_id`),
    INDEX `idx_admin` (`admin_id`),
    INDEX `idx_token` (`token`),
    INDEX `idx_expires` (`expires_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- DEFAULT DATA INSERTION
-- =============================================

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO `admin_users` (`username`, `email`, `password`, `full_name`, `role`, `permissions`) VALUES
('admin', 'admin@helpus.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj89UZome8aC', 'System Administrator', 'super_admin', '["all"]');

-- Insert investment plans
INSERT IGNORE INTO `investment_plans` (`id`, `name`, `description`, `usd_amount`, `daily_profit_bdt`, `monthly_profit_bdt`, `profit_percentage`, `duration_days`, `features`) VALUES
(1, 'Basic Plan', 'Perfect for beginners with small investment', 10.00, 70.00, 2100.00, 7.00, 30, '["Daily Profit", "24/7 Support", "Secure Investment"]'),
(2, 'Silver Plan', 'Medium level investment with good returns', 50.00, 350.00, 10500.00, 7.00, 30, '["Daily Profit", "Priority Support", "Bonus Features"]'),
(3, 'Gold Plan', 'Popular choice for regular investors', 100.00, 400.00, 12000.00, 4.00, 30, '["Daily Profit", "VIP Support", "Special Bonuses"]'),
(4, 'Platinum Plan', 'High return investment plan', 500.00, 2250.00, 67500.00, 4.5, 30, '["Daily Profit", "Dedicated Manager", "Exclusive Features"]'),
(5, 'Diamond Plan', 'Maximum returns for premium investors', 1000.00, 5000.00, 150000.00, 5.00, 30, '["Daily Profit", "Personal Manager", "Premium Support"]');

-- Insert system settings
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `description`, `is_public`) VALUES
('app_config', '{
    "app_name": "HelpUs Investment",
    "app_version": "1.0.0",
    "support_email": "support@helpus.com",
    "support_phone": "+880 XXXX-XXXXXX",
    "company_address": "Dhaka, Bangladesh",
    "copyright_text": "© 2024 HelpUs Investment. All rights reserved."
}', 'Application configuration', true),
('withdrawal_config', '{
    "min_withdrawal_bdt": 500,
    "max_withdrawal_bdt": 25000,
    "withdrawal_fee_bkash": 10,
    "withdrawal_fee_nagad": 10,
    "withdrawal_fee_rocket": 10,
    "withdrawal_fee_bank": 15,
    "withdrawal_fee_bep20": 1,
    "auto_approve_withdrawal": false,
    "withdrawal_processing_time": "24-48 hours"
}', 'Withdrawal system configuration', true),
('deposit_config', '{
    "min_deposit_usd": 10,
    "max_deposit_usd": 10000,
    "default_bep20": "0x2269ce1f94e6e2ab5ac933adae12e37ceba2a5cf",
    "auto_confirm_deposit": false,
    "deposit_confirmation_blocks": 12
}', 'Deposit system configuration', true),
('referral_config', '{
    "level1_commission": 10,
    "level2_commission": 5,
    "level3_commission": 2,
    "min_investment_for_commission": 10,
    "commission_payment_delay": 7
}', 'Referral and commission system', true),
('profit_config', '{
    "profit_calculation_time": "06:00:00",
    "auto_profit_distribution": true,
    "profit_weekends": true,
    "profit_holidays": true
}', 'Profit distribution configuration', false);

-- =============================================
-- DATABASE VIEWS FOR REPORTING
-- =============================================

CREATE OR REPLACE VIEW `user_dashboard_view` AS
SELECT 
    u.id,
    u.username,
    u.phone,
    u.balance_usd,
    u.balance_bdt,
    u.total_invested_usd,
    u.total_earned_bdt,
    COUNT(DISTINCT i.id) as active_investments,
    COALESCE(SUM(i.investment_usd), 0) as total_active_investment,
    COALESCE(SUM(CASE WHEN i.status = 'active' THEN i.daily_profit_bdt ELSE 0 END), 0) as daily_profit,
    COUNT(DISTINCT c.id) as total_referrals,
    COALESCE(SUM(c.amount_bdt), 0) as total_commission
FROM users u
LEFT JOIN investments i ON u.id = i.user_id AND i.status = 'active'
LEFT JOIN commissions c ON u.id = c.user_id
GROUP BY u.id;

CREATE OR REPLACE VIEW `admin_dashboard_view` AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_users_today,
    (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
    (SELECT COUNT(*) FROM investments WHERE status = 'active') as active_investments,
    (SELECT COALESCE(SUM(investment_usd), 0) FROM investments WHERE status = 'active') as total_invested,
    (SELECT COUNT(*) FROM withdrawals WHERE status = 'pending') as pending_withdrawals,
    (SELECT COALESCE(SUM(amount_bdt), 0) FROM withdrawals WHERE status = 'pending') as pending_withdrawal_amount,
    (SELECT COALESCE(SUM(amount_bdt), 0) FROM profits WHERE DATE(created_at) = CURDATE()) as today_profits,
    (SELECT COALESCE(SUM(amount_bdt), 0) FROM commissions WHERE DATE(created_at) = CURDATE()) as today_commissions;

-- =============================================
-- STORED PROCEDURES
-- =============================================

DELIMITER //

-- Procedure to calculate daily profits
CREATE PROCEDURE CalculateDailyProfits()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE investment_id INT;
    DECLARE user_id INT;
    DECLARE daily_profit DECIMAL(15,2);
    
    DECLARE cur CURSOR FOR 
    SELECT i.id, i.user_id, i.daily_profit_bdt 
    FROM investments i 
    WHERE i.status = 'active' 
    AND (i.last_profit_date IS NULL OR i.last_profit_date < CURDATE())
    AND i.start_date <= CURDATE()
    AND (i.end_date IS NULL OR i.end_date >= CURDATE());
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO investment_id, user_id, daily_profit;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert profit record
        INSERT INTO profits (user_id, investment_id, amount_bdt, profit_date, type, description)
        VALUES (user_id, investment_id, daily_profit, CURDATE(), 'daily', 'Daily profit from investment');
        
        -- Update user balance
        UPDATE users 
        SET balance_bdt = balance_bdt + daily_profit,
            total_earned_bdt = total_earned_bdt + daily_profit
        WHERE id = user_id;
        
        -- Update investment last profit date
        UPDATE investments 
        SET last_profit_date = CURDATE(),
            current_profit_bdt = current_profit_bdt + daily_profit,
            total_profit_bdt = total_profit_bdt + daily_profit
        WHERE id = investment_id;
        
    END LOOP;
    
    CLOSE cur;
END//

DELIMITER ;

-- =============================================
-- DATABASE TRIGGERS
-- =============================================

-- Trigger to update user referral code automatically
DELIMITER //

CREATE TRIGGER before_user_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.referral_code IS NULL THEN
        SET NEW.referral_code = UPPER(SUBSTRING(MD5(RAND()), 1, 8));
    END IF;
END//

DELIMITER ;

-- Trigger to generate ticket number
DELIMITER //

CREATE TRIGGER before_ticket_insert
BEFORE INSERT ON support_tickets
FOR EACH ROW
BEGIN
    IF NEW.ticket_number IS NULL THEN
        SET NEW.ticket_number = CONCAT('TKT', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
    END IF;
END//

DELIMITER ;

-- =============================================
-- MIGRATION COMPLETION MESSAGE
-- =============================================

SELECT '✅ HELPUS INVESTMENT DATABASE MIGRATION COMPLETED SUCCESSFULLY!' as message;
SELECT CONCAT('📊 Total Tables Created: ', COUNT(*)) as summary FROM information_schema.tables WHERE table_schema = DATABASE();