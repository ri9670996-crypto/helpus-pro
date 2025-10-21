import React, { useState, useEffect } from 'react.js';
import { motion } from 'framer-motion.js';
import { 
    Filter, 
    Download, 
    CheckCircle, 
    XCircle, 
    Eye,
    MoreVertical,
    RefreshCw,
    AlertTriangle,
    Clock,
    DollarSign
} from 'lucide-react.js';
import styled from 'styled-components.js';
import { useApp } from '../../contexts/AppContext.js';
import { adminService } from '../../services/user.js';
import { formatBDT, formatDate } from '../../utils/helpers.js';
import Card from '../../components/ui/Card.js';
import Button from '../../components/ui/Button.js';
import Table from '../../components/ui/Table.js';
import Modal from '../../components/ui/Modal.js';

// Styled Components - আপনার আগের স্টাইল মেনে
const WithdrawalsContainer = styled.div`
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

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
`;

const StatCard = styled(Card)`
    border-left: 4px solid ${props => props.color};
    
    .stat-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .stat-info {
        flex: 1;
    }
    
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
    
    .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: ${props => props.color}15;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${props => props.color};
        flex-shrink: 0;
    }
`;

const FilterSection = styled(Card)`
    margin-bottom: 24px;
    
    .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    
    .filter-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
    
    .filter-controls {
        display: flex;
        gap: 12px;
        align-items: center;
        
        @media (max-width: 768px) {
            flex-direction: column;
            align-items: stretch;
        }
    }
`;

const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    
    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const StatusBadge = styled.span`
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    ${props => {
        switch (props.status) {
            case 'pending':
                return `
                    background: #fff3cd;
                    color: #856404;
                `;
            case 'approved':
                return `
                    background: #d4edda;
                    color: #155724;
                `;
            case 'rejected':
                return `
                    background: #f8d7da;
                    color: #721c24;
                `;
            case 'processing':
                return `
                    background: #d1ecf1;
                    color: #0c5460;
                `;
            default:
                return `
                    background: #e9ecef;
                    color: #495057;
                `;
        }
    }}
`;

const MethodBadge = styled.span`
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    
    ${props => {
        switch (props.method) {
            case 'bkash':
                return `
                    background: #e2136e15;
                    color: #e2136e;
                    border: 1px solid #e2136e30;
                `;
            case 'nagad':
                return `
                    background: #f8a61c15;
                    color: #f8a61c;
                    border: 1px solid #f8a61c30;
                `;
            case 'rocket':
                return `
                    background: #5d2d9115;
                    color: #5d2d91;
                    border: 1px solid #5d2d9130;
                `;
            case 'bep20':
                return `
                    background: #f0b90b15;
                    color: #f0b90b;
                    border: 1px solid #f0b90b30;
                `;
            default:
                return `
                    background: #e9ecef;
                    color: #495057;
                `;
        }
    }}
`;

const WithdrawalDetails = styled.div`
    padding: 20px;
    
    .detail-section {
        margin-bottom: 20px;
        
        &:last-child {
            margin-bottom: 0;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f0f0f0;
        }
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f8f9fa;
        
        &:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-size: 14px;
            color: #6c757d;
        }
        
        .detail-value {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            
            &.amount {
                color: #dc3545;
                font-size: 16px;
            }
        }
    }
`;

// Main Withdrawals Component
const AdminWithdrawals = () => {
    const { setLoading, setError, setSuccess } = useApp();
    const [withdrawals, setWithdrawals] = useState([]);
    const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        method: 'all',
        dateRange: 'all'
    });
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0
    });

    useEffect(() => {
        loadWithdrawals();
    }, []);

    useEffect(() => {
        filterWithdrawals();
    }, [withdrawals, filters]);

    const loadWithdrawals = async () => {
        setLoading(true);
        try {
            const result = await adminService.getPendingWithdrawals();
            if (result.success) {
                setWithdrawals(result.data);
                calculateStats(result.data);
            } else {
                setError(result.message || 'Failed to load withdrawals');
            }
        } catch (error) {
            setError('Failed to load withdrawals data');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const pending = data.filter(w => w.status === 'pending').length;
        const approved = data.filter(w => w.status === 'approved').length;
        const rejected = data.filter(w => w.status === 'rejected').length;
        const totalAmount = data.reduce((sum, w) => sum + w.amount_bdt, 0);

        setStats({
            pending,
            approved,
            rejected,
            totalAmount
        });
    };

    const filterWithdrawals = () => {
        let filtered = withdrawals;

        if (filters.status !== 'all') {
            filtered = filtered.filter(w => w.status === filters.status);
        }

        if (filters.method !== 'all') {
            filtered = filtered.filter(w => w.method === filters.method);
        }

        if (filters.dateRange !== 'all') {
            const now = new Date();
            let startDate;

            switch (filters.dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                default:
                    break;
            }

            if (startDate) {
                filtered = filtered.filter(w => new Date(w.created_at) >= startDate);
            }
        }

        setFilteredWithdrawals(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleViewDetails = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setShowDetailsModal(true);
    };

    const handleProcessWithdrawal = async (withdrawalId, action, reason = '') => {
        setLoading(true);
        try {
            const result = await adminService.updateWithdrawalStatus({
                withdrawalId,
                action,
                reason
            });

            if (result.success) {
                setSuccess(`Withdrawal ${action}ed successfully`);
                await loadWithdrawals(); // Reload data
                setShowDetailsModal(false);
            } else {
                setError(result.message || `Failed to ${action} withdrawal`);
            }
        } catch (error) {
            setError(`Failed to ${action} withdrawal`);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            key: 'id', 
            title: 'ID', 
            width: '80px',
            sortable: true 
        },
        { 
            key: 'user', 
            title: 'User',
            render: (value, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '12px'
                    }}>
                        {record.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>
                            {record.username}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            {record.phone}
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: 'amount_bdt', 
            title: 'Amount',
            render: (value) => (
                <span style={{ color: '#dc3545', fontWeight: '600' }}>
                    {formatBDT(value)}
                </span>
            ),
            sortable: true 
        },
        { 
            key: 'method', 
            title: 'Method',
            render: (value) => <MethodBadge method={value}>{value.toUpperCase()}</MethodBadge>
        },
        { 
            key: 'account_number', 
            title: 'Account',
            render: (value, record) => (
                <div>
                    <div style={{ fontWeight: '600', fontSize: '12px' }}>
                        {record.method === 'bep20' ? shortenAddress(value, 8) : value}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6c757d', textTransform: 'capitalize' }}>
                        {record.method}
                    </div>
                </div>
            )
        },
        { 
            key: 'status', 
            title: 'Status',
            render: (value) => <StatusBadge status={value}>{value}</StatusBadge>,
            sortable: true 
        },
        { 
            key: 'created_at', 
            title: 'Requested',
            render: (value) => formatDate(value),
            sortable: true 
        },
        { 
            key: 'actions', 
            title: 'Actions',
            render: (value, record) => (
                <ActionButtons>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleViewDetails(record)}
                    >
                        <Eye size={14} />
                        View
                    </Button>
                    
                    {record.status === 'pending' && (
                        <>
                            <Button
                                variant="success"
                                size="small"
                                onClick={() => handleProcessWithdrawal(record.id, 'approve')}
                            >
                                <CheckCircle size={14} />
                                Approve
                            </Button>
                            
                            <Button
                                variant="danger"
                                size="small"
                                onClick={() => handleProcessWithdrawal(record.id, 'reject')}
                            >
                                <XCircle size={14} />
                                Reject
                            </Button>
                        </>
                    )}
                </ActionButtons>
            )
        }
    ];

    // Helper function for address shortening
    const shortenAddress = (address, chars = 6) => {
        if (!address) return '';
        return `${address.slice(0, chars)}...${address.slice(-chars)}`;
    };

    return (
        <WithdrawalsContainer>
            {/* Page Header */}
            <PageHeader>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Withdrawal Management
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Manage and process user withdrawal requests
                </motion.p>
            </PageHeader>

            {/* Stats Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <StatsGrid>
                    <StatCard color="#ffc107">
                        <div className="stat-content">
                            <div className="stat-info">
                                <div className="stat-value">{stats.pending}</div>
                                <div className="stat-label">Pending Withdrawals</div>
                            </div>
                            <div className="stat-icon">
                                <Clock size={24} />
                            </div>
                        </div>
                    </StatCard>

                    <StatCard color="#28a745">
                        <div className="stat-content">
                            <div className="stat-info">
                                <div className="stat-value">{stats.approved}</div>
                                <div className="stat-label">Approved Today</div>
                            </div>
                            <div className="stat-icon">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                    </StatCard>

                    <StatCard color="#dc3545">
                        <div className="stat-content">
                            <div className="stat-info">
                                <div className="stat-value">{stats.rejected}</div>
                                <div className="stat-label">Rejected Today</div>
                            </div>
                            <div className="stat-icon">
                                <XCircle size={24} />
                            </div>
                        </div>
                    </StatCard>

                    <StatCard color="#667eea">
                        <div className="stat-content">
                            <div className="stat-info">
                                <div className="stat-value">{formatBDT(stats.totalAmount)}</div>
                                <div className="stat-label">Total Pending Amount</div>
                            </div>
                            <div className="stat-icon">
                                <DollarSign size={24} />
                            </div>
                        </div>
                    </StatCard>
                </StatsGrid>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <FilterSection>
                    <div className="filter-header">
                        <h3 className="filter-title">Filters</h3>
                        <div className="filter-controls">
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={loadWithdrawals}
                            >
                                <RefreshCw size={14} />
                                Refresh
                            </Button>
                            
                            <Button
                                variant="secondary"
                                size="small"
                            >
                                <Download size={14} />
                                Export
                            </Button>
                        </div>
                    </div>

                    <FilterGrid>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                Status
                            </label>
                            <Select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="processing">Processing</option>
                            </Select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                Method
                            </label>
                            <Select
                                value={filters.method}
                                onChange={(e) => handleFilterChange('method', e.target.value)}
                            >
                                <option value="all">All Methods</option>
                                <option value="bkash">bKash</option>
                                <option value="nagad">Nagad</option>
                                <option value="rocket">Rocket</option>
                                <option value="bep20">BEP20</option>
                            </Select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                Date Range
                            </label>
                            <Select
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">This Month</option>
                            </Select>
                        </div>
                    </FilterGrid>
                </FilterSection>
            </motion.div>

            {/* Withdrawals Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Table
                    columns={columns}
                    data={filteredWithdrawals}
                    title="Withdrawal Requests"
                    searchable={true}
                    pagination={true}
                    pageSize={10}
                    emptyMessage="No withdrawal requests found"
                />
            </motion.div>

            {/* Withdrawal Details Modal */}
            {showDetailsModal && selectedWithdrawal && (
                <Modal
                    title="Withdrawal Details"
                    onClose={() => setShowDetailsModal(false)}
                    size="medium"
                >
                    <WithdrawalDetails>
                        <div className="detail-section">
                            <div className="section-title">Transaction Information</div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Withdrawal ID</span>
                                <span className="detail-value">#{selectedWithdrawal.id}</span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Amount</span>
                                <span className="detail-value amount">
                                    {formatBDT(selectedWithdrawal.amount_bdt)}
                                </span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Method</span>
                                <MethodBadge method={selectedWithdrawal.method}>
                                    {selectedWithdrawal.method.toUpperCase()}
                                </MethodBadge>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Account Number</span>
                                <span className="detail-value">
                                    {selectedWithdrawal.account_number}
                                </span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <StatusBadge status={selectedWithdrawal.status}>
                                    {selectedWithdrawal.status}
                                </StatusBadge>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Requested Date</span>
                                <span className="detail-value">
                                    {formatDate(selectedWithdrawal.created_at)}
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <div className="section-title">User Information</div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Username</span>
                                <span className="detail-value">{selectedWithdrawal.username}</span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{selectedWithdrawal.phone}</span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">User ID</span>
                                <span className="detail-value">#{selectedWithdrawal.user_id}</span>
                            </div>
                        </div>

                        {selectedWithdrawal.status === 'pending' && (
                            <ActionButtons style={{ marginTop: '24px', justifyContent: 'center' }}>
                                <Button
                                    variant="success"
                                    onClick={() => handleProcessWithdrawal(selectedWithdrawal.id, 'approve')}
                                >
                                    <CheckCircle size={16} />
                                    Approve Withdrawal
                                </Button>
                                
                                <Button
                                    variant="danger"
                                    onClick={() => handleProcessWithdrawal(selectedWithdrawal.id, 'reject')}
                                >
                                    <XCircle size={16} />
                                    Reject Withdrawal
                                </Button>
                            </ActionButtons>
                        )}
                    </WithdrawalDetails>
                </Modal>
            )}
        </WithdrawalsContainer>
    );
};

export default AdminWithdrawals;