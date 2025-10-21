import React from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, 
    ArrowUpRight, 
    ArrowDownLeft, 
    TrendingUp,
    User,
    Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { shortenAddress, getBEP20Address } from '../../utils/helpers';

const Container = styled.div`
    margin-bottom: 24px;
`;

const Title = styled.h2`
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
`;

const ActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
`;

const ActionCard = styled(motion.div)`
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        border-color: #667eea;
    }
`;

const ActionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
`;

const IconWrapper = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
`;

const ActionTitle = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
`;

const ActionDescription = styled.p`
    margin: 0;
    font-size: 12px;
    color: #6c757d;
    line-height: 1.4;
`;

const BEP20Info = styled.div`
    background: #f8f9fa;
    padding: 8px 12px;
    border-radius: 6px;
    margin-top: 8px;
    
    code {
        font-family: monospace;
        font-size: 11px;
        color: #6c757d;
    }
`;

const QuickActions = ({ user }) => {
    const navigate = useNavigate();
    const bep20Address = getBEP20Address(user);

    const actions = [
        {
            id: 'deposit',
            title: 'Deposit USDT',
            description: 'Add funds to your account',
            icon: <ArrowDownLeft size={20} />,
            path: '/deposit',
            color: '#28a745'
        },
        {
            id: 'withdraw',
            title: 'Withdraw Funds',
            description: 'Withdraw BDT or USDT',
            icon: <ArrowUpRight size={20} />,
            path: '/withdraw',
            color: '#dc3545'
        },
        {
            id: 'invest',
            title: 'Make Investment',
            description: 'Start earning daily profits',
            icon: <TrendingUp size={20} />,
            path: '/investments',
            color: '#ffc107'
        },
        {
            id: 'profile',
            title: 'Profile Settings',
            description: 'Manage your account',
            icon: <User size={20} />,
            path: '/profile',
            color: '#17a2b8'
        }
    ];

    const handleActionClick = (path) => {
        navigate(path);
    };

    return (
        <Container>
            <Title>Quick Actions</Title>
            <ActionsGrid>
                {actions.map((action, index) => (
                    <ActionCard
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => handleActionClick(action.path)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ActionHeader>
                            <IconWrapper style={{ background: action.color }}>
                                {action.icon}
                            </IconWrapper>
                            <ActionTitle>{action.title}</ActionTitle>
                        </ActionHeader>
                        <ActionDescription>
                            {action.description}
                        </ActionDescription>
                        
                        {/* Show BEP20 address for deposit action */}
                        {action.id === 'deposit' && (
                            <BEP20Info>
                                <code>{shortenAddress(bep20Address)}</code>
                            </BEP20Info>
                        )}
                    </ActionCard>
                ))}
            </ActionsGrid>
        </Container>
    );
};

export default QuickActions;