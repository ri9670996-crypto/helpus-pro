import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    DollarSign, 
    TrendingUp, 
    Users, 
    Wallet, 
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    Activity
} from 'lucide-react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { userService } from '../../services/user';
import { formatCurrency, formatBDT, generateReferralLink } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BalanceCard from '../../components/dashboard/BalanceCard';
import StatsCard from '../../components/dashboard/StatsCard';
import QuickActions from '../../components/dashboard/QuickActions';

const DashboardContainer = styled.div`
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
`;

const DashboardHeader = styled.div`
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

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr 1fr;
    }
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Section = styled.section`
    margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
`;

const ReferralSection = styled(Card)`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    h3, p {
        color: white;
    }
`;

const ReferralCode = styled.div`
    background: rgba(255, 255, 255, 0.2);
    padding: 12px 16px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 18px;
    font-weight: 600;
    margin: 16px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const RecentActivity = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ActivityItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    
    .icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        
        &.success {
            color: #28a745;
        }
        
        &.warning {
            color: #ffc107;
        }
        
        &.info {
            color: #17a2b8;
        }
    }
    
    .content {
        flex: 1;
        
        .title {
            font-weight: 600;
            margin: 0 0 4px 0;
        }
        
        .description {
            font-size: 12px;
            color: #6c757d;
            margin: 0;
        }
    }
    
    .amount {
        font-weight: 600;
        
        &.positive {
            color: #28a745;
        }
        
        &.negative {
            color: #dc3545;
        }
    }
`;

const Dashboard = () => {
    const { user } = useAuth();
    const { setLoading, setError } = useApp();
    const [dashboardData, setDashboardData] = useState(null);
    const [investmentPlans, setInvestmentPlans] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        fetchInvestmentPlans();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const result = await userService.getDashboard();
            if (result.success) {
                setDashboardData(result.data);
            } else {
                setError(result.message || 'Failed to load dashboard data');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while fetching dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchInvestmentPlans = async () => {
        try {
            const result = await userService.getInvestmentPlans();
            if (result.success) {
                setInvestmentPlans(result.plans);
            }
        } catch (error) {
            console.error('Failed to fetch investment plans:', error);
        }
    };

    const copyReferralLink = async () => {
        if (user?.referral_code) {
            const link = generateReferralLink(user.referral_code);
            await navigator.clipboard.writeText(link);
            alert('Referral link copied to clipboard!');
        }
    };

    if (!dashboardData) {
        return (
            <DashboardContainer>
                <div>Loading dashboard...</div>
            </DashboardContainer>
        );
    }

    const { user: userData, stats } = dashboardData;

    // Mock recent activities (replace with actual data from API)
    const recentActivities = [
        {
            id: 1,
            type: 'investment',
            title: 'Investment Made',
            description: 'Starter Plan - $10',
            amount: '+৳70',
            amountType: 'positive',
            icon: <TrendingUp size={20} />,
            iconType: 'success',
            date: new Date().toISOString()
        },
        {
            id: 2,
            type: 'profit',
            title: 'Daily Profit',
            description: 'From active investments',
            amount: '+৳270',
            amountType: 'positive',
            icon: <DollarSign size={20} />,
            iconType: 'success',
            date: new Date().toISOString()
        },
        {
            id: 3,
            type: 'withdrawal',
            title: 'Withdrawal Request',
            description: 'Pending approval',
            amount: '-৳1000',
            amountType: 'negative',
            icon: <ArrowDownLeft size={20} />,
            iconType: 'warning',
            date: new Date().toISOString()
        }
    ];

    return (
        <DashboardContainer>
            <DashboardHeader>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Welcome back, {userData.username}! 👋
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Here's your investment overview and quick actions.
                </motion.p>
            </DashboardHeader>

            {/* Balance Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <DashboardGrid>
                    <BalanceCard
                        title="USD Balance"
                        amount={userData.balance_usd}
                        currency="USD"
                        icon={<DollarSign size={24} />}
                        trend="stable"
                    />
                    <BalanceCard
                        title="BDT Balance"
                        amount={userData.balance_bdt}
                        currency="BDT"
                        icon={<Wallet size={24} />}
                        trend="up"
                    />
                    <BalanceCard
                        title="Total Invested"
                        amount={userData.total_invested_usd}
                        currency="USD"
                        icon={<TrendingUp size={24} />}
                        trend="up"
                    />
                    <BalanceCard
                        title="Total Earned"
                        amount={userData.total_earned_bdt}
                        currency="BDT"
                        icon={<Activity size={24} />}
                        trend="up"
                    />
                </DashboardGrid>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <QuickActions user={userData} />
            </motion.div>

            {/* Stats Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Section>
                    <SectionTitle>Investment Overview</SectionTitle>
                    <DashboardGrid>
                        <StatsCard
                            title="Active Investments"
                            value={stats.active_investments}
                            subtitle="Total active plans"
                            icon={<TrendingUp size={20} />}
                            color="#28a745"
                        />
                        <StatsCard
                            title="Active Investment"
                            value={formatCurrency(stats.active_investment_usd)}
                            subtitle="Currently invested"
                            icon={<DollarSign size={20} />}
                            color="#17a2b8"
                        />
                        <StatsCard
                            title="Today's Profit"
                            value={formatBDT(stats.today_profit)}
                            subtitle="Daily earnings"
                            icon={<ArrowUpRight size={20} />}
                            color="#ffc107"
                        />
                        <StatsCard
                            title="Total Commission"
                            value={formatBDT(stats.total_commission)}
                            subtitle="Referral earnings"
                            icon={<Users size={20} />}
                            color="#dc3545"
                        />
                    </DashboardGrid>
                </Section>
            </motion.div>

            {/* Referral Section */}
            {userData.referral_code && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Section>
                        <SectionTitle>Referral Program</SectionTitle>
                        <ReferralSection>
                            <Card.Header>
                                <CardTitle>Invite Friends & Earn</CardTitle>
                                <CardSubtitle>
                                    Share your referral code and earn commissions from your friends' investments
                                </CardSubtitle>
                            </Card.Header>
                            <Card.Body>
                                <p>Your Personal Referral Code:</p>
                                <ReferralCode>
                                    <span>{userData.referral_code}</span>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={copyReferralLink}
                                    >
                                        Copy Link
                                    </Button>
                                </ReferralCode>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <h4>Level 1 Commission</h4>
                                        <p>10% of friend's investment</p>
                                    </div>
                                    <div>
                                        <h4>Level 2 Commission</h4>
                                        <p>5% of friend's friend investment</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </ReferralSection>
                    </Section>
                </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Section>
                    <SectionTitle>Recent Activity</SectionTitle>
                    <Card>
                        <Card.Body>
                            <RecentActivity>
                                {recentActivities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <ActivityItem>
                                            <div className={`icon ${activity.iconType}`}>
                                                {activity.icon}
                                            </div>
                                            <div className="content">
                                                <div className="title">{activity.title}</div>
                                                <div className="description">{activity.description}</div>
                                            </div>
                                            <div className={`amount ${activity.amountType}`}>
                                                {activity.amount}
                                            </div>
                                        </ActivityItem>
                                    </motion.div>
                                ))}
                            </RecentActivity>
                        </Card.Body>
                    </Card>
                </Section>
            </motion.div>
        </DashboardContainer>
    );
};

export default Dashboard;