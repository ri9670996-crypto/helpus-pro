import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

// API Base URL - Development vs Production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * HelpUs Pro - Main App Component
 * Professional React application with routing and API integration
 */

// Home Component with API Status
const Home = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [serverHealth, setServerHealth] = useState(null);
  const [apiTests, setApiTests] = useState([]);

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      console.log('🔍 Checking API at:', `${API_BASE_URL}/api/health`);
      setApiStatus('checking');
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setServerHealth(data);
        setApiStatus('connected');
        console.log('✅ API Connected:', data);
      } else {
        setApiStatus('error');
        console.error('❌ API Error:', response.status);
      }
    } catch (error) {
      setApiStatus('error');
      console.error('💥 API Connection Failed:', error);
    }
  };

  const handleTestAPI = async () => {
    try {
      setApiTests([]);
      
      // Test all API endpoints
      const endpoints = [
        { path: '/api/health', method: 'GET', name: 'Health Check' },
        { path: '/api/auth/login', method: 'GET', name: 'Auth Endpoint' },
        { path: '/api/users/dashboard', method: 'GET', name: 'User Dashboard' },
        { path: '/api/investments', method: 'GET', name: 'Investments' },
        { path: '/api/admin/dashboard/stats', method: 'GET', name: 'Admin Stats' }
      ];

      const testResults = [];

      for (const endpoint of endpoints) {
        try {
          const startTime = Date.now();
          const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          testResults.push({
            name: endpoint.name,
            path: endpoint.path,
            status: response.status,
            statusText: response.statusText,
            responseTime: responseTime,
            success: response.ok
          });

          console.log(`🧪 ${endpoint.name}:`, response.status, `(${responseTime}ms)`);
        } catch (error) {
          testResults.push({
            name: endpoint.name,
            path: endpoint.path,
            status: 'ERROR',
            statusText: error.message,
            responseTime: 0,
            success: false
          });
          console.error(`💥 ${endpoint.name}:`, error);
        }
      }

      setApiTests(testResults);
      
      const allSuccess = testResults.every(test => test.success);
      if (allSuccess) {
        alert('🎉 All API endpoints tested successfully! Check console for details.');
      } else {
        alert('⚠️ Some API endpoints failed. Check console for details.');
      }
    } catch (error) {
      alert('💥 API test failed: ' + error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🚀 HelpUs Pro</h1>
        <p style={styles.subtitle}>Investment Management Platform</p>
        
        <div style={styles.card}>
          <h2>Welcome to HelpUs Pro</h2>
          <p>Your professional investment management solution</p>
          
          <div style={styles.featureGrid}>
            <div style={styles.feature}>
              <h3>💼 Investments</h3>
              <p>Manage your investment portfolio</p>
            </div>
            <div style={styles.feature}>
              <h3>💰 Withdrawals</h3>
              <p>Easy and secure withdrawals</p>
            </div>
            <div style={styles.feature}>
              <h3>📊 Dashboard</h3>
              <p>Real-time analytics and reports</p>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <Link to="/auth/login" style={styles.primaryButton}>
              Login
            </Link>
            <Link to="/auth/register" style={styles.secondaryButton}>
              Register
            </Link>
            <button onClick={handleTestAPI} style={styles.outlineButton}>
              Test API Connection
            </button>
            <button onClick={checkAPIStatus} style={styles.smallButton}>
              Refresh Status
            </button>
          </div>
        </div>

        <div style={styles.status}>
          <h3>System Status</h3>
          <div style={styles.statusItem}>
            <span>Frontend:</span>
            <span style={styles.statusSuccess}>✅ Running</span>
          </div>
          <div style={styles.statusItem}>
            <span>Backend API:</span>
            <span style={
              apiStatus === 'connected' ? styles.statusSuccess : 
              apiStatus === 'error' ? styles.statusError : styles.statusWarning
            }>
              {apiStatus === 'connected' ? ' ✅ Connected' : 
               apiStatus === 'error' ? ' ❌ Disconnected' : ' ⚡ Checking...'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span>Database:</span>
            <span style={styles.statusWarning}>⚠️ Development Mode</span>
          </div>
          
          {serverHealth && (
            <div style={styles.serverInfo}>
              <h4>Server Information:</h4>
              <p><strong>Message:</strong> {serverHealth.message}</p>
              <p><strong>Environment:</strong> {serverHealth.environment}</p>
              <p><strong>Version:</strong> {serverHealth.version || '1.0.0'}</p>
              <p><strong>Timestamp:</strong> {new Date(serverHealth.timestamp).toLocaleString()}</p>
            </div>
          )}
        </div>

        {apiTests.length > 0 && (
          <div style={styles.apiTestResults}>
            <h3>API Test Results</h3>
            {apiTests.map((test, index) => (
              <div key={index} style={{
                ...styles.testResult,
                background: test.success ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)'
              }}>
                <div style={styles.testHeader}>
                  <span style={styles.testName}>{test.name}</span>
                  <span style={test.success ? styles.statusSuccess : styles.statusError}>
                    {test.success ? '✅' : '❌'} {test.status}
                  </span>
                </div>
                <div style={styles.testDetails}>
                  <span>Path: {test.path}</span>
                  <span>Time: {test.responseTime}ms</span>
                </div>
                {!test.success && (
                  <div style={styles.errorDetails}>
                    Error: {test.statusText}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={styles.debugInfo}>
          <h4>Connection Debug Information:</h4>
          <p><strong>API Base URL:</strong> <code>{API_BASE_URL}</code></p>
          <p><strong>Frontend URL:</strong> <code>{window.location.origin}</code></p>
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          <div style={styles.helpLinks}>
            <p>Need help? Check:</p>
            <ul>
              <li>✅ Is backend server running on port 5000?</li>
              <li>✅ Check browser console for CORS errors</li>
              <li>✅ Verify API endpoints are working</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = () => (
  <div style={styles.page}>
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2 style={styles.authTitle}>Login to HelpUs Pro</h2>
        <form style={styles.form}>
          <input 
            type="email" 
            placeholder="Email Address" 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Password" 
            style={styles.input}
          />
          <button type="submit" style={styles.primaryButton}>
            Sign In
          </button>
        </form>
        <p style={styles.authLink}>
          Don't have an account? <Link to="/auth/register">Register here</Link>
        </p>
        <p style={styles.authLink}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  </div>
);

// Register Component
const Register = () => (
  <div style={styles.page}>
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2 style={styles.authTitle}>Create Account</h2>
        <form style={styles.form}>
          <input 
            type="text" 
            placeholder="Full Name" 
            style={styles.input}
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Password" 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            style={styles.input}
          />
          <button type="submit" style={styles.primaryButton}>
            Create Account
          </button>
        </form>
        <p style={styles.authLink}>
          Already have an account? <Link to="/auth/login">Login here</Link>
        </p>
        <p style={styles.authLink}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  </div>
);

// Dashboard Component
const Dashboard = () => (
  <div style={styles.page}>
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>User Dashboard</h1>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/auth/login" style={styles.navLink}>Logout</Link>
        </nav>
      </div>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Total Balance</h3>
          <p style={styles.statNumber}>$1,250.00</p>
        </div>
        <div style={styles.statCard}>
          <h3>Active Investments</h3>
          <p style={styles.statNumber}>$500.00</p>
        </div>
        <div style={styles.statCard}>
          <h3>Total Earnings</h3>
          <p style={styles.statNumber}>$150.00</p>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Quick Actions</h3>
        <div style={styles.buttonGroup}>
          <button style={styles.primaryButton}>Make Investment</button>
          <button style={styles.secondaryButton}>Request Withdrawal</button>
          <button style={styles.outlineButton}>View History</button>
        </div>
      </div>
    </div>
  </div>
);

// 404 Component
const NotFound = () => (
  <div style={styles.page}>
    <div style={styles.container}>
      <div style={styles.errorContainer}>
        <h1 style={styles.errorTitle}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" style={styles.primaryButton}>
          Go Home
        </Link>
      </div>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer style={styles.footer}>
          <div style={styles.container}>
            <p>&copy; 2025 HelpUs Pro. All rights reserved.</p>
            <p>Build Version: 1.0.0 | React {React.version}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Styles
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  title: {
    fontSize: '3rem',
    color: 'white',
    textAlign: 'center',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'white',
    textAlign: 'center',
    marginBottom: '40px',
    opacity: 0.9
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    marginBottom: '30px'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    margin: '30px 0'
  },
  feature: {
    textAlign: 'center',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef'
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '30px'
  },
  primaryButton: {
    background: '#007bff',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  secondaryButton: {
    background: '#28a745',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  outlineButton: {
    background: 'transparent',
    color: '#007bff',
    padding: '12px 30px',
    border: '2px solid #007bff',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  smallButton: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    padding: '10px 20px',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  status: {
    background: 'rgba(255,255,255,0.1)',
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    marginBottom: '20px'
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '10px 0',
    padding: '10px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '5px'
  },
  statusSuccess: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  statusWarning: {
    color: '#ffc107',
    fontWeight: 'bold'
  },
  statusError: {
    color: '#dc3545',
    fontWeight: 'bold'
  },
  serverInfo: {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '14px'
  },
  apiTestResults: {
    background: 'rgba(255,255,255,0.1)',
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    marginBottom: '20px'
  },
  testResult: {
    padding: '15px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  testHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  testName: {
    fontWeight: 'bold',
    fontSize: '14px'
  },
  testDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    opacity: 0.8
  },
  errorDetails: {
    marginTop: '8px',
    padding: '8px',
    background: 'rgba(220, 53, 69, 0.2)',
    borderRadius: '4px',
    fontSize: '12px'
  },
  debugInfo: {
    background: 'rgba(255,255,255,0.05)',
    padding: '20px',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    marginBottom: '20px'
  },
  helpLinks: {
    marginTop: '15px',
    padding: '15px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px'
  },
  // Auth Styles
  authContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh'
  },
  authCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '40px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  authTitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px'
  },
  authLink: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666'
  },
  // Dashboard Styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  nav: {
    display: 'flex',
    gap: '15px'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '10px 0 0 0'
  },
  // Error Page
  errorContainer: {
    textAlign: 'center',
    color: 'white',
    padding: '60px 20px'
  },
  errorTitle: {
    fontSize: '6rem',
    margin: '0',
    fontWeight: 'bold',
    textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
  },
  // Footer
  footer: {
    background: 'rgba(0,0,0,0.1)',
    color: 'white',
    padding: '20px 0',
    marginTop: '50px',
    textAlign: 'center'
  }
};

// Add hover effects
Object.assign(styles.primaryButton, {
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0,123,255,0.4)'
  }
});

Object.assign(styles.secondaryButton, {
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(40,167,69,0.4)'
  }
});

Object.assign(styles.navLink, {
  ':hover': {
    background: 'rgba(255,255,255,0.3)',
    transform: 'translateY(-2px)'
  }
});

Object.assign(styles.smallButton, {
  ':hover': {
    background: 'rgba(255,255,255,0.3)',
    transform: 'translateY(-1px)'
  }
});

export default App;