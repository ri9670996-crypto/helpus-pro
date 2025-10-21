import express from 'express';

const router = express.Router();

// Temporary user routes without validation
router.get('/profile', (req, res) => {
  res.json({ 
    success: true, 
    user: { 
      id: 1, 
      name: 'Demo User', 
      email: 'demo@helpuspro.com',
      balance: 1000.00
    }
  });
});

router.get('/dashboard', (req, res) => {
  res.json({ 
    success: true, 
    dashboard: {
      totalBalance: 1000.00,
      activeInvestments: 500.00,
      totalEarnings: 150.00
    }
  });
});

router.put('/profile', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Profile updated successfully' 
  });
});

router.put('/change-password', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Password changed successfully' 
  });
});

router.get('/transactions', (req, res) => {
  res.json({ 
    success: true, 
    transactions: [] 
  });
});

export default router;