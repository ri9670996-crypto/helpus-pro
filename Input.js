import React from 'react';
import styled, { css } from 'styled-components';

const InputContainer = styled.div`
    margin-bottom: 16px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    ${props => props.error && css`
        border-color: #dc3545;
        
        &:focus {
            border-color: #dc3545;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }
    `}
    
    ${props => props.disabled && css`
        background-color: #f8f9fa;
        cursor: not-allowed;
    `}
`;

const ErrorMessage = styled.span`
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #dc3545;
`;

const HelpText = styled.span`
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #6c757d;
`;

const Input = ({
    label,
    error,
    helpText,
    ...props
}) => {
    return (
        <InputContainer>
            {label && <Label>{label}</Label>}
            <StyledInput error={error} {...props} />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {helpText && !error && <HelpText>{helpText}</HelpText>}
        </InputContainer>
    );
};

export default Input;