import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Card = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-top: 4px solid ${props => props.color || '#667eea'};
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
    }
`;

const Content = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const IconWrapper = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.color ? `${props.color}15` : '#667eea15'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color || '#667eea'};
    flex-shrink: 0;
`;

const TextContent = styled.div`
    flex: 1;
`;

const Value = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin-bottom: 4px;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const Subtitle = styled.p`
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #6c757d;
`;

const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = '#667eea',
    className 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card color={color} className={className}>
                <Content>
                    <IconWrapper color={color}>
                        {icon}
                    </IconWrapper>
                    <TextContent>
                        <Value>{value}</Value>
                        <Title>{title}</Title>
                        {subtitle && <Subtitle>{subtitle}</Subtitle>}
                    </TextContent>
                </Content>
            </Card>
        </motion.div>
    );
};

export default StatsCard;