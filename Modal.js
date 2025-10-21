import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styled from 'styled-components';

const ModalOverlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
`;

const ModalContent = styled(motion.div)`
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: ${props => props.size === 'large' ? '800px' : props.size === 'small' ? '400px' : '600px'};
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: between;
    padding: 24px 24px 0;
    margin-bottom: 16px;
    
    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #333;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    color: #6c757d;
    transition: all 0.3s ease;
    
    &:hover {
        background: #f8f9fa;
        color: #333;
    }
`;

const ModalBody = styled.div`
    padding: 0 24px 24px;
    overflow-y: auto;
    max-height: calc(90vh - 100px);
`;

const ModalFooter = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 24px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
`;

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    showCloseButton = true,
    footer,
    preventCloseOnOverlay = false
}) => {
    // Handle ESC key press
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27 && isOpen) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !preventCloseOnOverlay) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <ModalOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleOverlayClick}
                >
                    <ModalContent
                        size={size}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ 
                            type: "spring",
                            damping: 25,
                            stiffness: 300
                        }}
                    >
                        {(title || showCloseButton) && (
                            <ModalHeader>
                                {title && <h2>{title}</h2>}
                                {showCloseButton && (
                                    <CloseButton onClick={onClose}>
                                        <X size={20} />
                                    </CloseButton>
                                )}
                            </ModalHeader>
                        )}
                        
                        <ModalBody>
                            {children}
                        </ModalBody>
                        
                        {footer && (
                            <ModalFooter>
                                {footer}
                            </ModalFooter>
                        )}
                    </ModalContent>
                </ModalOverlay>
            )}
        </AnimatePresence>
    );
};

export default Modal;