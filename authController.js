import User from '../models/User.js';
import { createOperationalError } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';

/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
};

// Send Token Response
const sendTokenResponse = (user, statusCode, res) => {
  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    console.log('📝 Registration attempt:', { name, email, phone });

    // Validation
    if (!name || !email || !password) {
      return next(createOperationalError('Please provide name, email and password', 400));
    }

    if (password.length < 6) {
      return next(createOperationalError('Password must be at least 6 characters', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createOperationalError('User already exists with this email', 400));
    }

    // Handle referral if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
        console.log('👥 Referral found:', referrer.email);
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      referredBy
    });

    console.log('✅ User registered successfully:', user.email);

    // Update referrer's count if applicable
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, {
        $inc: { referralCount: 1 }
      });
      console.log('🎯 Referral count updated for:', referredBy);
    }

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(createOperationalError(
        `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, 
        400
      ));
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(createOperationalError(messages.join(', '), 400));
    }
    
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    // Validate email and password
    if (!email || !password) {
      return next(createOperationalError('Please provide email and password', 400));
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      console.log('❌ User not found:', email);
      return next(createOperationalError('Invalid email or password', 401));
    }

    // Check if account is locked
    if (user.isLocked()) {
      console.log('🔒 Account locked:', email);
      return next(createOperationalError('Account is temporarily locked. Try again later.', 423));
    }

    // Check if password is correct
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      console.log('❌ Invalid password for:', email);
      
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      const attemptsLeft = 5 - (user.loginAttempts + 1);
      if (attemptsLeft > 0) {
        return next(createOperationalError(
          `Invalid email or password. ${attemptsLeft} attempts left.`, 
          401
        ));
      } else {
        return next(createOperationalError(
          'Account locked due to too many failed attempts. Try again in 2 hours.', 
          423
        ));
      }
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    await user.updateLastLogin();

    console.log('✅ Login successful:', user.email);

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(createOperationalError('User not found', 404));
    }

    console.log('👤 Profile accessed:', user.email);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        balance: user.balance,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        referralEarnings: user.referralEarnings,
        totalDeposited: user.totalDeposited,
        totalWithdrawn: user.totalWithdrawn,
        totalEarnings: user.totalEarnings,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      country: req.body.country,
      city: req.body.city,
      address: req.body.address,
      dateOfBirth: req.body.dateOfBirth,
      'preferences.language': req.body.language,
      'preferences.currency': req.body.currency,
      'preferences.theme': req.body.theme
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    console.log('📝 Profile updated:', user.email);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        city: user.city,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createOperationalError('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
      return next(createOperationalError('New password must be at least 6 characters', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(createOperationalError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('🔑 Password changed:', user.email);

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('❌ Change password error:', error);
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  console.log('🚪 User logged out:', req.user.email);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createOperationalError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(createOperationalError('User not found', 404));
    }

    console.log('🔄 Token refreshed:', user.email);

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return next(createOperationalError('Invalid refresh token', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(createOperationalError('Refresh token expired', 401));
    }
    
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createOperationalError('Please provide email', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link will be sent'
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a real app, you would send an email here
    console.log('📧 Password reset token:', resetToken);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link will be sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    
    // Reset token and expiry if error
    if (req.user) {
      req.user.passwordResetToken = undefined;
      req.user.passwordResetExpires = undefined;
      await req.user.save({ validateBeforeSave: false });
    }
    
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return next(createOperationalError('Password must be at least 6 characters', 400));
    }

    // Hash the token to compare with stored hash
    const hashedToken = require('crypto')
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(createOperationalError('Invalid or expired reset token', 400));
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log('🔑 Password reset:', user.email);

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('❌ Reset password error:', error);
    next(error);
  }
};

/**
 * @desc    Get auth status
 * @route   GET /api/auth/status
 * @access  Public
 */
export const getAuthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication system is operational',
    endpoints: {
      'POST /register': 'Register new user',
      'POST /login': 'Login user',
      'GET /me': 'Get current user (protected)',
      'PUT /profile': 'Update profile (protected)',
      'PUT /change-password': 'Change password (protected)',
      'POST /logout': 'Logout user (protected)',
      'POST /refresh-token': 'Refresh access token',
      'POST /forgot-password': 'Request password reset',
      'PUT /reset-password/:token': 'Reset password with token'
    },
    timestamp: new Date().toISOString()
  });
};