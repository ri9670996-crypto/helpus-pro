import mongoose from 'mongoose';
import pkg from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = pkg;

/**
 * Global error handling middleware
 * Handles all errors in a consistent and professional manner
 */

class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

// Create operational errors
const createOperationalError = (message, statusCode, details = null) => {
  return new AppError(message, statusCode, details);
};

// Error response formatter
const sendError = (err, req, res) => {
  // Log error for monitoring
  logError(err, req);

  // Development vs Production error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

// Development error response with full details
const sendErrorDev = (err, res) => {
  const errorResponse = {
    success: false,
    error: {
      message: err.message,
      status: err.status,
      statusCode: err.statusCode,
      stack: err.stack,
      details: err.details,
      timestamp: err.timestamp
    }
  };

  res.status(err.statusCode || 500).json(errorResponse);
};

// Production error response (limited details)
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const errorResponse = {
      success: false,
      error: {
        message: err.message,
        status: err.status,
        statusCode: err.statusCode,
        ...(err.details && { details: err.details }),
        timestamp: err.timestamp
      }
    };

    res.status(err.statusCode).json(errorResponse);
  } 
  // Programming or unknown error: don't leak error details
  else {
    console.error('💥 UNEXPECTED ERROR:', err);

    const errorResponse = {
      success: false,
      error: {
        message: 'Something went wrong!',
        status: 'error',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    };

    res.status(500).json(errorResponse);
  }
};

// Comprehensive error logging
const logError = (err, req) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      ...(err.details && { details: err.details })
    }
  };

  console.error('🔴 ERROR:', logEntry);
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types

  // MongoDB CastError (Invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    const message = `Invalid ${err.path}: ${err.value}. Resource not found.`;
    error = createOperationalError(message, 400, {
      path: err.path,
      value: err.value,
      kind: err.kind
    });
  }

  // MongoDB Duplicate Key Error
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${value}. Please use another ${field}.`;
    error = createOperationalError(message, 409, {
      field,
      value,
      duplicate: true
    });
  }

  // MongoDB Validation Error
  else if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map(el => ({
      field: el.path,
      message: el.message
    }));
    
    const message = 'Invalid input data. Please check the provided information.';
    error = createOperationalError(message, 422, { validationErrors: errors });
  }

  // JWT Errors
  else if (err instanceof JsonWebTokenError) {
    const message = 'Invalid authentication token. Please log in again.';
    error = createOperationalError(message, 401, { tokenError: true });
  }

  else if (err instanceof TokenExpiredError) {
    const message = 'Authentication token has expired. Please log in again.';
    error = createOperationalError(message, 401, { tokenExpired: true });
  }

  // Handle unhandled errors
  if (!error.isOperational) {
    error = createOperationalError(
      error.message || 'Internal server error',
      error.statusCode || 500
    );
  }

  // Send error response
  sendError(error, req, res);
};

// Async error handler wrapper (for async functions)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export everything
export {
  errorHandler,
  AppError,
  createOperationalError,
  asyncHandler
};

export default errorHandler;