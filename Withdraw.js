import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowUpRight, 
    Wallet, 
    CreditCard,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import { withdrawalSchema } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { userService } from '../../services/user';
import { formatBDT, getBEP20Address, isValidBEP20 } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const WithdrawContainer = styled.div`
    padding: 24px;
    max-width: 800px;
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

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const BalanceCard = styled(Card)`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    h2, p {
        color: white;
    }
`;

const BalanceAmount = styled.div`
    font-size: 32px;
    font-weight: 700;
    margin: 8px 0;
`;

const MethodSelector = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
`;

const MethodOption = styled.label`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    border: 2px solid ${props => props.selected ? '#667eea' : '#e9ecef'};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: ${props => props.selected ? '#f8f9ff' : 'white'};
    
    &:hover {
        border-color: #667eea;
    }
    
    input {
        display: none;
    }
    
    .icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${props => props.selected ? '#667eea' : '#6c757d'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-bottom: 8px;
    }
    
    .name {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
    }
    
    .fee {
        font-size: 12px;
        color: #6c757d;
    }
`;

const FormSection = styled(Card)`
    .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        
        .icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #333;
        }
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const AmountInput = styled.div`
    position: relative;
    
    .currency {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: 600;
        color: #6c757d;
    }
    
    input {
        padding-left: 40px;
    }
`;

const QuickAmounts = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 8px;
`;

const QuickAmount = styled.button`
    padding: 8px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: #667eea;
        background: #f8f9ff;
    }
    
    &.selected {
        background: #667eea;
        color: white;
        border-color: #667eea;
    }
`;

const InfoBox = styled.div`
    background: ${props => {
        switch (props.type) {
            case 'warning': return '#fff3cd';
            case 'success': return '#d4edda';
            default: return '#e7f3ff';
        }
    }};
    border: 1px solid ${props => {
        switch (props.type) {
            case 'warning': return '#ffeaa7';
            case 'success': return '#c3e6cb';
            default: return '#b3d9ff';
        }
    }};
    border-radius: 8px;
    padding: 12px 16px;
    margin-top: 16px;
    
    h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: ${props => {
            switch (props.type) {
                case 'warning': return '#856404';
                case 'success': return '#155724';
                default: return '#0066cc';
            }
        }};
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    p {
        margin: 0;
        font-size: 13px;
        color: ${props => {
            switch (props.type) {
                case 'warning': return '#856404';
                case 'success': return '#155724';
                default: return '#0066cc';
            }
        }};
    }
`;

const WithdrawalHistory = styled.div`
    margin-top: 32px;
`;

const HistoryItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
        border-bottom: none;
    }
    
    .details {
        flex: 1;
        
        .amount {
            font-weight: 600;
            color: #dc3545;
            margin-bottom: 4px;
        }
        
        .method {
            font-size: 12px;
            color: #6c757d;
            text-transform: capitalize;
        }
    }
    
    .status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        
        &.pending {
            background: #fff3cd;
            color: #856404;
        }
        
        &.approved {
            background: #d4edda;
            color: #155724;
        }
        
        &.rejected {
            background: #f8d7da;
            color: #721c24;
        }
    }
    
    .date {
        font-size: 11px;
        color: #6c757d;
        text-align: right;
    }
`;

const Withdraw = () => {
    const { user } = useAuth();
    const { setLoading, setError, setSuccess, loading } = useApp();
    const [withdrawalMethod, setWithdrawalMethod] = useState('bkash');
    const [quickAmount, setQuickAmount] = useState(null);
    const [withdrawalHistory, setWithdrawalHistory] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm({
        resolver: yupResolver(withdrawalSchema),
        defaultValues: {
            method: 'bkash'
        }
    });

    const amount = watch('amount_bdt');
    const method = watch('method');
    const accountNumber = watch('account_number');

    useEffect(() => {
        fetchWithdrawalHistory();
    }, []);

    useEffect(() => {
        // Set default account number based on method and user data
        if (method === 'bkash' && user?.bkash_number) {
            setValue('account_number', user.bkash_number);
        } else if (method === 'bep20' && user?.bep20_address) {
            setValue('account_number', user.bep20_address);
        } else {
            setValue('account_number', '');
        }
    }, [method, user, setValue]);

    const fetchWithdrawalHistory = async () => {
        // Mock withdrawal history - replace with actual API call
        const mockHistory = [
            {
                id: 1,
                amount_bdt: 1000,
                method: 'bkash',
                status: 'approved',
                account_number: '017*******',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                amount_bdt: 500,
                method: 'bep20',
                status: 'pending',
                account_number: '0x1234...5678',
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        setWithdrawalHistory(mockHistory);
    };

    const handleMethodChange = (method) => {
        setWithdrawalMethod(method);
        setValue('method', method);
    };

    const handleQuickAmount = (amount) => {
        setQuickAmount(amount);
        setValue('amount_bdt', amount);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const result = await userService.requestWithdrawal(data);
            
            if (result.success) {
                setSuccess(`Withdrawal request for ${formatBDT(data.amount_bdt)} submitted successfully!`);
                reset();
                setQuickAmount(null);
                
                // Refresh history
                fetchWithdrawalHistory();
            } else {
                setError(result.message || 'Withdrawal request failed');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while processing withdrawal');
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    const quickAmounts = [500, 1000, 2000, 5000];

    return (
        <WithdrawContainer>
            <PageHeader>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Withdraw Funds
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Withdraw your earnings to Bkash or USDT (BEP20)
                </motion.p>
            </PageHeader>

            <ContentGrid>
                {/* Left Column - Balance and Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <BalanceCard>
                        <Card.Header>
                            <CardTitle>Available Balance</CardTitle>
                            <CardSubtitle>Amount available for withdrawal</CardSubtitle>
                        </Card.Header>
                        <Card.Body>
                            <BalanceAmount>
                                {formatBDT(user?.balance_bdt || 0)}
                            </BalanceAmount>
                            <p>This amount can be withdrawn to your preferred method</p>
                        </Card.Body>
                    </BalanceCard>

                    <InfoBox type="info" style={{ marginTop: '24px' }}>
                        <h4>
                            <Wallet size={16} />
                            Withdrawal Information
                        </h4>
                        <p>
                            <strong>Minimum:</strong> 500 BDT<br />
                            <strong>Maximum:</strong> 25,000 BDT<br />
                            <strong>Processing Time:</strong> 24-48 hours<br />
                            <strong>Bkash Fee:</strong> 10 BDT<br />
                            <strong>USDT Fee:</strong> 1 USDT
                        </p>
                    </InfoBox>

                    {/* Withdrawal History */}
                    <WithdrawalHistory>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Recent Withdrawals</h3>
                        <Card>
                            <Card.Body>
                                {withdrawalHistory.length > 0 ? (
                                    withdrawalHistory.map((withdrawal, index) => (
                                        <motion.div
                                            key={withdrawal.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <HistoryItem>
                                                <div className="details">
                                                    <div className="amount">
                                                        {formatBDT(withdrawal.amount_bdt)}
                                                    </div>
                                                    <div className="method">
                                                        {withdrawal.method} • {withdrawal.account_number}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div className={`status ${withdrawal.status}`}>
                                                        {getStatusText(withdrawal.status)}
                                                    </div>
                                                    <div className="date">
                                                        {new Date(withdrawal.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </HistoryItem>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                                        No withdrawal history found
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </WithdrawalHistory>
                </motion.div>

                {/* Right Column - Withdrawal Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <FormSection>
                        <div className="section-header">
                            <div className="icon">
                                <ArrowUpRight size={20} />
                            </div>
                            <div>
                                <h2>Withdrawal Request</h2>
                                <p>Choose method and enter details</p>
                            </div>
                        </div>

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            {/* Method Selection */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600' }}>
                                    Withdrawal Method
                                </label>
                                <MethodSelector>
                                    <MethodOption 
                                        selected={method === 'bkash'}
                                        onClick={() => handleMethodChange('bkash')}
                                    >
                                        <input 
                                            type="radio" 
                                            value="bkash" 
                                            {...register('method')}
                                        />
                                        <div className="icon">
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="name">Bkash</div>
                                        <div className="fee">Fee: 10 BDT</div>
                                    </MethodOption>

                                    <MethodOption 
                                        selected={method === 'bep20'}
                                        onClick={() => handleMethodChange('bep20')}
                                    >
                                        <input 
                                            type="radio" 
                                            value="bep20" 
                                            {...register('method')}
                                        />
                                        <div className="icon">
                                            <Wallet size={20} />
                                        </div>
                                        <div className="name">USDT (BEP20)</div>
                                        <div className="fee">Fee: 1 USDT</div>
                                    </MethodOption>
                                </MethodSelector>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Amount (BDT)
                                </label>
                                <AmountInput>
                                    <span className="currency">৳</span>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        min="500"
                                        max="25000"
                                        step="0.01"
                                        error={errors.amount_bdt?.message}
                                        {...register('amount_bdt')}
                                    />
                                </AmountInput>

                                <QuickAmounts>
                                    {quickAmounts.map(amt => (
                                        <QuickAmount
                                            key={amt}
                                            type="button"
                                            className={quickAmount === amt ? 'selected' : ''}
                                            onClick={() => handleQuickAmount(amt)}
                                        >
                                            ৳{amt}
                                        </QuickAmount>
                                    ))}
                                </QuickAmounts>
                            </div>

                            {/* Account Number Input */}
                            <Input
                                label={
                                    method === 'bkash' 
                                        ? 'Bkash Number' 
                                        : 'BEP20 Address'
                                }
                                type="text"
                                placeholder={
                                    method === 'bkash'
                                        ? '01712345678'
                                        : '0x...'
                                }
                                error={errors.account_number?.message}
                                helpText={
                                    method === 'bkash'
                                        ? 'Your Bkash mobile number'
                                        : 'Your BEP20 address for USDT'
                                }
                                {...register('account_number')}
                            />

                            {/* Dynamic Info Boxes */}
                            {method === 'bep20' && accountNumber && !isValidBEP20(accountNumber) && (
                                <InfoBox type="warning">
                                    <h4>
                                        <AlertTriangle size={16} />
                                        Invalid BEP20 Address
                                    </h4>
                                    <p>Please enter a valid BEP20 address starting with 0x</p>
                                </InfoBox>
                            )}

                            {amount > 0 && user?.balance_bdt < amount && (
                                <InfoBox type="warning">
                                    <h4>
                                        <AlertTriangle size={16} />
                                        Insufficient Balance
                                    </h4>
                                    <p>Your available balance is less than the withdrawal amount</p>
                                </InfoBox>
                            )}

                            {amount >= 500 && amount <= 25000 && user?.balance_bdt >= amount && (
                                <InfoBox type="success">
                                    <h4>
                                        <CheckCircle size={16} />
                                        Withdrawal Summary
                                    </h4>
                                    <p>
                                        <strong>Amount:</strong> {formatBDT(amount)}<br />
                                        <strong>Fee:</strong> {formatBDT(method === 'bkash' ? 10 : 1 * 110)}<br />
                                        <strong>You'll receive:</strong> {formatBDT(method === 'bkash' ? amount - 10 : amount - (1 * 110))}
                                    </p>
                                </InfoBox>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                loading={loading}
                                fullWidth
                                disabled={
                                    loading || 
                                    !amount || 
                                    amount < 500 || 
                                    amount > 25000 || 
                                    user?.balance_bdt < amount ||
                                    (method === 'bep20' && accountNumber && !isValidBEP20(accountNumber))
                                }
                            >
                                <ArrowUpRight size={18} />
                                {loading ? 'Processing...' : 'Request Withdrawal'}
                            </Button>
                        </Form>
                    </FormSection>
                </motion.div>
            </ContentGrid>
        </WithdrawContainer>
    );
};

export default Withdraw;