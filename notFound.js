import { createOperationalError } from './errorHandler.js';

/**
 * 404 Not Found Middleware
 * Handles requests to non-existent routes with detailed information
 */

const notFound = (req, res, next) => {
  const errorDetails = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    timestamp: new Date().toISOString(),
    queryParams: Object.keys(req.query).length > 0 ? req.query : undefined,
    bodyParams: Object.keys(req.body).length > 0 ? Object.keys(req.body) : undefined,
    acceptedContentTypes: req.get('Accept') || 'Not specified',
    requestedContentType: req.get('Content-Type') || 'Not specified'
  };

  // Log the 404 request for monitoring
  if (process.env.NODE_ENV !== 'test') {
    console.warn('🔍 404 Not Found:', {
      timestamp: errorDetails.timestamp,
      method: errorDetails.method,
      url: errorDetails.url,
      ip: errorDetails.ip,
      userAgent: errorDetails.userAgent?.substring(0, 100) // Limit length
    });
  }

  // Check if it's an API route
  const isApiRoute = req.originalUrl.startsWith('/api/');

  // Create operational error
  const error = createOperationalError(
    isApiRoute 
      ? `API endpoint not found: ${req.method} ${req.originalUrl}`
      : `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    {
      type: 'route_not_found',
      resource: req.originalUrl,
      suggestedActions: getSuggestedActions(req),
      documentation: process.env.API_DOCS_URL || 'https://docs.helpuspro.com/api',
      ...errorDetails
    }
  );

  next(error);
};

/**
 * Provide helpful suggestions based on the request
 */
const getSuggestedActions = (req) => {
  const actions = [];
  const url = req.originalUrl.toLowerCase();

  // Check for common typos or similar routes
  if (url.includes('user')) {
    actions.push('Check if you meant /api/users instead');
  }
  if (url.includes('invest')) {
    actions.push('Check if you meant /api/investments instead');
  }
  if (url.includes('withdraw')) {
    actions.push('Check if you meant /api/withdrawals instead');
  }
  if (url.includes('auth')) {
    actions.push('Check if you meant /api/auth instead');
  }
  if (url.includes('admin')) {
    actions.push('Check if you meant /api/admin instead');
  }

  // General suggestions
  actions.push('Verify the HTTP method (GET, POST, PUT, DELETE)');
  actions.push('Check the API documentation for available endpoints');
  actions.push('Ensure you have proper authentication headers');

  return actions;
};

/**
 * Alternative notFound handler for specific use cases
 */
const notFoundWithCustomMessage = (customMessage, additionalDetails = {}) => {
  return (req, res, next) => {
    const errorDetails = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      ...additionalDetails
    };

    const error = createOperationalError(
      customMessage,
      404,
      errorDetails
    );

    next(error);
  };
};

/**
 * Resource-specific not found handler
 */
const resourceNotFound = (resourceName, identifier) => {
  return (req, res, next) => {
    const error = createOperationalError(
      `${resourceName} not found`,
      404,
      {
        type: 'resource_not_found',
        resource: resourceName,
        identifier: identifier || req.params.id,
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString()
      }
    );

    next(error);
  };
};

// Export all notFound handlers
export {
  notFound,
  notFoundWithCustomMessage,
  resourceNotFound
};

export default notFound;