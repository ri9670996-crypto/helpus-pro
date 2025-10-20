import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { 
    User, 
    Mail, 
    Phone, 
    Wallet, 
    Copy,
    CheckCircle,
    Save
} from 'lucide-react';
import styled from 'styled-components';
import { profileSchema } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { userService } from '../../services/user';
import { copyToClipboard, getBEP20Address, isValidBEP20 } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ProfileContainer = styled.div`
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
`;

const ProfileHeader = styled.div`
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

const FormContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
`;

const Section = styled(Card)`
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
        
        p {
            margin: 4px 0 0 0;
            color: #6c757d;
            font-size: 14px;
        }
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const BEP20Section = styled.div`
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #17a2b8;
    
    h4 {
        margin: 0 0 8px 0;
        color: #17a2b8;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .current-address {
        background: white;
        padding: 12px 16px;
        border-radius: 6px;
        margin: 12px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        code {
            font-family: monospace;
            font-size: 14px;
            color: #333;
        }
        
        .copy-btn {
            background: none;
            border: none;
            color: #17a2b8;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            
            &:hover {
                background: #e9ecef;
            }
            
            &.copied {
                color: #28a745;
            }
        }
    }
    
    .address-info {
        font-size: 12px;
        color: #6c757d;
        margin: 0;
        
        &.default {
            color: #ffc107;
            font-weight: 600;
        }
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
`;

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { setLoading, setError, setSuccess, loading } = useApp();
    const [copiedField, setCopiedField] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        watch,
        reset
    } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || '',
            email: user?.email || '',
            bkash_number: user?.bkash_number || '',
            bep20_address: user?.bep20_address || ''
        }
    });

    const currentBEP20 = getBEP20Address(user);
    const bep20Address = watch('bep20_address');
    const isUsingDefaultBEP20 = !user?.bep20_address;

    const copyAddress = async (address, field) => {
        const success = await copyToClipboard(address);
        if (success) {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const result = await userService.updateProfile(data);
            
            if (result.success) {
                setSuccess('Profile updated successfully!');
                updateUser(data);
                reset(data); // Reset form state
            } else {
                setError(result.message || 'Failed to update profile');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        reset({
            full_name: user?.full_name || '',
            email: user?.email || '',
            bkash_number: user?.bkash_number || '',
            bep20_address: user?.bep20_address || ''
        });
    };

    return (
        <ProfileContainer>
            <ProfileHeader>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Profile Settings
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Manage your personal information and payment methods
                </motion.p>
            </ProfileHeader>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <FormContainer>
                    {/* Personal Information Section */}
                    <Section>
                        <div className="section-header">
                            <div className="icon">
                                <User size={20} />
                            </div>
                            <div>
                                <h2>Personal Information</h2>
                                <p>Update your basic profile details</p>
                            </div>
                        </div>

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <FormRow>
                                <Input
                                    label="Full Name"
                                    type="text"
                                    placeholder="John Doe"
                                    error={errors.full_name?.message}
                                    icon={<User size={16} />}
                                    {...register('full_name')}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="john@example.com"
                                    error={errors.email?.message}
                                    icon={<Mail size={16} />}
                                    {...register('email')}
                                />
                            </FormRow>

                            <Input
                                label="Phone Number"
                                type="tel"
                                value={user?.phone || ''}
                                disabled
                                icon={<Phone size={16} />}
                                helpText="Phone number cannot be changed"
                            />
                        </Form>
                    </Section>

                    {/* Payment Methods Section */}
                    <Section>
                        <div className="section-header">
                            <div className="icon">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <h2>Payment Methods</h2>
                                <p>Manage your withdrawal and deposit addresses</p>
                            </div>
                        </div>

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            {/* Bkash Number */}
                            <Input
                                label="Bkash Number"
                                type="tel"
                                placeholder="01712345678"
                                error={errors.bkash_number?.message}
                                helpText="For BDT withdrawals to your Bkash account"
                                icon={<Phone size={16} />}
                                {...register('bkash_number')}
                            />

                            {/* BEP20 Address Section */}
                            <BEP20Section>
                                <h4>
                                    <Wallet size={16} />
                                    BEP20 Address (USDT Withdrawals)
                                </h4>
                                
                                <div className="current-address">
                                    <code>{currentBEP20}</code>
                                    <button
                                        type="button"
                                        className={`copy-btn ${copiedField === 'current' ? 'copied' : ''}`}
                                        onClick={() => copyAddress(currentBEP20, 'current')}
                                    >
                                        {copiedField === 'current' ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </button>
                                </div>
                                
                                <p className={`address-info ${isUsingDefaultBEP20 ? 'default' : ''}`}>
                                    {isUsingDefaultBEP20 
                                        ? '⚡ Currently using system default address'
                                        : '✅ Using your custom BEP20 address'
                                    }
                                </p>
                            </BEP20Section>

                            {/* BEP20 Address Input */}
                            <Input
                                label="Custom BEP20 Address (Optional)"
                                type="text"
                                placeholder="0x2269ce1f94e6e2ab5ac933adae12e37ceba2a5cf"
                                error={errors.bep20_address?.message}
                                helpText="Enter your personal BEP20 address for USDT withdrawals. Leave empty to use system default."
                                {...register('bep20_address')}
                            />

                            {bep20Address && isValidBEP20(bep20Address) && (
                                <BEP20Section style={{ borderLeftColor: '#28a745' }}>
                                    <h4 style={{ color: '#28a745' }}>
                                        <CheckCircle size={16} />
                                        Valid BEP20 Address
                                    </h4>
                                    <p className="address-info">
                                        This address will be used for your USDT withdrawals.
                                    </p>
                                </BEP20Section>
                            )}

                            {bep20Address && !isValidBEP20(bep20Address) && (
                                <BEP20Section style={{ borderLeftColor: '#dc3545' }}>
                                    <h4 style={{ color: '#dc3545' }}>
                                        ⚠️ Invalid BEP20 Address
                                    </h4>
                                    <p className="address-info">
                                        Please enter a valid BEP20 address starting with 0x and 42 characters long.
                                    </p>
                                </BEP20Section>
                            )}

                            {/* Action Buttons */}
                            <ActionButtons>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleReset}
                                    disabled={!isDirty || loading}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={loading}
                                    disabled={!isDirty || loading}
                                >
                                    <Save size={16} />
                                    Save Changes
                                </Button>
                            </ActionButtons>
                        </Form>
                    </Section>

                    {/* Account Information Section */}
                    <Section>
                        <div className="section-header">
                            <div className="icon">
                                <User size={20} />
                            </div>
                            <div>
                                <h2>Account Information</h2>
                                <p>Your account details and referral information</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <strong>Username:</strong>
                                    <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                                        {user?.username}
                                    </p>
                                </div>
                                <div>
                                    <strong>User ID:</strong>
                                    <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                                        #{user?.id}
                                    </p>
                                </div>
                            </div>

                            {user?.referral_code && (
                                <div>
                                    <strong>Referral Code:</strong>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        marginTop: '4px'
                                    }}>
                                        <code style={{ 
                                            background: '#f8f9fa', 
                                            padding: '8px 12px', 
                                            borderRadius: '6px',
                                            fontFamily: 'monospace',
                                            fontSize: '14px'
                                        }}>
                                            {user.referral_code}
                                        </code>
                                        <button
                                            type="button"
                                            className={`copy-btn ${copiedField === 'referral' ? 'copied' : ''}`}
                                            onClick={() => copyAddress(user.referral_code, 'referral')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#667eea',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            {copiedField === 'referral' ? (
                                                <CheckCircle size={16} />
                                            ) : (
                                                <Copy size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <strong>Member Since:</strong>
                                <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </Section>
                </FormContainer>
            </motion.div>
        </ProfileContainer>
    );
};

export default Profile;