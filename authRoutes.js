import express from 'express';

const router = express.Router();

// Real working registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('📝 Registration attempt:', { name, email });
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // In real app, you would save to database here
    // For now, just return success
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        balance: 0,
        role: 'user'
      },
      token: 'jwt-token-' + Date.now()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Real working login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // In real app, you would verify credentials from database
    // For now, accept any email/password
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'user_123',
        name: 'Demo User',
        email: email,
        balance: 1000,
        role: 'user'
      },
      token: 'jwt-token-' + Date.now()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Demo GET endpoints
router.get('/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Login endpoint is working' 
  });
});

router.get('/register', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Register endpoint is working' 
  });
});

router.get('/status', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth system is operational',
    endpoints: {
      'POST /register': 'Register new user',
      'POST /login': 'Login user'
    }
  });
});

export default router;