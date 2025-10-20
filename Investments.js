import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    Clock, 
    CheckCircle, 
    DollarSign,
    Plus,
    Calendar,
    Zap,
    Users,
    Target
} from 'lucide-react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { userService } from '../../services/user';
import { formatCurrency, formatBDT } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/common/Modal';

const InvestmentsContainer = styled.div`
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

const HeaderActions = styled.div`
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
`;

const StatCard = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${props => props.color || '#667eea'};
    
    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin-bottom: 4px;
    }
    
    .stat-label {
        font-size: 14px;
        color: #6c757d;
        font-weight: 600;
    }
    
    .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: ${props => props.trend === 'up' ? '#28a745' : '#dc3545'};
        margin-top: 8px;
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

const PlansGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
`;

const PlanCard = styled(motion.div)`
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 2px solid ${props => props.featured ? '#667eea' : 'transparent'};
    position: relative;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
    
    ${props => props.featured && `
        &::before {
            content: '⭐ MOST POPULAR';
            position: absolute;
            top: 12px;
            right: -30px;
            background: #667eea;
            color: white;
            padding: 4px 30px;
            font-size: 10px;
            font-weight: 700;
            transform: rotate(45deg);
            z-index: 1;
        }
    `}
`;

const PlanHeader = styled.div`
    background: linear-gradient(135deg, ${props => props.color} 0%, ${props => props.color}dd 100%);
    color: white;
    padding: 24px;
    text-align: center;
    
    .plan-name {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 8px;
    }
    
    .plan-amount {
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 4px;
    }
    
    .plan-description {
        font-size: 14px;
        opacity: 0.9;
    }
`;

const PlanBody = styled.div`
    padding: 24px;
    
    .feature-list {
        list-style: none;
        padding: 0;
        margin: 0 0 24px 0;
        
        li {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            font-size: 14px;
            color: #555;
            
            svg {
                color: #28a745;
                flex-shrink: 0;
            }
        }
    }
`;

const InvestmentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
`;

const InvestmentCard = styled(Card)`
    .investment-header {
        display: flex;
        justify-content: between;
        align-items: flex-start;
        margin-bottom: 16px;
    }
    
    .investment-amount {
        font-size: 20px;
        font-weight: 700;
        color: #333;
    }
    
    .investment-plan {
        font-size: 14px;
        color: #6c757d;
    }
    
    .investment-status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        
        &.active {
            background: #d4edda;
            color: #155724;
        }
        
        &.completed {
            background: #e2e3e5;
            color: #383d41;
        }
    }
    
    .investment-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 16px 0;
        
        .stat {
            text-align: center;
            
            .value {
                font-size: 18px;
                font-weight: 700;
                color: #333;
            }
            
            .label {
                font-size: 12px;
                color: #6c757d;
            }
        }
    }
    
    .investment-progress {
        margin-top: 16px;
        
        .progress-bar {
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 3px;
                transition: width 0.3s ease;
            }
        }
        
        .progress-text {
            display: flex;
            justify-content: between;
            margin-top: 4px;
            font-size: 12px;
            color: #6c757d;
        }
    }
`;

const ModalContent = styled.div`
    text-align: center;
    
    .plan-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin: 0 auto 20px;
    }
    
    .plan-details {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        margin: 20px 0;
        
        .detail-row {
            display: flex;
            justify-content: between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            
            &:last-child {
                border-bottom: none;
            }
            
            .label {
                color: #6c757d;
            }
            
            .value {
                font-weight: 600;
                color: #333;
            }
        }
    }
`;

const Investments = () => {
    const { user } = useAuth();
    const { setLoading, setError, setSuccess, loading } = useApp();
    const [investmentPlans, setInvestmentPlans] = useState([]);
    const [userInvestments, setUserInvestments] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showInvestModal, setShowInvestModal] = useState(false);

    useEffect(() => {
        fetchInvestmentPlans();
        fetchUserInvestments();
    }, []);

    const fetchInvestmentPlans = async () => {
        try {
            const result = await userService.getInvestmentPlans();
            if (result.success) {
                setInvestmentPlans(result.plans);
            }
        } catch (error) {
            setError('Failed to load investment plans');
        }
    };

    const fetchUserInvestments = async () => {
        try {
            // Mock data - replace with actual API call
            const mockInvestments = [
                {
                    id: 1,
                    plan_id: 3,
                    investment_usd: 100,
                    daily_profit_bdt: 400,
                    status: 'active',
                    start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    total_profit: 2000,
                    days_running: 5
                },
                {
                    id: 2,
                    plan_id: 1,
                    investment_usd: 10,
                    daily_profit_bdt: 70,
                    status: 'completed',
                    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    total_profit: 2100,
                    days_running: 30
                }
            ];
            setUserInvestments(mockInvestments);
        } catch (error) {
            setError('Failed to load investment history');
        }
    };

    const handleInvestClick = (plan) => {
        setSelectedPlan(plan);
        setShowInvestModal(true);
    };

    const handleInvestConfirm = async () => {
        if (!selectedPlan) return;

        setLoading(true);
        try {
            const result = await userService.makeInvestment({
                plan_id: selectedPlan.id
            });

            if (result.success) {
                setSuccess(`Successfully invested $${selectedPlan.usd} in ${selectedPlan.name}!`);
                setShowInvestModal(false);
                setSelectedPlan(null);
                fetchUserInvestments(); // Refresh investments list
            } else {
                setError(result.message || 'Investment failed');
            }
        } catch (error) {
            setError(error.message || 'An error occurred during investment');
        } finally {
            setLoading(false);
        }
    };

    const getPlanColor = (index) => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
            'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
        ];
        return colors[index % colors.length];
    };

    const calculateTotalStats = () => {
        const activeInvestments = userInvestments.filter(inv => inv.status === 'active');
        const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.investment_usd, 0);
        const dailyProfit = activeInvestments.reduce((sum, inv) => sum + inv.daily_profit_bdt, 0);
        const totalProfit = userInvestments.reduce((sum, inv) => sum + inv.total_profit, 0);

        return { totalInvested, dailyProfit, totalProfit, activeCount: activeInvestments.length };
    };

    const stats = calculateTotalStats();

    return (
        <InvestmentsContainer>
            <PageHeader>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Investment Plans
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Choose from our profitable investment plans and start earning daily
                </motion.p>
            </PageHeader>

            {/* Investment Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <StatsGrid>
                    <StatCard color="#667eea">
                        <div className="stat-value">{formatCurrency(stats.totalInvested)}</div>
                        <div className="stat-label">Total Active Investment</div>
                        <div className="stat-trend trend-up">
                            <TrendingUp size={12} />
                            Active
                        </div>
                    </StatCard>
                    <StatCard color="#28a745">
                        <div className="stat-value">{formatBDT(stats.dailyProfit)}</div>
                        <div className="stat-label">Daily Profit</div>
                        <div className="stat-trend trend-up">
                            <Zap size={12} />
                            Today
                        </div>
                    </StatCard>
                    <StatCard color="#ffc107">
                        <div className="stat-value">{formatBDT(stats.totalProfit)}</div>
                        <div className="stat-label">Total Earned</div>
                        <div className="stat-trend trend-up">
                            <DollarSign size={12} />
                            All Time
                        </div>
                    </StatCard>
                    <StatCard color="#17a2b8">
                        <div className="stat-value">{stats.activeCount}</div>
                        <div className="stat-label">Active Plans</div>
                        <div className="stat-trend trend-up">
                            <Target size={12} />
                            Running
                        </div>
                    </StatCard>
                </StatsGrid>
            </motion.div>

            {/* Investment Plans */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Section>
                    <SectionTitle>Available Investment Plans</SectionTitle>
                    <PlansGrid>
                        <AnimatePresence>
                            {investmentPlans.map((plan, index) => (
                                <PlanCard
                                    key={plan.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    featured={plan.id === 3} // Mark Standard plan as featured
                                    layout
                                >
                                    <PlanHeader color={getPlanColor(index)}>
                                        <div className="plan-name">{plan.name}</div>
                                        <div className="plan-amount">${plan.usd}</div>
                                        <div className="plan-description">
                                            Daily Profit: {formatBDT(plan.daily_profit_bdt)}
                                        </div>
                                    </PlanHeader>
                                    <PlanBody>
                                        <ul className="feature-list">
                                            <li>
                                                <CheckCircle size={16} />
                                                <strong>Investment:</strong> {formatCurrency(plan.usd)}
                                            </li>
                                            <li>
                                                <TrendingUp size={16} />
                                                <strong>Daily Profit:</strong> {formatBDT(plan.daily_profit_bdt)}
                                            </li>
                                            <li>
                                                <Calendar size={16} />
                                                <strong>Duration:</strong> 30 Days Minimum
                                            </li>
                                            <li>
                                                <DollarSign size={16} />
                                                <strong>Total Return:</strong> {formatBDT(plan.daily_profit_bdt * 30)}
                                            </li>
                                            <li>
                                                <Users size={16} />
                                                <strong>Referral Bonus:</strong> Available
                                            </li>
                                        </ul>
                                        <Button
                                            variant="primary"
                                            size="large"
                                            fullWidth
                                            onClick={() => handleInvestClick(plan)}
                                            disabled={user?.balance_usd < plan.usd}
                                        >
                                            <Plus size={18} />
                                            {user?.balance_usd >= plan.usd ? 'Invest Now' : 'Insufficient Balance'}
                                        </Button>
                                        {user?.balance_usd < plan.usd && (
                                            <div style={{ 
                                                textAlign: 'center', 
                                                marginTop: '8px', 
                                                fontSize: '12px', 
                                                color: '#dc3545' 
                                            }}>
                                                Need {formatCurrency(plan.usd - (user?.balance_usd || 0))} more
                                            </div>
                                        )}
                                    </PlanBody>
                                </PlanCard>
                            ))}
                        </AnimatePresence>
                    </PlansGrid>
                </Section>
            </motion.div>

            {/* User's Investments */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Section>
                    <HeaderActions>
                        <SectionTitle>My Investments</SectionTitle>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="secondary" size="small">
                                <Clock size={16} />
                                Active ({userInvestments.filter(i => i.status === 'active').length})
                            </Button>
                            <Button variant="secondary" size="small">
                                <CheckCircle size={16} />
                                Completed ({userInvestments.filter(i => i.status === 'completed').length})
                            </Button>
                        </div>
                    </HeaderActions>

                    <InvestmentGrid>
                        <AnimatePresence>
                            {userInvestments.map((investment, index) => (
                                <motion.div
                                    key={investment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <InvestmentCard>
                                        <Card.Header>
                                            <div className="investment-header">
                                                <div>
                                                    <div className="investment-amount">
                                                        {formatCurrency(investment.investment_usd)}
                                                    </div>
                                                    <div className="investment-plan">
                                                        Plan #{investment.plan_id}
                                                    </div>
                                                </div>
                                                <div className={`investment-status ${investment.status}`}>
                                                    {investment.status === 'active' ? 'Active' : 'Completed'}
                                                </div>
                                            </div>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="investment-stats">
                                                <div className="stat">
                                                    <div className="value">
                                                        {formatBDT(investment.daily_profit_bdt)}
                                                    </div>
                                                    <div className="label">Daily Profit</div>
                                                </div>
                                                <div className="stat">
                                                    <div className="value">
                                                        {formatBDT(investment.total_profit)}
                                                    </div>
                                                    <div className="label">Total Profit</div>
                                                </div>
                                                <div className="stat">
                                                    <div className="value">
                                                        {investment.days_running}
                                                    </div>
                                                    <div className="label">Days Running</div>
                                                </div>
                                                <div className="stat">
                                                    <div className="value">
                                                        {new Date(investment.start_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="label">Start Date</div>
                                                </div>
                                            </div>
                                            {investment.status === 'active' && (
                                                <div className="investment-progress">
                                                    <div className="progress-bar">
                                                        <div 
                                                            className="progress-fill" 
                                                            style={{ width: `${(investment.days_running / 30) * 100}%` }}
                                                        />
                                                    </div>
                                                    <div className="progress-text">
                                                        <span>Day {investment.days_running}</span>
                                                        <span>Day 30</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </InvestmentCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </InvestmentGrid>

                    {userInvestments.length === 0 && (
                        <Card>
                            <Card.Body style={{ textAlign: 'center', padding: '40px' }}>
                                <TrendingUp size={48} color="#6c757d" style={{ marginBottom: '16px' }} />
                                <h3 style={{ marginBottom: '8px', color: '#333' }}>No Investments Yet</h3>
                                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                                    Start your investment journey by choosing a plan above
                                </p>
                                <Button variant="primary">
                                    <Plus size={18} />
                                    View Plans
                                </Button>
                            </Card.Body>
                        </Card>
                    )}
                </Section>
            </motion.div>

            {/* Investment Confirmation Modal */}
            <Modal
                isOpen={showInvestModal}
                onClose={() => {
                    setShowInvestModal(false);
                    setSelectedPlan(null);
                }}
                title="Confirm Investment"
            >
                {selectedPlan && (
                    <ModalContent>
                        <div className="plan-icon">
                            <TrendingUp size={32} />
                        </div>
                        <h3 style={{ marginBottom: '8px' }}>{selectedPlan.name}</h3>
                        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                            Please confirm your investment details
                        </p>

                        <div className="plan-details">
                            <div className="detail-row">
                                <span className="label">Investment Amount:</span>
                                <span className="value">{formatCurrency(selectedPlan.usd)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Daily Profit:</span>
                                <span className="value">{formatBDT(selectedPlan.daily_profit_bdt)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Monthly Profit:</span>
                                <span className="value">{formatBDT(selectedPlan.daily_profit_bdt * 30)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Your Balance:</span>
                                <span className="value">{formatCurrency(user?.balance_usd || 0)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">After Investment:</span>
                                <span className="value">
                                    {formatCurrency((user?.balance_usd || 0) - selectedPlan.usd)}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => {
                                    setShowInvestModal(false);
                                    setSelectedPlan(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                fullWidth
                                loading={loading}
                                onClick={handleInvestConfirm}
                                disabled={loading || (user?.balance_usd || 0) < selectedPlan.usd}
                            >
                                <TrendingUp size={18} />
                                Confirm Investment
                            </Button>
                        </div>
                    </ModalContent>
                )}
            </Modal>
        </InvestmentsContainer>
    );
};

export default Investments;