import React from 'react';
import styled from 'styled-components';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const FooterContainer = styled.footer`
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    padding: 40px 0 20px;
    margin-top: auto;
`;

const FooterContent = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
`;

const FooterGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 30px;
    
    @media (max-width: 968px) {
        grid-template-columns: 1fr 1fr;
    }
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 30px;
    }
`;

const FooterSection = styled.div`
    h3 {
        color: #ecf0f1;
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 600;
    }
    
    p {
        color: #bdc3c7;
        line-height: 1.6;
        margin-bottom: 16px;
    }
    
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
            margin-bottom: 8px;
            
            a {
                color: #bdc3c7;
                text-decoration: none;
                transition: color 0.3s ease;
                
                &:hover {
                    color: #3498db;
                }
            }
        }
    }
`;

const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #bdc3c7;
        
        svg {
            width: 16px;
            height: 16px;
            color: #3498db;
        }
    }
`;

const SocialLinks = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 16px;
    
    .social-link {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-decoration: none;
        transition: all 0.3s ease;
        
        &:hover {
            background: #3498db;
            transform: translateY(-2px);
        }
    }
`;

const FooterBottom = styled.div`
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px;
        text-align: center;
    }
    
    .copyright {
        color: #bdc3c7;
        font-size: 14px;
        
        .heart {
            color: #e74c3c;
            margin: 0 4px;
        }
    }
    
    .footer-links {
        display: flex;
        gap: 20px;
        
        a {
            color: #bdc3c7;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
            
            &:hover {
                color: #3498db;
            }
        }
    }
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .logo-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    .logo-text {
        font-size: 20px;
        font-weight: 700;
        color: white;
    }
`;

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <FooterContainer>
            <FooterContent>
                <FooterGrid>
                    {/* Company Info */}
                    <FooterSection>
                        <Logo>
                            <div className="logo-icon">
                                <Heart size={24} />
                            </div>
                            <div className="logo-text">HelpUs</div>
                        </Logo>
                        <p>
                            Professional investment platform helping users grow their wealth 
                            through secure and profitable investment plans. Join thousands of 
                            satisfied investors today.
                        </p>
                        <SocialLinks>
                            <a href="#" className="social-link" aria-label="Facebook">
                                📘
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                🐦
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                💼
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                📷
                            </a>
                        </SocialLinks>
                    </FooterSection>

                    {/* Quick Links */}
                    <FooterSection>
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="/dashboard">Dashboard</a></li>
                            <li><a href="/investments">Investment Plans</a></li>
                            <li><a href="/deposit">Deposit Funds</a></li>
                            <li><a href="/withdraw">Withdraw Earnings</a></li>
                            <li><a href="/profile">My Profile</a></li>
                        </ul>
                    </FooterSection>

                    {/* Support */}
                    <FooterSection>
                        <h3>Support</h3>
                        <ul>
                            <li><a href="/help">Help Center</a></li>
                            <li><a href="/faq">FAQ</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/terms">Terms of Service</a></li>
                        </ul>
                    </FooterSection>

                    {/* Contact Info */}
                    <FooterSection>
                        <h3>Contact Us</h3>
                        <ContactInfo>
                            <div className="contact-item">
                                <Mail size={16} />
                                <span>support@helpus-invest.com</span>
                            </div>
                            <div className="contact-item">
                                <Phone size={16} />
                                <span>+880 1XXX-XXXXXX</span>
                            </div>
                            <div className="contact-item">
                                <MapPin size={16} />
                                <span>Dhaka, Bangladesh</span>
                            </div>
                        </ContactInfo>
                    </FooterSection>
                </FooterGrid>

                <FooterBottom>
                    <div className="copyright">
                        © {currentYear} HelpUs Investment. Made with <Heart size={12} className="heart" /> for our investors.
                    </div>
                    <div className="footer-links">
                        <a href="/privacy">Privacy</a>
                        <a href="/terms">Terms</a>
                        <a href="/security">Security</a>
                        <a href="/sitemap">Sitemap</a>
                    </div>
                </FooterBottom>
            </FooterContent>
        </FooterContainer>
    );
};

export default Footer;