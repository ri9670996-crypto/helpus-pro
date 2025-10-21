import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Users } from 'lucide-react';
import styled from 'styled-components';
import { registerSchema } from '../../utils/validation';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const RegisterContainer = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
`;

const RegisterCard = styled(motion.div)`
    width: 100%;
    max-width: 500px;
`;

const Logo = styled.div`
    text-align: center;
    margin-bottom: 30px;
    
    h1 {
        color: white;
        font-size: 32px;
        font-weight: 700;
        margin: 0;
    }
    
    p {
        color: rgba(255, 255, 255, 0.8);
        margin: 8px 0 0 0;
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

const ReferralSection = styled.div`
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #28a745;
    
    h4 {
        margin: 0 0 8px 0;
        color: #28a745;
        font-size: 14px;
        font-weight: 600;
    }
    
    p {
        margin: 0;
        font-size: 12px;
        color: #6c757d;
    }
`;

const FormFooter = styled.div`
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    
    p {
        margin: 0;
        color: #6c757d;
    }
    
    a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        
        &:hover {
            text-decoration: underline;
        }
    }
`;

const PasswordInputWrapper = styled.div`
    position: relative;
    
    .password-toggle {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #6c757d;
        cursor: pointer;
        padding: 4px;
        
        &:hover {
            color: #333;
        }
    }
`;

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const referralCode = searchParams.get('ref');
    
    const { login } = useAuth();
    const { setLoading, setError, setSuccess, loading } = useApp();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(registerSchema)
    });

    // Set referral code from URL if present
    useEffect(() => {
        if (referralCode) {
            setValue('referral_code', referralCode);
        }
    }, [referralCode, setValue]);

    // Check if user is already logged in
    useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const result = await authService.register(data);
            
            if (result.success) {
                setSuccess('Registration successful! Welcome to HelpUs Investment.');
                login(result.user, result.token);
                navigate('/dashboard', { replace: true });
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (error) {
            setError(error.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    const fillDemoData = () => {
        const demoUsername = `user${Math.floor(Math.random() * 1000)}`;
        setValue('username', demoUsername);
        setValue('phone', `017${Math.floor(10000000 + Math.random() * 90000000)}`);
        setValue('password', 'demo123');
        setValue('full_name', 'Demo User');
        setValue('email', `${demoUsername}@demo.com`);
    };

    const hasReferralCode = watch('referral_code');

    return (
        <RegisterContainer>
            <RegisterCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Logo>
                    <h1>HelpUs</h1>
                    <p>Start Your Investment Journey</p>
                </Logo>

                <Card>
                    <Card.Header>
                        <CardTitle>Create Account</CardTitle>
                        <CardSubtitle>Join our investment platform today</CardSubtitle>
                    </Card.Header>

                    <Card.Body>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <FormRow>
                                <Input
                                    label="Username *"
                                    type="text"
                                    placeholder="johndoe"
                                    error={errors.username?.message}
                                    helpText="3-20 characters, letters, numbers and underscores only"
                                    {...register('username')}
                                />
                                <Input
                                    label="Phone Number *"
                                    type="tel"
                                    placeholder="01712345678"
                                    error={errors.phone?.message}
                                    {...register('phone')}
                                />
                            </FormRow>

                            <PasswordInputWrapper>
                                <Input
                                    label="Password *"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter a strong password"
                                    error={errors.password?.message}
                                    helpText="Minimum 6 characters"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </PasswordInputWrapper>

                            <FormRow>
                                <Input
                                    label="Full Name"
                                    type="text"
                                    placeholder="John Doe"
                                    error={errors.full_name?.message}
                                    {...register('full_name')}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="john@example.com"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </FormRow>

                            <Input
                                label="Referral Code (Optional)"
                                type="text"
                                placeholder="Enter referral code"
                                error={errors.referral_code?.message}
                                {...register('referral_code')}
                            />

                            {hasReferralCode && (
                                <ReferralSection>
                                    <h4>
                                        <Users size={16} style={{ marginRight: '8px' }} />
                                        Referral Bonus Activated!
                                    </h4>
                                    <p>You will receive special benefits when your referral makes investments.</p>
                                </ReferralSection>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                loading={loading}
                                fullWidth
                                disabled={loading}
                            >
                                <UserPlus size={18} />
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            {/* Demo data button for testing */}
                            <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={fillDemoData}
                                fullWidth
                            >
                                Fill Demo Data
                            </Button>
                        </Form>
                    </Card.Body>

                    <FormFooter>
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">Sign in here</Link>
                        </p>
                    </FormFooter>
                </Card>
            </RegisterCard>
        </RegisterContainer>
    );
};

export default Register;