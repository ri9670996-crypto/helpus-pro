import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

/**
 * 404 Not Found Page Component
 * Handles client-side routing errors with user-friendly interface
 */

const NotFound = () => {
  const navigate = useNavigate();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Handle go back
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  // Common issues and solutions
  const commonSolutions = [
    {
      icon: <Search size={18} />,
      text: "Check the URL for typos",
      action: () => {
        const currentUrl = window.location.href;
        // You could implement URL validation/suggestion here
        console.log('Current URL:', currentUrl);
      }
    },
    {
      icon: <Home size={18} />,
      text: "Go to homepage",
      action: () => navigate('/')
    },
    {
      icon: <RefreshCw size={18} />,
      text: "Refresh the page",
      action: handleRefresh
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Error Illustration/Icon */}
        <motion.div variants={itemVariants}>
          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              404
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Oops! The page you're looking for seems to have wandered off.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Don't worry, even the best explorers get lost sometimes.
          </p>
        </motion.div>

        {/* Current Path Display */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Current path:</p>
            <p className="text-sm font-mono text-gray-800 bg-gray-50 p-2 rounded break-all">
              {window.location.pathname}
            </p>
          </div>
        </motion.div>

        {/* Quick Solutions */}
        <motion.div variants={itemVariants}>
          <div className="space-y-3 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Quick Solutions
            </h3>
            {commonSolutions.map((solution, index) => (
              <motion.button
                key={index}
                onClick={solution.action}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {solution.icon}
                <span className="text-sm font-medium">{solution.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleGoBack}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </motion.button>

          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={18} />
            <span>Homepage</span>
          </motion.button>
        </motion.div>

        {/* Additional Help */}
        <motion.div variants={itemVariants}>
          <p className="text-xs text-gray-500 mt-8">
            Still lost?{' '}
            <Link 
              to="/contact" 
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Contact support
            </Link>{' '}
            or{' '}
            <Link 
              to="/help" 
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              visit our help center
            </Link>
          </p>
        </motion.div>

        {/* Debug Information (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div variants={itemVariants}>
            <details className="mt-6 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Debug Information
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                <div><strong>Path:</strong> {window.location.pathname}</div>
                <div><strong>Full URL:</strong> {window.location.href}</div>
                <div><strong>History Length:</strong> {window.history.length}</div>
                <div><strong>User Agent:</strong> {navigator.userAgent}</div>
              </div>
            </details>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// Higher Order Component for error boundary (optional)
export const withNotFoundBoundary = (Component) => {
  return (props) => (
    <ErrorBoundary FallbackComponent={NotFound}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Custom hook for 404 handling
export const useNotFound = () => {
  const navigate = useNavigate();

  const redirectToNotFound = (message = 'Page not found') => {
    // You can pass additional state to the not found page
    navigate('/not-found', { 
      state: { 
        errorMessage: message,
        previousPath: window.location.pathname,
        timestamp: new Date().toISOString()
      }
    });
  };

  return { redirectToNotFound };
};

export default NotFound;