
import React from 'react';
import styled, { css } from 'styled-components';

const StyledButton = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    ${props => props.variant === 'primary' && css`
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
    `}
    
    ${props => props.variant === 'secondary' && css`
        background: #f8f9fa;
        color: #333;
        border: 1px solid #dee2e6;
        
        &:hover {
            background: #e9ecef;
        }
    `}
    
    ${props => props.variant === 'success' && css`
        background: #28a745;
        color: white;
        
        &:hover {
            background: #218838;
        }
    `}
    
    ${props => props.variant === 'danger' && css`
        background: #dc3545;
        color: white;
        
        &:hover {
            background: #c82333;
        }
    `}
    
    ${props => props.size === 'small' && css`
        padding: 8px 16px;
        font-size: 12px;
    `}
    
    ${props => props.size === 'large' && css`
        padding: 16px 32px;
        font-size: 16px;
    `}
    
    ${props => props.disabled && css`
        opacity: 0.6;
        cursor: not-allowed;
        
        &:hover {
            transform: none;
            box-shadow: none;
        }
    `}
    
    ${props => props.fullWidth && css`
        width: 100%;
    `}
`;

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'medium', 
    disabled = false,
    loading = false,
    fullWidth = false,
    ...props 
}) => {
    return (
        <StyledButton
            variant={variant}
            size={size}
            disabled={disabled || loading}
            fullWidth={fullWidth}
            {...props}
        >
            {loading && (
                <span className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                </span>
            )}
            {children}
        </StyledButton>
    );
};

export default Button;