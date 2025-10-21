import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

/**
 * User Model for HelpUs Pro Application
 * Handles user authentication, profiles, and investment data
 */

const userSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
  },
  
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    index: true
  },
  
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || validator.isMobilePhone(v, 'any');
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries
  },
  
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Role & Status
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'pending'],
    default: 'active'
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  verificationToken: String,
  verificationExpires: Date,
  
  // Financial Information
  balance: {
    type: Number,
    default: 0.00,
    min: [0, 'Balance cannot be negative']
  },
  
  totalDeposited: {
    type: Number,
    default: 0.00
  },
  
  totalWithdrawn: {
    type: Number,
    default: 0.00
  },
  
  totalEarnings: {
    type: Number,
    default: 0.00
  },
  
  // Profile
  avatar: String,
  country: String,
  city: String,
  address: String,
  dateOfBirth: Date,
  
  // Security & Activity
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: Date,
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'bn', 'es', 'fr']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'BDT', 'INR']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    }
  },
  
  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  referralCount: {
    type: Number,
    default: 0
  },
  
  referralEarnings: {
    type: Number,
    default: 0.00
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/api/users/${this._id}/profile`;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ balance: -1 });

/**
 * Password Hashing Middleware
 */
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set passwordChangedAt
    this.passwordChangedAt = Date.now() - 1000; // 1 second in past for token timing
    
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function(next) {
  // Update timestamps
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  
  // Generate referral code if not exists
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  
  next();
});

/**
 * Instance Methods
 */
userSchema.methods = {
  // Compare password for login
  comparePassword: async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },
  
  // Check if password changed after JWT was issued
  changedPasswordAfter: function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  },
  
  // Generate password reset token
  createPasswordResetToken: function() {
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    
    this.passwordResetToken = require('crypto')
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
  },
  
  // Generate email verification token
  createVerificationToken: function() {
    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    
    this.verificationToken = require('crypto')
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
  },
  
  // Generate referral code
  generateReferralCode: function() {
    return require('crypto').randomBytes(4).toString('hex').toUpperCase();
  },
  
  // Update last login
  updateLastLogin: function() {
    this.lastLogin = new Date();
    return this.save();
  },
  
  // Check if account is locked
  isLocked: function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  },
  
  // Increment login attempts
  incrementLoginAttempts: async function() {
    // If previous lock has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.updateOne({
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 }
      });
    }
    
    // Otherwise increment
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock the account if too many attempts
    if (this.loginAttempts + 1 >= 5) {
      updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
  },
  
  // Reset login attempts after successful login
  resetLoginAttempts: function() {
    return this.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 }
    });
  },
  
  // Add balance (for deposits, earnings, etc.)
  addBalance: async function(amount, type = 'deposit') {
    this.balance += amount;
    
    if (type === 'deposit') {
      this.totalDeposited += amount;
    } else if (type === 'earning') {
      this.totalEarnings += amount;
    } else if (type === 'referral') {
      this.referralEarnings += amount;
    }
    
    return this.save();
  },
  
  // Deduct balance (for withdrawals, investments, etc.)
  deductBalance: async function(amount, type = 'withdrawal') {
    if (this.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    this.balance -= amount;
    
    if (type === 'withdrawal') {
      this.totalWithdrawn += amount;
    }
    
    return this.save();
  }
};

/**
 * Static Methods
 */
userSchema.statics = {
  // Find user by email (including password for auth)
  findByEmail: function(email) {
    return this.findOne({ email }).select('+password');
  },
  
  // Find active users
  findActive: function() {
    return this.find({ status: 'active' });
  },
  
  // Get users with minimum balance
  withMinBalance: function(minBalance) {
    return this.find({ balance: { $gte: minBalance } });
  },
  
  // Get top investors
  getTopInvestors: function(limit = 10) {
    return this.find({ status: 'active' })
      .sort({ totalDeposited: -1 })
      .limit(limit);
  },
  
  // Get users registered in date range
  registeredBetween: function(startDate, endDate) {
    return this.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
  }
};

/**
 * Query Helpers
 */
userSchema.query = {
  byStatus: function(status) {
    return this.find({ status });
  },
  
  byRole: function(role) {
    return this.find({ role });
  },
  
  withBalance: function(min = 0, max = Infinity) {
    return this.find({
      balance: {
        $gte: min,
        $lte: max
      }
    });
  }
};

// Create and export model
const User = mongoose.model('User', userSchema);

export default User;