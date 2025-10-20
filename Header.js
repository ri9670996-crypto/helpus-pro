import React, { useState } from 'react';
import { 
    Wallet, 
    User, 
    LogOut, 
    Menu, 
    X,
    Bell,
    Settings,
    TrendingUp
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatBDT } from '../../utils/helpers';

const HeaderContainer = styled.header`
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 70px;
    max-width: 1200px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
        padding: 0 16px;
    }
`;

const Logo = styled(Link)`
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    
    .logo-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    .logo-text {
        font-size: 20px;
        font-weight: 700;
        color: #333;
        
        @media (max-width: 768px) {
            display: none;
        }
    }
`;

const Nav = styled.nav`
    display: flex;
    align-items: center;
    gap: 32px;
    
    @media (max-width: 968px) {
        display: ${props => props.mobile ? 'flex' : 'none'};
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        gap: 0;
    }
`;

const NavLink = styled(Link)`
    text-decoration: none;
    color: ${props => props.active ? '#667eea' : '#6c757d'};
    font-weight: ${props => props.active ? '600' : '500'};
    padding: 8px 0;
    position: relative;
    transition: color 0.3s ease;
    
    &:hover {
        color: #667eea;
    }
    
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: ${props => props.active ? '100%' : '0'};
        height: 2px;
        background: #667eea;
        transition: width 0.3s ease;
    }
    
    &:hover::after {
        width: 100%;
    }
    
    @media (max-width: 968px) {
        padding: 12px 0;
        width: 100%;
        text-align: center;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
            border-bottom: none;
        }
    }
`;

const BalanceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    
    @media (max-width: 768px) {
        display: none;
    }
`;

const BalanceItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 8px;
    
    .balance-amount {
        font-weight: 600;
        color: #333;
    }
    
    .balance-label {
        font-size: 12px;
        color: #6c757d;
    }
`;

const UserMenu = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const UserButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    background: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
    
    &:hover {
        background: #f8f9fa;
    }
    
    .user-name {
        font-weight: 600;
        color: #333;
        
        @media (max-width: 768px) {
            display: none;
        }
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
    }
`;

const DropdownMenu = styled(motion.div)`
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    padding: 8px;
    min-width: 200px;
    z-index: 1000;
    margin-top: 8px;
    
    &::before {
        content: '';
        position: absolute;
        top: -6px;
        right: 20px;
        width: 12px;
        height: 12px;
        background: white;
        transform: rotate(45deg);
        box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.05);
    }
`;

const DropdownItem = styled(Link)`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    text-decoration: none;
    color: #333;
    border-radius: 8px;
    transition: background 0.3s ease;
    font-weight: 500;
    
    &:hover {
        background: #f8f9fa;
        color: #667eea;
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

const LogoutButton = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    color: #dc3545;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
    font-weight: 500;
    
    &:hover {
        background: #f8d7da;
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

const MobileMenuButton = styled.button`
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background 0.3s ease;
    
    &:hover {
        background: #f8f9fa;
    }
    
    @media (max-width: 968px) {
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const NotificationBadge = styled.div`
    position: relative;
    
    .badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #dc3545;
        color: white;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const Header = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
        { path: '/investments', label: 'Investments', icon: TrendingUp },
        { path: '/deposit', label: 'Deposit', icon: Wallet },
        { path: '/withdraw', label: 'Withdraw', icon: Wallet },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getUserInitial = () => {
        return user?.username?.charAt(0).toUpperCase() || 'U';
    };

    const closeMobileMenu = () => {
        setShowMobileMenu(false);
    };

    return (
        <HeaderContainer>
            <HeaderContent>
                {/* Logo */}
                <Logo to="/dashboard" onClick={closeMobileMenu}>
                    <div className="logo-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="logo-text">HelpUs Investment</div>
                </Logo>

                {/* Desktop Navigation */}
                <Nav>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                active={location.pathname === item.path ? 1 : 0}
                            >
                                {item.label}
                            </NavLink>
                        );
                    })}
                </Nav>

                {/* Balance Info - Desktop */}
                <BalanceInfo>
                    <BalanceItem>
                        <Wallet size={16} color="#28a745" />
                        <div>
                            <div className="balance-amount">
                                {formatCurrency(user?.balance_usd || 0)}
                            </div>
                            <div className="balance-label">USD Balance</div>
                        </div>
                    </BalanceItem>
                    <BalanceItem>
                        <Wallet size={16} color="#dc3545" />
                        <div>
                            <div className="balance-amount">
                                {formatBDT(user?.balance_bdt || 0)}
                            </div>
                            <div className="balance-label">BDT Balance</div>
                        </div>
                    </BalanceItem>
                </BalanceInfo>

                {/* User Menu */}
                <UserMenu>
                    {/* Notifications */}
                    <NotificationBadge>
                        <Bell size={20} color="#6c757d" />
                        <div className="badge">3</div>
                    </NotificationBadge>

                    {/* User Dropdown */}
                    <UserButton onClick={() => setShowDropdown(!showDropdown)}>
                        <div className="user-avatar">
                            {getUserInitial()}
                        </div>
                        <div className="user-name">
                            {user?.username}
                        </div>
                    </UserButton>

                    <AnimatePresence>
                        {showDropdown && (
                            <DropdownMenu
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <DropdownItem to="/profile" onClick={() => setShowDropdown(false)}>
                                    <User size={18} />
                                    Profile Settings
                                </DropdownItem>
                                <DropdownItem to="/settings" onClick={() => setShowDropdown(false)}>
                                    <Settings size={18} />
                                    Account Settings
                                </DropdownItem>
                                <div style={{ height: '1px', background: '#f0f0f0', margin: '8px 0' }} />
                                <LogoutButton onClick={handleLogout}>
                                    <LogOut size={18} />
                                    Logout
                                </LogoutButton>
                            </DropdownMenu>
                        )}
                    </AnimatePresence>

                    {/* Mobile Menu Button */}
                    <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
                        {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                    </MobileMenuButton>
                </UserMenu>
            </HeaderContent>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Nav mobile>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        active={location.pathname === item.path ? 1 : 0}
                                        onClick={closeMobileMenu}
                                    >
                                        <Icon size={16} style={{ marginRight: '8px' }} />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                            
                            {/* Mobile Balance Info */}
                            <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0', width: '100%' }}>
                                <BalanceItem style={{ background: 'none', padding: '8px 0' }}>
                                    <Wallet size={16} color="#28a745" />
                                    <div>
                                        <div className="balance-amount">
                                            {formatCurrency(user?.balance_usd || 0)}
                                        </div>
                                        <div className="balance-label">USD Balance</div>
                                    </div>
                                </BalanceItem>
                                <BalanceItem style={{ background: 'none', padding: '8px 0' }}>
                                    <Wallet size={16} color="#dc3545" />
                                    <div>
                                        <div className="balance-amount">
                                            {formatBDT(user?.balance_bdt || 0)}
                                        </div>
                                        <div className="balance-label">BDT Balance</div>
                                    </div>
                                </BalanceItem>
                            </div>
                            
                            <DropdownItem to="/profile" onClick={closeMobileMenu}>
                                <User size={18} />
                                Profile Settings
                            </DropdownItem>
                            <LogoutButton onClick={handleLogout} style={{ marginTop: '8px' }}>
                                <LogOut size={18} />
                                Logout
                            </LogoutButton>
                        </Nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </HeaderContainer>
    );
};

export default Header;