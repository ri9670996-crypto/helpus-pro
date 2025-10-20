import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowDownLeft, 
    Copy, 
    CheckCircle, 
    ExternalLink,
    Wallet,
    AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
import { depositSchema } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { userService } from '../../services/user';
import { copyToClipboard, getBEP20Address, shortenAddress } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const DepositContainer = styled.div`
    padding: 24px;
    max-width: 1000px;
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
    
    @media (max-width: 968px) {
        grid-template-columns: 1fr;
    }
`;

const AddressSection = styled(Card)`
    .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        
        .icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

const AddressDisplay = styled.div`
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e9ecef;
    margin-bottom: 20px;
`;

const AddressText = styled.code`
    display: block;
    font-family: monospace;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    word-break: break-all;
    margin-bottom: 16px;
    line-height: 1.4;
`;

const AddressActions = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
`;

const QRCodeSection = styled.div`
    text-align: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e9ecef;
    
    h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }
`;

const WarningBox = styled.div`
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
    
    .warning-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        
        h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #856404;
        }
        
        svg {
            color: #f39c12;
        }
    }
    
    ul {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: #856404;
        
        li {
            margin-bottom: 4px;
        }
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const NetworkInfo = styled.div`
    background: #e7f3ff;
    border: 1px solid #b3d9ff;
    border-radius: 8px;
    padding: 12px 16px;
    
    h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: #0066cc;
    }
    
    p {
        margin: 0;
        font-size: 12px;
        color: #0066cc;
    }
`;

const DepositHistory = styled.div`
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
    
    .amount {
        font-weight: 600;
        color: #28a745;
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
        
        &.confirmed {
            background: #d4edda;
            color: #155724;
        }
        
        &.rejected {
            background: #f8d7da;
            color: #721c24;
        }
    }
    
    .date {
        font-size: 12px;
        color: #6c757d;
    }
`;

const Deposit = () => {
    const { user } = useAuth();
    const { setLoading, setError, setSuccess, loading } = useApp();
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(true);
    const [depositHistory, setDepositHistory] = useState([]);

    const bep20Address = getBEP20Address(user);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm({
        resolver: yupResolver(depositSchema)
    });

    const amount = watch('amount_usd');

    useEffect(() => {
        // Fetch deposit history
        fetchDepositHistory();
    }, []);

    const fetchDepositHistory = async () => {
        // Mock deposit history - replace with actual API call
        const mockHistory = [
            {
                id: 1,
                amount_usd: 100,
                status: 'confirmed',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                transaction_hash: '0x1234...5678'
            },
            {
                id: 2,
                amount_usd: 50,
                status: 'pending',
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                transaction_hash: '0xabcd...efgh'
            }
        ];
        setDepositHistory(mockHistory);
    };

    const copyAddress = async () => {
        const success = await copyToClipboard(bep20Address);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const viewOnBscScan = () => {
        // This would open the address in BscScan
        window.open(`https://bscscan.com/address/${bep20Address}`, '_blank');
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            // Here you would call the actual deposit API
            // const result = await userService.deposit(data);
            
            // Mock success response
            setSuccess(`Deposit request for $${data.amount_usd} submitted successfully!`);
            reset();
            
            // Refresh history
            fetchDepositHistory();
        } catch (error) {
            setError(error.message || 'An error occurred while processing deposit');
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    return (
        <DepositContainer>
            <PageHeader>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Deposit USDT
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Add funds to your account using USDT (BEP20)
                </motion.p>
            </PageHeader>

            <ContentGrid>
                {/* Left Column - Address and QR Code */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <AddressSection>
                        <div className="section-header">
                            <div className="icon">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <h2>Deposit Address</h2>
                                <p>Send USDT to this BEP20 address</p>
                            </div>
                        </div>

                        <AddressDisplay>
                            <AddressText>{bep20Address}</AddressText>
                            <AddressActions>
                                <Button
                                    variant={copied ? "success" : "primary"}
                                    size="small"
                                    onClick={copyAddress}
                                >
                                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied!' : 'Copy Address'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={viewOnBscScan}
                                >
                                    <ExternalLink size={16} />
                                    View on BscScan
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => setShowQR(!showQR)}
                                >
                                    {showQR ? 'Hide QR' : 'Show QR'}
                                </Button>
                            </AddressActions>
                        </AddressDisplay>

                        {showQR && (
                            <QRCodeSection>
                                <h3>Scan QR Code</h3>
                                <QRCode 
                                    value={bep20Address}
                                    size={200}
                                    level="M"
                                    includeMargin
                                />
                                <p style={{ marginTop: '12px', fontSize: '12px', color: '#6c757d' }}>
                                    Scan with your wallet app
                                </p>
                            </QRCodeSection>
                        )}

                        <WarningBox>
                            <div className="warning-header">
                                <AlertCircle size={16} />
                                <h4>Important Instructions</h4>
                            </div>
                            <ul>
                                <li>Only send <strong>USDT</strong> on the <strong>BEP20</strong> network</li>
                                <li>Do not send other cryptocurrencies or use other networks</li>
                                <li>Minimum deposit: <strong>10 USDT</strong></li>
                                <li>Transactions typically take 10-30 minutes to confirm</li>
                                <li>Contact support if your deposit doesn't appear within 2 hours</li>
                            </ul>
                        </WarningBox>
                    </AddressSection>
                </motion.div>

                {/* Right Column - Deposit Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <FormSection>
                        <div className="section-header">
                            <div className="icon">
                                <ArrowDownLeft size={20} />
                            </div>
                            <div>
                                <h2>Submit Deposit</h2>
                                <p>Enter your transaction details</p>
                            </div>
                        </div>

                        <NetworkInfo>
                            <h4>📋 Network Information</h4>
                            <p>
                                <strong>Network:</strong> Binance Smart Chain (BEP20) <br />
                                <strong>Asset:</strong> USDT (BEP20) <br />
                                <strong>Address:</strong> {shortenAddress(bep20Address, 8)}
                            </p>
                        </NetworkInfo>

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input
                                label="Amount (USD)"
                                type="number"
                                placeholder="Enter amount in USD"
                                min="10"
                                step="0.01"
                                error={errors.amount_usd?.message}
                                helpText="Minimum deposit: 10 USD"
                                {...register('amount_usd')}
                            />

                            <Input
                                label="Transaction Hash"
                                type="text"
                                placeholder="0x..."
                                error={errors.transaction_hash?.message}
                                helpText="Enter the transaction hash from your wallet"
                                {...register('transaction_hash')}
                            />

                            {amount >= 10 && (
                                <div style={{
                                    background: '#d4edda',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #c3e6cb'
                                }}>
                                    <strong>Expected Deposit:</strong> {amount} USDT
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                loading={loading}
                                fullWidth
                                disabled={loading}
                            >
                                <ArrowDownLeft size={18} />
                                {loading ? 'Processing...' : 'Submit Deposit Request'}
                            </Button>
                        </Form>
                    </FormSection>

                    {/* Deposit History */}
                    <DepositHistory>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Recent Deposits</h3>
                        <Card>
                            <Card.Body>
                                {depositHistory.length > 0 ? (
                                    depositHistory.map((deposit, index) => (
                                        <motion.div
                                            key={deposit.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <HistoryItem>
                                                <div>
                                                    <div className="amount">${deposit.amount_usd}</div>
                                                    <div className="date">
                                                        {new Date(deposit.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className={`status ${deposit.status}`}>
                                                    {getStatusText(deposit.status)}
                                                </div>
                                            </HistoryItem>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                                        No deposit history found
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </DepositHistory>
                </motion.div>
            </ContentGrid>
        </DepositContainer>
    );
};

export default Deposit;