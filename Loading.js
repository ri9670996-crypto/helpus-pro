import React from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled(motion.div)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: ${spin} 1s linear infinite;
        margin-bottom: 16px;
    }
    
    .loading-text {
        color: #6c757d;
        font-weight: 500;
    }
    
    &.overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        z-index: 9999;
    }
    
    &.inline {
        padding: 20px;
    }
`;

const Loading = ({ 
    message = 'Loading...', 
    type = 'inline',
    size = 'medium' 
}) => {
    return (
        <LoadingContainer
            className={type}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div 
                className="spinner" 
                style={{
                    width: size === 'large' ? '60px' : size === 'small' ? '20px' : '40px',
                    height: size === 'large' ? '60px' : size === 'small' ? '20px' : '40px'
                }}
            />
            {message && <div className="loading-text">{message}</div>}
        </LoadingContainer>
    );
};

export default Loading;