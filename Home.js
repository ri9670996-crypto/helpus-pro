import React from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    Shield, 
    Zap, 
    Users,
    ArrowRight,
    Star,
    CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../components/ui/Button';

const HomeContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const HeroSection = styled.section`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: white;
    text-align: center;
    padding: 0 24px;
`;

const HeroContent = styled.div`
    max-width: 800px;
    
    h1 {
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 24px;
        line-height: 1.1;
        
        @media (max-width: 768px) {
            font-size: 2.5rem;
        }
    }
    
    p {
        font-size: 1.25rem;
        margin-bottom: 40px;
        opacity: 0.9;
        line-height: 1.6;
        
        @media (max-width: 768px) {
            font-size: 1.1rem;
        }
    }
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin: 80px 0;
`;

const FeatureCard = styled(motion.div)`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 40px 30px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
    color: white;
    
    .feature-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        color: white;
    }
    
    h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 16px;
    }
    
    p {
        opacity: 0.8;
        line-height: 1.6;
    }
`;

const CTAButtons = styled.div`
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
`;

const StatsSection = styled.section`
    background: white;
    padding: 80px 24px;
    text-align: center;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
`;

const StatItem = styled.div`
    .stat-number {
        font-size: 3rem;
        font-weight: 800;
        color: #667eea;
        margin-bottom: 8px;
    }
    
    .stat-label {
        font-size: 1.1rem;
        color: #6c757d;
        font-weight: 600;
    }
`;

const Home = () => {
    const features = [
        {
            icon: <TrendingUp size={32} />,
            title: "Daily Profits",
            description: "Earn consistent daily returns on your investments with our proven strategies."
        },
        {
            icon: <Shield size={32} />,
            title: "Secure Platform",
            description: "Your funds and data are protected with bank-level security measures."
        },
        {
            icon: <Zap size={32} />,
            title: "Instant Processing",
            description: "Quick deposits and fast withdrawal processing for your convenience."
        },
        {
            icon: <Users size={32} />,
            title: "Referral Program",
            description: "Earn extra income by referring friends to our platform."
        }
    ];

    const stats = [
        { number: "10K+", label: "Active Investors" },
        { number: "$5M+", label: "Total Invested" },
        { number: "24/7", label: "Customer Support" },
        { number: "99.9%", label: "Uptime Guarantee" }
    ];

    return (
        <HomeContainer>
            {/* Hero Section */}
            <HeroSection>
                <HeroContent>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Grow Your Wealth with 
                        <span style={{ display: 'block', color: '#f0f0f0' }}>
                            Smart Investments
                        </span>
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Join thousands of investors earning daily profits through our 
                        secure and transparent investment platform. Start with as little as $10.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <CTAButtons>
                            <Button 
                                as={Link} 
                                to="/register"
                                variant="primary" 
                                size="large"
                            >
                                Get Started Free
                                <ArrowRight size={20} />
                            </Button>
                            <Button 
                                as={Link} 
                                to="/login"
                                variant="secondary" 
                                size="large"
                                style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                            >
                                Sign In
                            </Button>
                        </CTAButtons>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <FeatureGrid>
                            {features.map((feature, index) => (
                                <FeatureCard
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="feature-icon">
                                        {feature.icon}
                                    </div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </FeatureCard>
                            ))}
                        </FeatureGrid>
                    </motion.div>
                </HeroContent>
            </HeroSection>

            {/* Stats Section */}
            <StatsSection>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '700', 
                        marginBottom: '60px',
                        color: '#333'
                    }}>
                        Trusted by Investors Worldwide
                    </h2>
                    
                    <StatsGrid>
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <StatItem>
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </StatItem>
                            </motion.div>
                        ))}
                    </StatsGrid>
                </motion.div>
            </StatsSection>
        </HomeContainer>
    );
};

export default Home;