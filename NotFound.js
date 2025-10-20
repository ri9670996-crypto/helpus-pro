import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../components/ui/Button';

const NotFoundContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 40px 24px;
    text-align: center;
`;

const Content = styled.div`
    max-width: 500px;
    
    .error-code {
        font-size: 8rem;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 16px;
        line-height: 1;
        
        @media (max-width: 768px) {
            font-size: 6rem;
        }
    }
    
    .error-title {
        font-size: 2rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 16px;
        
        @media (max-width: 768px) {
            font-size: 1.5rem;
        }
    }
    
    .error-description {
        font-size: 1.1rem;
        color: #6c757d;
        margin-bottom: 40px;
        line-height: 1.6;
    }
`;

const Illustration = styled(motion.div)`
    width: 200px;
    height: 200px;
    margin: 0 auto 40px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    &::before {
        content: '404';
        position: absolute;
        font-size: 4rem;
        font-weight: 800;
        color: rgba(102, 126, 234, 0.1);
    }
    
    .search-icon {
        color: #667eea;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
`;

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <NotFoundContainer>
            <Content>
                <Illustration
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                >
                    <Search size={64} className="search-icon" />
                </Illustration>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="error-code">404</div>
                    <h1 className="error-title">Page Not Found</h1>
                    <p className="error-description">
                        Oops! The page you're looking for seems to have wandered off. 
                        It might have been moved, deleted, or perhaps never existed.
                    </p>

                    <ActionButtons>
                        <Button
                            variant="primary"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={18} />
                            Go Back
                        </Button>
                        <Button
                            as={Link}
                            to="/dashboard"
                            variant="secondary"
                        >
                            <Home size={18} />
                            Go Home
                        </Button>
                    </ActionButtons>
                </motion.div>
            </Content>
        </NotFoundContainer>
    );
};

export default NotFound;