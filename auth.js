import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createOperationalError } from './errorHandler.js';

/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

/**
 * @desc    Verify JWT token and protect routes
 * @access  Private
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return next(createOperationalError(
        'Not authorized to access this route. No token provided.',
        401
      ));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(createOperationalError(
          'User belonging to this token no longer exists.',
          401
        ));
      }

      // Check if user changed password after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return next(createOperationalError(
          'User recently changed password. Please log in again.',
          401
        ));
      }

      // Check if user is active
      if (user.status !== 'active') {
        return next(createOperationalError(
          'Your account has been suspended. Please contact support.',
          403
        ));
      }

      // Grant access to protected route
      req.user = user;
      next();

    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return next(createOperationalError('Invalid token. Please log in again.', 401));
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        return next(createOperationalError('Token expired. Please log in again.', 401));
      }
      
      return next(createOperationalError('Authentication failed.', 401));
    }

  } catch (error) {
    console.error('🔐 Authentication error:', error);
    next(error);
  }
};

/**
 * @desc    Authorize roles (must be used after authenticate)
 * @access  Private
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createOperationalError('Not authorized to access this route.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createOperationalError(
        `User role '${req.user.role}' is not authorized to access this route.`,
        403
      ));
    }

    next();
  };
};

/**
 * @desc    Optional authentication (doesn't throw error if no token)
 * @access  Public/Private
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(); // Continue without user
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.status === 'active' && !user.changedPasswordAfter(decoded.iat)) {
        req.user = user;
      }
      
      next();
    } catch (jwtError) {
      // Continue without user if token is invalid
      next();
    }

  } catch (error) {
    // Continue without user on error
    next();
  }
};

/**
 * @desc    Check if user is the owner of the resource
 * @access  Private
 */
export const isOwner = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createOperationalError('Not authorized to access this route.', 401));
    }

    // Allow admins to access any resource
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }

    // Check if user owns the resource
    if (req.user.id !== resourceUserId.toString()) {
      return next(createOperationalError(
        'Not authorized to access this resource.',
        403
      ));
    }

    next();
  };
};

/**
 * @desc    Refresh token verification
 * @access  Public
 */
export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createOperationalError('Refresh token is required.', 400));
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(createOperationalError('User not found.', 404));
      }

      if (user.status !== 'active') {
        return next(createOperationalError('Account is not active.', 403));
      }

      req.user = user;
      next();

    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return next(createOperationalError('Invalid refresh token.', 401));
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        return next(createOperationalError('Refresh token expired.', 401));
      }
      
      return next(createOperationalError('Refresh token verification failed.', 401));
    }

  } catch (error) {
    console.error('🔄 Refresh token error:', error);
    next(error);
  }
};

/**
 * @desc    Check if user can perform action (composite middleware)
 * @access  Private
 */
export const can = (action, resource) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(createOperationalError('Not authorized.', 401));
      }

      // Admin and superadmin can do anything
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        return next();
      }

      // Define permissions based on role and action
      const permissions = {
        user: {
          profile: ['read', 'update'],
          investments: ['create', 'read', 'update'],
          withdrawals: ['create', 'read'],
          transactions: ['read']
        },
        // Add more roles as needed
      };

      const rolePermissions = permissions[req.user.role] || {};
      
      if (!rolePermissions[resource] || !rolePermissions[resource].includes(action)) {
        return next(createOperationalError(
          `Not authorized to ${action} ${resource}.`,
          403
        ));
      }

      next();
    } catch (error) {
      console.error('🔒 Permission check error:', error);
      next(error);
    }
  };
};

/**
 * @desc    Rate limiting by user (to be used with express-rate-limit)
 * @access  Public
 */
export const userRateLimitKeyGenerator = (req) => {
  return req.user ? req.user.id : req.ip;
};

/**
 * @desc    Check if user has sufficient balance
 * @access  Private
 */
export const hasSufficientBalance = (amount) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createOperationalError('Not authorized.', 401));
    }

    if (req.user.balance < amount) {
      return next(createOperationalError(
        `Insufficient balance. Required: ${amount}, Available: ${req.user.balance}`,
        400
      ));
    }

    next();
  };
};

// Export all middleware functions
export default {
  authenticate,
  authorize,
  optionalAuth,
  isOwner,
  verifyRefreshToken,
  can,
  userRateLimitKeyGenerator,
  hasSufficientBalance
};