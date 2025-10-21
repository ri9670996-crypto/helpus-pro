import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Import database connection
import { connectDB } from './utils/database.js';

// Load environment variables
dotenv.config();

// ES module fix for __dirname
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.env = process.env.NODE_ENV || 'development';

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  async initializeDatabase() {
    try {
      await connectDB();
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      // Don't exit in development
      if (this.env === 'production') {
        process.exit(1);
      }
    }
  }

  initializeMiddlewares() {
    // Security middleware with CSP
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: [
            "'self'", 
            "https:", 
            "ws:", 
            "wss:",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            process.env.CLIENT_URL
          ].filter(Boolean),
          frameSrc: ["'self'"],
          objectSrc: ["'none'"]
        }
      }
    }));

    // Enhanced CORS configuration
    const corsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000',
          'https://helpus-pro.vercel.app',
          'https://helpus-pro.netlify.app',
          process.env.CLIENT_URL
        ].filter(Boolean);

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1 || this.env === 'development') {
          callback(null, true);
        } else {
          console.warn('🚫 CORS Blocked Origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-Key',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'Cache-Control',
        'X-Refresh-Token'
      ],
      exposedHeaders: [
        'X-Total-Count',
        'X-Total-Pages',
        'X-Current-Page',
        'X-API-Version'
      ],
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    this.app.use(cors(corsOptions));

    // Handle preflight requests
    this.app.options('*', cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: this.env === 'production' ? 100 : 1000, // different limits
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.ip; // Use IP address for rate limiting
      },
      skip: (req) => {
        // Skip rate limiting for health checks in development
        if (this.env === 'development' && req.path === '/api/health') {
          return true;
        }
        return false;
      }
    });
    this.app.use(limiter);

    // Body parsing middleware with increased limits
    this.app.use(express.json({
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    
    this.app.use(express.urlencoded({
      extended: true,
      limit: '10mb',
      parameterLimit: 1000
    }));
    
    this.app.use(cookieParser());

    // Compression
    this.app.use(compression({
      level: 6,
      threshold: 100 * 1024, // compress responses larger than 100KB
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    }));

    // Logging
    if (this.env !== 'test') {
      if (this.env === 'development') {
        this.app.use(morgan('dev'));
      } else {
        this.app.use(morgan('combined', {
          skip: (req, res) => res.statusCode < 400 // log only errors in production
        }));
      }
    }

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    this.app.use('/docs', express.static(path.join(__dirname, 'docs')));

    // Trust proxy
    if (this.env === 'production') {
      this.app.set('trust proxy', 1);
    }

    // Request logging middleware
    this.app.use((req, res, next) => {
      if (this.env === 'development') {
        console.log(`${req.method} ${req.path} - ${new Date().toISOString()} - Origin: ${req.headers.origin}`);
      }
      next();
    });

    // Add security headers
    this.app.use((req, res, next) => {
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('X-Frame-Options', 'DENY');
      res.header('X-XSS-Protection', '1; mode=block');
      res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      next();
    });
  }

  initializeRoutes() {
    // Health check route with detailed info
    this.app.get('/api/health', (req, res) => {
      const healthCheck = {
        success: true,
        message: '🚀 HelpUs Pro Server is running',
        timestamp: new Date().toISOString(),
        environment: this.env,
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected',
        nodeVersion: process.version,
        platform: process.platform
      };

      res.status(200).json(healthCheck);
    });

    // API information route
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'HelpUs Pro API',
        version: '1.0.0',
        documentation: process.env.DOCS_URL || '/docs',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          investments: '/api/investments',
          withdrawals: '/api/withdrawals',
          admin: '/api/admin'
        },
        status: 'operational'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/investments', investmentRoutes);
    this.app.use('/api/withdrawals', withdrawalRoutes);
    this.app.use('/api/admin', adminRoutes);

    // Serve client build in production
    if (this.env === 'production') {
      this.app.use(express.static(path.join(__dirname, '../../client/dist')));

      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
      });
    }
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(errorHandler);

    // Process handlers
    this.handleProcessEvents();
  }

  handleProcessEvents() {
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Starting graceful shutdown...');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Starting graceful shutdown...');
      this.shutdown();
    });

    // Unhandled promise rejection
    process.on('unhandledRejection', (err, promise) => {
      console.error('Unhandled Promise Rejection:', err);
      console.error('At promise:', promise);
      this.shutdown();
    });

    // Uncaught exception
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      this.shutdown();
    });
  }

  shutdown() {
    console.log('Shutting down server gracefully...');
    // Add any cleanup tasks here
    process.exit(0);
  }

  start() {
    const server = this.app.listen(this.port, () => {
      console.log(`
✨ HelpUs Pro Server Started Successfully!

📍 Environment: ${this.env}
🚀 Server running on: http://localhost:${this.port}
📚 API Documentation: http://localhost:${this.port}/api
❤️  Health Check: http://localhost:${this.port}/api/health
🔒 CORS Enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}
⏰ Started at: ${new Date().toISOString()}
      `);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${this.port} is already in use`);
        console.log('💡 Try using a different port:');
        console.log('   - Change PORT in .env file');
        console.log('   - Or run: PORT=5001 npm run dev');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    return server;
  }
}

// Create and start server instance
const server = new Server();

// Start the server
server.start();

export default server;