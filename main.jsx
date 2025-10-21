/**
 * Main Entry Point - HelpUs Pro React Application
 * This file bootstraps the React application and renders it to the DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import global styles
import './styles/globals.css';

/**
 * Performance monitoring and error boundary setup
 */

// Performance monitoring (optional)
const reportWebVitals = (metric) => {
  // You can send these metrics to your analytics service
  console.log('Web Vitals:', metric);
  
  // Example: Send to Google Analytics
  if (window.gtag && metric.name === 'CLS') {
    window.gtag('event', 'cls', {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value * 1000), // Convert to millis
      non_interaction: true,
    });
  }
};

/**
 * Error Boundary for catching rendering errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console
    console.error('React Error Boundary Caught an Error:', error, errorInfo);
    
    // You can also log errors to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</h1>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Something went wrong</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '30px', maxWidth: '500px' }}>
            We're sorry, but something went wrong. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: 'white',
              color: '#ee5a24',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Refresh Page
          </button>
          
          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details style={{ 
              marginTop: '30px', 
              textAlign: 'left', 
              maxWidth: '600px',
              background: 'rgba(255,255,255,0.1)',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Error Details (Development)
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                fontSize: '12px',
                overflow: 'auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '10px',
                borderRadius: '4px'
              }}>
                {this.state.error && this.state.error.toString()}
                {'\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

/**
 * Application Root Component with Providers
 */
const Root = () => {
  return (
    <ErrorBoundary>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ErrorBoundary>
  );
};

/**
 * DOM Rendering and Initialization
 */

// Get the root DOM element
const container = document.getElementById('root');

if (!container) {
  throw new Error(
    "Root element with ID 'root' not found. " +
    "Please make sure your index.html file contains a div with id='root'"
  );
}

// Create React root
const root = ReactDOM.createRoot(container);

// Render the application
root.render(<Root />);

/**
 * Performance Monitoring (Optional)
 * Uncomment if you want to measure performance
 */

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
// 
// getCLS(reportWebVitals);
// getFID(reportWebVitals);
// getFCP(reportWebVitals);
// getLCP(reportWebVitals);
// getTTFB(reportWebVitals);

/**
 * Service Worker Registration (PWA - Optional)
 */
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

/**
 * Development-only features
 */
if (process.env.NODE_ENV === 'development') {
  // Log environment info
  console.log('🚀 HelpUs Pro - Development Mode');
  console.log('📍 Environment:', process.env.NODE_ENV);
  console.log('⚡ React Version:', React.version);
  
  // Hot Module Replacement (HMR) for development
  if (import.meta.hot) {
    import.meta.hot.accept();
  }
}

// Export for testing purposes
export { Root };