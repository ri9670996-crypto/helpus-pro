import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Search, 
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Ban,
    CheckCircle,
    XCircle,
    Download
} from 'lucide-react';
import styled from 'styled-components';
import { useApp } from '../../contexts/AppContext';
import { adminService } from '../../services/user';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/common/Modal';

const UsersContainer = styled.div`
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
`;

const PageHeader = styled.div`
    margin-bottom: 32px;
    
    h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 700;
        color: #333;
    }
    
    p {
        margin: 0;
        color: #6c757d;
        font-size: 16px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchSection = styled.div`
    display: flex;
    gap: 12px;
    flex: 1;
    max-width: 400px;
    
    @media (max-width: 768px) {
        max-width: none;
    }
`;

const FilterSection = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
`;

const StatCard = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${props => props.color};
    
    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin-bottom: 4px;
    }
    
    .stat-label {
        font-size: 14px;
        color: #6c757d;
        font-weight: 600;
    }
`;

const TableContainer = styled(Card)`
    overflow: hidden;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    
    th, td {
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
    }
    
    th {
        font-weight: 600;
        color: #6c757d;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: #f8f9fa;
    }
    
    td {
        font-size: 14px;
        color: #333;
    }
    
    .user-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
        }
        
        .user-info {
            .username {
                font-weight: 600;
                margin-bottom: 2px;
            }
            
            .phone {
                font-size: 12px;
                color: #6c757d;
            }
        }
    }
    
    .amount {
        font-weight: 600;
        color: #28a745;
    }
    
    .status {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        
        &.active {
            background: #d4edda;
            color: #155724;
        }
        
        &.inactive {
            background: #f8d7da;
            color: #721c24;
        }
    }
    
    .action-cell {
        text-align: right;
        
        .action-menu {
            position: relative;
            display: inline-block;
        }
        
        .menu-button {
            background: none;
            border: none;
            color: #6c757d;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.3s ease;
            
            &:hover {
                background: #f8f9fa;
                color: #333;
            }
        }
        
        .dropdown-menu {
            position: absolute;
            right: 0;
            top: 100%;
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            padding: 8px;
            min-width: 160px;
            z-index: 100;
            margin-top: 4px;
            
            button {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 10px 12px;
                border: none;
                background: none;
                cursor: pointer;
                border-radius: 6px;
                font-size: 13px;
                color: #333;
                transition: all 0.3s ease;
                
                &:hover {
                    background: #f8f9fa;
                    color: #667eea;
                }
                
                &.danger:hover {
                    background: #f8d7da;
                    color: #dc3545;
                }
            }
        }
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-top: 1px solid #f0f0f0;
    background: #f8f9fa;
    
    .pagination-info {
        font-size: 14px;
        color: #6c757d;
    }
    
    .pagination-controls {
        display: flex;
        gap: 8px;
        align-items: center;
        
        button {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
            
            &:hover:not(:disabled) {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
            
            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            &.active {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
        }
    }
`;

const Users = () => {
    const { setLoading, setError, setSuccess } = useApp();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await adminService.getUsers();
            if (result.success) {
                setUsers(result.users);
            } else {
                setError(result.message || 'Failed to load users');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while fetching users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone.includes(searchTerm) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleStatusUpdate = async (userId, status) => {
        setLoading(true);
        try {
            const result = await adminService.updateUserStatus({
                user_id: userId,
                status: status
            });

            if (result.success) {
                setSuccess(`User ${status} successfully`);
                fetchUsers(); // Refresh users list
            } else {
                setError(result.message || 'Failed to update user status');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while updating user status');
        } finally {
            setLoading(false);
            setActiveMenu(null);
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const toggleMenu = (userId) => {
        setActiveMenu(activeMenu === userId ? null : userId);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        totalBalance: users.reduce((sum, user) => sum + parseFloat(user.balance_usd), 0)
    };

    return (
        <UsersContainer>
            <PageHeader>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    User Management
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Manage all users and their account status
                </motion.p>
            </PageHeader>

            {/* Stats Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <StatsGrid>
                    <StatCard color="#667eea">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Users</div>
                    </StatCard>
                    <StatCard color="#28a745">
                        <div className="stat-value">{stats.active}</div>
                        <div className="stat-label">Active Users</div>
                    </StatCard>
                    <StatCard color="#dc3545">
                        <div className="stat-value">{stats.inactive}</div>
                        <div className="stat-label">Inactive Users</div>
                    </StatCard>
                    <StatCard color="#ffc107">
                        <div className="stat-value">{formatCurrency(stats.totalBalance)}</div>
                        <div className="stat-label">Total Balance</div>
                    </StatCard>
                </StatsGrid>
            </motion.div>

            {/* Header Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <HeaderActions>
                    <SearchSection>
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search size={16} />}
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: '12px 16px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                minWidth: '120px'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </SearchSection>

                    <FilterSection>
                        <Button variant="secondary">
                            <Download size={16} />
                            Export
                        </Button>
                    </FilterSection>
                </HeaderActions>
            </motion.div>

            {/* Users Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Balance</th>
                                <th>Total Invested</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <div className="username">{user.username}</div>
                                                <div className="phone">{user.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="amount">
                                        {formatCurrency(user.balance_usd)}
                                    </td>
                                    <td>
                                        {formatCurrency(user.total_invested_usd)}
                                    </td>
                                    <td>
                                        <span className={`status ${user.status}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="action-cell">
                                        <div className="action-menu">
                                            <button
                                                className="menu-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(user.id);
                                                }}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            
                                            {activeMenu === user.id && (
                                                <div className="dropdown-menu">
                                                    <button onClick={() => handleViewUser(user)}>
                                                        <Eye size={14} />
                                                        View Details
                                                    </button>
                                                    <button>
                                                        <Edit size={14} />
                                                        Edit User
                                                    </button>
                                                    {user.status === 'active' ? (
                                                        <button 
                                                            className="danger"
                                                            onClick={() => handleStatusUpdate(user.id, 'inactive')}
                                                        >
                                                            <Ban size={14} />
                                                            Deactivate
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(user.id, 'active')}
                                                        >
                                                            <CheckCircle size={14} />
                                                            Activate
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Pagination */}
                    {filteredUsers.length > 0 && (
                        <Pagination>
                            <div className="pagination-info">
                                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                            </div>
                            <div className="pagination-controls">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => paginate(index + 1)}
                                        className={currentPage === index + 1 ? 'active' : ''}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </Pagination>
                    )}
                </TableContainer>

                {filteredUsers.length === 0 && (
                    <Card>
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 40px',
                            color: '#6c757d'
                        }}>
                            <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <h3 style={{ marginBottom: '8px' }}>No Users Found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                        </div>
                    </Card>
                )}
            </motion.div>

            {/* User Details Modal */}
            <Modal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title="User Details"
                size="large"
            >
                {selectedUser && (
                    <div style={{ padding: '20px' }}>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            marginBottom: '24px'
                        }}>
                            <div>
                                <strong>Username:</strong>
                                <p>{selectedUser.username}</p>
                            </div>
                            <div>
                                <strong>Phone:</strong>
                                <p>{selectedUser.phone}</p>
                            </div>
                            <div>
                                <strong>Email:</strong>
                                <p>{selectedUser.email || 'N/A'}</p>
                            </div>
                            <div>
                                <strong>Status:</strong>
                                <p>
                                    <span className={`status ${selectedUser.status}`}>
                                        {selectedUser.status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <strong>Balance USD:</strong>
                                <p>{formatCurrency(selectedUser.balance_usd)}</p>
                            </div>
                            <div>
                                <strong>Balance BDT:</strong>
                                <p>{selectedUser.balance_bdt} BDT</p>
                            </div>
                            <div>
                                <strong>Total Invested:</strong>
                                <p>{formatCurrency(selectedUser.total_invested_usd)}</p>
                            </div>
                            <div>
                                <strong>Total Earned:</strong>
                                <p>{selectedUser.total_earned_bdt} BDT</p>
                            </div>
                            <div>
                                <strong>Referral Code:</strong>
                                <p>{selectedUser.referral_code}</p>
                            </div>
                            <div>
                                <strong>Member Since:</strong>
                                <p>{formatDate(selectedUser.created_at)}</p>
                            </div>
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            justifyContent: 'flex-end',
                            borderTop: '1px solid #f0f0f0',
                            paddingTop: '20px'
                        }}>
                            <Button
                                variant="secondary"
                                onClick={() => setShowUserModal(false)}
                            >
                                Close
                            </Button>
                            {selectedUser.status === 'active' ? (
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        handleStatusUpdate(selectedUser.id, 'inactive');
                                        setShowUserModal(false);
                                    }}
                                >
                                    <Ban size={16} />
                                    Deactivate User
                                </Button>
                            ) : (
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        handleStatusUpdate(selectedUser.id, 'active');
                                        setShowUserModal(false);
                                    }}
                                >
                                    <CheckCircle size={16} />
                                    Activate User
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </UsersContainer>
    );
};

export default Users;