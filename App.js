import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext.js';
import { AppProvider } from './contexts/AppContext.js';

// Simple components for testing
const Header = () => (
  <header style={{ 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: 'white', 
    padding: '16px 24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>HelpUs Investment</h1>
      <nav>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginLeft: '12px'
          }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginLeft: '12px'
          }}
        >
          Logout
        </button>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer style={{ 
    background: '#343a40', 
    color: 'white', 
    padding: '24px',
    textAlign: 'center',
    marginTop: 'auto'
  }}>
    <p style={{ margin: 0 }}>&copy; 2024 HelpUs Investment Platform. All rights reserved.</p>
  </footer>
);

const Loading = ({ type = 'inline', message = 'Loading...' }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: type === 'overlay' ? '100px' : '20px',
    flexDirection: 'column',
    gap: '12px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ margin: 0, color: '#6c757d' }}>{message}</p>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

// Page Components
const Login = () => {
  const { login } = React.useContext(require('./contexts/AuthContext.js').AuthContext);
  
  const handleLogin = () => {
    const user = {
      id: 1,
      username: 'john_doe',
      phone: '01712345678',
      balance_usd: 150.00,
      balance_bdt: 10500.00,
      referral_code: 'JOHN123'
    };
    const token = 'mock_jwt_token_12345';
    
    login(user, token);
    window.location.href = '/dashboard';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#333' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '32px' }}>
          Sign in to your HelpUs Investment account
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
            Phone Number
          </label>
          <input 
            type="tel" 
            placeholder="01712345678"
            value="01712345678"
            readOnly
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#f8f9fa'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
            Password
          </label>
          <input 
            type="password" 
            placeholder="Enter password"
            value="admin123"
            readOnly
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#f8f9fa'
            }}
          />
        </div>
        
        <button 
          onClick={handleLogin}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          Sign In
        </button>
        
        <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
          <p>Demo Credentials:</p>
          <p><strong>Phone:</strong> 01712345678</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = React.useContext(require('./contexts/AuthContext.js').AuthContext);
  
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px', color: '#333' }}>Welcome back, {user?.username}! 👋</h1>
        <p style={{ color: '#6c757d', fontSize: '16px' }}>Here's your investment overview</p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #667eea'
        }}>
          <h3 style={{ marginBottom: '8px', color: '#333' }}>USD Balance</h3>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#333', margin: 0 }}>
            ${user?.balance_usd || '0.00'}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #28a745'
        }}>
          <h3 style={{ marginBottom: '8px', color: '#333' }}>BDT Balance</h3>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#333', margin: 0 }}>
            ৳{user?.balance_bdt || '0.00'}
          </p>
        </div>
      </div>
      
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            💰 Make Investment
          </button>
          <button style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            📥 Deposit USDT
          </button>
          <button style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            📤 Withdraw BDT
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => (
  <div style={{ 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    padding: '20px'
  }}>
    <div>
      <h1 style={{ fontSize: '48px', marginBottom: '16px', fontWeight: '700' }}>
        HelpUs Investment
      </h1>
      <p style={{ fontSize: '20px', marginBottom: '32px', opacity: '0.9' }}>
        Professional Investment Platform with Daily Profits
      </p>
      <button 
        onClick={() => window.location.href = '/login'}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '14px 32px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)'
        }}
      >
        Get Started
      </button>
    </div>
  </div>
);

const NotFound = () => (
  <div style={{ 
    minHeight: '60vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '40px',
    textAlign: 'center'
  }}>
    <h1 style={{ fontSize: '72px', marginBottom: '16px', color: '#667eea' }}>404</h1>
    <h2 style={{ marginBottom: '16px', color: '#333' }}>Page Not Found</h2>
    <p style={{ color: '#6c757d', marginBottom: '32px' }}>
      The page you're looking for doesn't exist.
    </p>
    <button 
      onClick={() => window.location.href = '/'}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
      }}
    >
      Go Home
    </button>
  </div>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Simple auth check
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

// Layout Component
const Layout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showHeader && <Header />}
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={
                    <PublicRoute>
                      <Layout showHeader={false} showFooter={false}>
                        <Home />
                      </Layout>
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Layout showHeader={false} showFooter={false}>
                        <Login />
                      </Layout>
                    </PublicRoute>
                  } 
                />

                {/* Protected User Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />

                {/* 404 Page */}
                <Route 
                  path="*" 
                  element={
                    <Layout>
                      <NotFound />
                    </Layout>
                  } 
                />
              </Routes>
              
              {/* Toast Notifications */}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </Router>
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;