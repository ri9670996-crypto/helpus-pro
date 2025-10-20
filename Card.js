import React from 'react';
import styled, { css } from 'styled-components';

const StyledCard = styled.div`
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
    
    ${props => props.hoverable && css`
        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
    `}
`;

const CardHeader = styled.div`
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    
    ${props => props.noBorder && css`
        border-bottom: none;
    `}
`;

const CardTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
`;

const CardSubtitle = styled.p`
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #6c757d;
`;

const CardBody = styled.div`
    padding: 24px;
`;

const CardFooter = styled.div`
    padding: 16px 24px;
    background: #f8f9fa;
    border-top: 1px solid #f0f0f0;
`;

const Card = ({ 
    children, 
    title, 
    subtitle, 
    footer,
    hoverable = false,
    ...props 
}) => {
    return (
        <StyledCard hoverable={hoverable} {...props}>
            {(title || subtitle) && (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
                </CardHeader>
            )}
            <CardBody>
                {children}
            </CardBody>
            {footer && (
                <CardFooter>
                    {footer}
                </CardFooter>
            )}
        </StyledCard>
    );
};

export default Card;