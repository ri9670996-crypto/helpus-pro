import React, { useState, useEffect } from 'react.js';
import { motion } from 'framer-motion.js';
import { 
    Save, 
    RefreshCw, 
    Shield, 
    DollarSign, 
    Users,
    Bell,
    Globe,
    Database,
    Mail,
    CreditCard,
    Smartphone
} from 'lucide-react.js';
import styled from 'styled-components.js';
import { useApp } from '../../contexts/AppContext.js';
import { adminService } from '../../services/user.js';
import Card from '../../components/ui/Card.js';
import Button from '../../components/ui/Button.js';
import Input from '../../components/ui/Input.js';
import Switch from '../../components/ui/Switch.js';

// Styled Components - আপনার আগের স্টাইল মেনে
const SettingsContainer = styled.div`
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
`;

const PageHeader = styled.div`
    margin-bottom: 32px;
    
    h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 700;
        color: #333;
    }
    
    p {
        margin: 0;
        color: #6c757d;
        font-size: 16px;
    }
`;

const SettingsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 24px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const SettingsContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const SettingsSidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SettingsSection = styled(Card)`
    .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
        
        .section-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0;
        }
        
        .section-description {
            font-size: 14px;
            color: #6c757d;
            margin: 0;
        }
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    label {
        font-size: 14px;
        font-weight: 600;
        color: #333;
    }
    
    .form-hint {
        font-size: 12px;
        color: #6c757d;
        margin-top: 4px;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
`;

const QuickStats = styled(Card)`
    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
            border-bottom: none;
        }
        
        .stat-label {
            font-size: 14px;
            color: #6c757d;
        }
        
        .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
    }
`;

const SystemStatus = styled(Card)`
    .status-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
            border-bottom: none;
        }
        
        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            
            &.online {
                background: #28a745;
            }
            
            &.offline {
                background: #dc3545;
            }
            
            &.warning {
                background: #ffc107;
            }
        }
        
        .status-info {
            flex: 1;
            
            .status-label {
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
            
            .status-description {
                font-size: 12px;
                color: #6c757d;
            }
        }
    }
`;

// Main Settings Component
const AdminSettings = () => {
    const { setLoading, setError, setSuccess } = useApp();
    const [settings, setSettings] = useState({
        // General Settings
        siteName: 'HelpUs Investment',
        siteDescription: 'Professional investment platform',
        adminEmail: 'admin@helpus-investment.com',
        supportPhone: '+8801700000000',
        
        // Investment Settings
        minInvestment: 10,
        maxInvestment: 10000,
        dailyProfitRate: 15,
        referralCommission: 5,
        
        // Payment Settings
        usdtWallet: '0x742d35Cc6634C0532925a3b8D4B',
        bep20Network: 'BSC Mainnet',
        minWithdrawal: 5,
        maxWithdrawal: 5000,
        
        // Security Settings
        twoFactorAuth: true,
        autoLogout: 30,
        loginAttempts: 5,
        maintenanceMode: false,
        
        // Notification Settings
        emailNotifications: true,
        smsNotifications: false,
        profitAlerts: true,
        withdrawalAlerts: true
    });

    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Mock API call - আপনার actual API দিয়ে replace করবেন
            const result = await adminService.getSettings();
            if (result.success) {
                setSettings(result.data);
            }
        } catch (error) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        setHasChanges(true);
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const result = await adminService.updateSettings(settings);
            if (result.success) {
                setSuccess('Settings saved successfully');
                setHasChanges(false);
            } else {
                setError(result.message || 'Failed to save settings');
            }
        } catch (error) {
            setError('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings?')) {
            loadSettings();
            setHasChanges(false);
        }
    };

    const systemStats = {
        totalUsers: 1250,
        activeInvestments: 890,
        pendingWithdrawals: 23,
        todayProfit: 12500,
        systemUptime: '99.9%',
        serverLoad: '45%'
    };

    return (
        <SettingsContainer>
            {/* Page Header */}
            <PageHeader>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    System Settings
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Manage your platform configuration and preferences
                </motion.p>
            </PageHeader>

            <SettingsGrid>
                {/* Main Settings Content */}
                <SettingsContent>
                    {/* General Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <SettingsSection>
                            <div className="section-header">
                                <div className="section-icon">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h3 className="section-title">General Settings</h3>
                                    <p className="section-description">Basic platform configuration</p>
                                </div>
                            </div>

                            <FormGrid>
                                <FormGroup>
                                    <label>Site Name</label>
                                    <Input
                                        value={settings.siteName}
                                        onChange={(e) => handleSettingChange('siteName', e.target.value)}
                                        placeholder="Enter site name"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Admin Email</label>
                                    <Input
                                        type="email"
                                        value={settings.adminEmail}
                                        onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                                        placeholder="admin@example.com"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Support Phone</label>
                                    <Input
                                        value={settings.supportPhone}
                                        onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                                        placeholder="+8801700000000"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Site Description</label>
                                    <Input
                                        value={settings.siteDescription}
                                        onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                                        placeholder="Platform description"
                                    />
                                </FormGroup>
                            </FormGrid>
                        </SettingsSection>
                    </motion.div>

                    {/* Investment Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <SettingsSection>
                            <div className="section-header">
                                <div className="section-icon">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <h3 className="section-title">Investment Settings</h3>
                                    <p className="section-description">Configure investment parameters</p>
                                </div>
                            </div>

                            <FormGrid>
                                <FormGroup>
                                    <label>Minimum Investment (USD)</label>
                                    <Input
                                        type="number"
                                        value={settings.minInvestment}
                                        onChange={(e) => handleSettingChange('minInvestment', parseFloat(e.target.value))}
                                    />
                                    <div className="form-hint">Minimum amount users can invest</div>
                                </FormGroup>

                                <FormGroup>
                                    <label>Maximum Investment (USD)</label>
                                    <Input
                                        type="number"
                                        value={settings.maxInvestment}
                                        onChange={(e) => handleSettingChange('maxInvestment', parseFloat(e.target.value))}
                                    />
                                    <div className="form-hint">Maximum amount users can invest</div>
                                </FormGroup>

                                <FormGroup>
                                    <label>Daily Profit Rate (%)</label>
                                    <Input
                                        type="number"
                                        value={settings.dailyProfitRate}
                                        onChange={(e) => handleSettingChange('dailyProfitRate', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                    <div className="form-hint">Daily profit percentage</div>
                                </FormGroup>

                                <FormGroup>
                                    <label>Referral Commission (%)</label>
                                    <Input
                                        type="number"
                                        value={settings.referralCommission}
                                        onChange={(e) => handleSettingChange('referralCommission', parseFloat(e.target.value))}
                                        step="0.1"
                                    />
                                    <div className="form-hint">Commission for referrals</div>
                                </FormGroup>
                            </FormGrid>
                        </SettingsSection>
                    </motion.div>

                    {/* Payment Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <SettingsSection>
                            <div className="section-header">
                                <div className="section-icon">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h3 className="section-title">Payment Settings</h3>
                                    <p className="section-description">Configure payment methods and limits</p>
                                </div>
                            </div>

                            <FormGrid>
                                <FormGroup>
                                    <label>USDT Wallet Address</label>
                                    <Input
                                        value={settings.usdtWallet}
                                        onChange={(e) => handleSettingChange('usdtWallet', e.target.value)}
                                        placeholder="0x..."
                                    />
                                    <div className="form-hint">BEP20 wallet for deposits</div>
                                </FormGroup>

                                <FormGroup>
                                    <label>Minimum Withdrawal (USD)</label>
                                    <Input
                                        type="number"
                                        value={settings.minWithdrawal}
                                        onChange={(e) => handleSettingChange('minWithdrawal', parseFloat(e.target.value))}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Maximum Withdrawal (USD)</label>
                                    <Input
                                        type="number"
                                        value={settings.maxWithdrawal}
                                        onChange={(e) => handleSettingChange('maxWithdrawal', parseFloat(e.target.value))}
                                    />
                                </FormGroup>
                            </FormGrid>
                        </SettingsSection>
                    </motion.div>

                    {/* Security Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <SettingsSection>
                            <div className="section-header">
                                <div className="section-icon">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h3 className="section-title">Security Settings</h3>
                                    <p className="section-description">Platform security configuration</p>
                                </div>
                            </div>

                            <FormGrid>
                                <FormGroup>
                                    <label>Two-Factor Authentication</label>
                                    <Switch
                                        checked={settings.twoFactorAuth}
                                        onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                                        label="Enable 2FA for admin"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Maintenance Mode</label>
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                                        label="Put site in maintenance"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Auto Logout (minutes)</label>
                                    <Input
                                        type="number"
                                        value={settings.autoLogout}
                                        onChange={(e) => handleSettingChange('autoLogout', parseInt(e.target.value))}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Max Login Attempts</label>
                                    <Input
                                        type="number"
                                        value={settings.loginAttempts}
                                        onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                                    />
                                </FormGroup>
                            </FormGrid>
                        </SettingsSection>
                    </motion.div>

                    {/* Save Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <Card>
                            <ActionButtons>
                                <Button
                                    variant="secondary"
                                    onClick={handleResetSettings}
                                    disabled={isSaving}
                                >
                                    <RefreshCw size={16} />
                                    Reset Changes
                                </Button>
                                
                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={isSaving || !hasChanges}
                                    loading={isSaving}
                                >
                                    <Save size={16} />
                                    Save Settings
                                </Button>
                            </ActionButtons>
                        </Card>
                    </motion.div>
                </SettingsContent>

                {/* Sidebar */}
                <SettingsSidebar>
                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <QuickStats>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                                Platform Stats
                            </h4>
                            
                            <div className="stat-item">
                                <span className="stat-label">Total Users</span>
                                <span className="stat-value">{systemStats.totalUsers}</span>
                            </div>
                            
                            <div className="stat-item">
                                <span className="stat-label">Active Investments</span>
                                <span className="stat-value">{systemStats.activeInvestments}</span>
                            </div>
                            
                            <div className="stat-item">
                                <span className="stat-label">Pending Withdrawals</span>
                                <span className="stat-value">{systemStats.pendingWithdrawals}</span>
                            </div>
                            
                            <div className="stat-item">
                                <span className="stat-label">Today's Profit</span>
                                <span className="stat-value">${systemStats.todayProfit}</span>
                            </div>
                        </QuickStats>
                    </motion.div>

                    {/* System Status */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <SystemStatus>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                                System Status
                            </h4>
                            
                            <div className="status-item">
                                <div className="status-indicator online"></div>
                                <div className="status-info">
                                    <div className="status-label">Web Server</div>
                                    <div className="status-description">Running smoothly</div>
                                </div>
                            </div>
                            
                            <div className="status-item">
                                <div className="status-indicator online"></div>
                                <div className="status-info">
                                    <div className="status-label">Database</div>
                                    <div className="status-description">Connected</div>
                                </div>
                            </div>
                            
                            <div className="status-item">
                                <div className="status-indicator warning"></div>
                                <div className="status-info">
                                    <div className="status-label">Payment Gateway</div>
                                    <div className="status-description">Processing delays</div>
                                </div>
                            </div>
                            
                            <div className="status-item">
                                <div className="status-indicator online"></div>
                                <div className="status-info">
                                    <div className="status-label">API Services</div>
                                    <div className="status-description">All systems operational</div>
                                </div>
                            </div>
                        </SystemStatus>
                    </motion.div>
                </SettingsSidebar>
            </SettingsGrid>
        </SettingsContainer>
    );
};

export default AdminSettings;