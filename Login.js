import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import styled from 'styled-components';
import { loginSchema } from '../../utils/validation';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const LoginContainer = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
`;

const LoginCard = styled(motion.div)`
    width: 100%;
    max-width: 400px;
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

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { setLoading, setError, setSuccess, loading } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm({
        resolver: yupResolver(loginSchema)
    });

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
            const result = await authService.login(data);
            
            if (result.success) {
                setSuccess('Login successful!');
                login(result.user, result.token);
                navigate(from, { replace: true });
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (error) {
            setError(error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    // Demo credentials for testing
    const fillDemoCredentials = () => {
        setValue('phone', '01712345678');
        setValue('password', 'demo123');
    };

    return (
        <LoginContainer>
            <LoginCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Logo>
                    <h1>HelpUs</h1>
                    <p>Investment Platform</p>
                </Logo>

                <Card>
                    <Card.Header>
                        <CardTitle>Welcome Back</CardTitle>
                        <CardSubtitle>Sign in to your account</CardSubtitle>
                    </Card.Header>

                    <Card.Body>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="01712345678"
                                error={errors.phone?.message}
                                {...register('phone')}
                            />

                            <PasswordInputWrapper>
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    error={errors.password?.message}
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

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                loading={loading}
                                fullWidth
                                disabled={loading}
                            >
                                <LogIn size={18} />
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>

                            {/* Demo credentials button for testing */}
                            <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={fillDemoCredentials}
                                fullWidth
                            >
                                Fill Demo Credentials
                            </Button>
                        </Form>
                    </Card.Body>

                    <FormFooter>
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register">Create one here</Link>
                        </p>
                    </FormFooter>
                </Card>
            </LoginCard>
        </LoginContainer>
    );
};

export default Login;