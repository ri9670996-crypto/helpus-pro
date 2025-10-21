import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styled from 'styled-components';
import { formatCurrency, formatBDT } from '../../utils/helpers';

const Card = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${props => {
        switch (props.trend) {
            case 'up': return '#28a745';
            case 'down': return '#dc3545';
            default: return '#6c757d';
        }
    }};
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: between;
    align-items: flex-start;
    margin-bottom: 16px;
`;

const IconWrapper = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const Amount = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 8px 0;
`;

const Trend = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: ${props => {
        switch (props.trend) {
            case 'up': return '#28a745';
            case 'down': return '#dc3545';
            default: return '#6c757d';
        }
    }};
`;

const BalanceCard = ({ 
    title, 
    amount, 
    currency = 'USD', 
    icon, 
    trend = 'stable',
    trendValue,
    className 
}) => {
    const formattedAmount = currency === 'BDT' 
        ? formatBDT(amount) 
        : formatCurrency(amount, currency);

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={14} />;
            case 'down':
                return <TrendingDown size={14} />;
            default:
                return <Minus size={14} />;
        }
    };

    const getTrendText = () => {
        switch (trend) {
            case 'up':
                return trendValue ? `+${trendValue}%` : 'Increasing';
            case 'down':
                return trendValue ? `-${trendValue}%` : 'Decreasing';
            default:
                return trendValue ? `${trendValue}%` : 'Stable';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card trend={trend} className={className}>
                <CardHeader>
                    <div style={{ flex: 1 }}>
                        <Title>{title}</Title>
                        <Amount>{formattedAmount}</Amount>
                        <Trend trend={trend}>
                            {getTrendIcon()}
                            {getTrendText()}
                        </Trend>
                    </div>
                    <IconWrapper>
                        {icon}
                    </IconWrapper>
                </CardHeader>
            </Card>
        </motion.div>
    );
};

export default BalanceCard;