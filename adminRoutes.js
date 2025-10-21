import express from 'express';

const router = express.Router();

router.get('/dashboard/stats', (req, res) => {
  res.json({ 
    success: true, 
    stats: {
      totalUsers: 100,
      totalInvestments: 50000,
      totalWithdrawals: 20000
    }
  });
});

router.get('/users', (req, res) => {
  res.json({ 
    success: true, 
    users: [
      { id: 1, name: 'User 1', email: 'user1@test.com', status: 'active' }
    ]
  });
});

router.get('/withdrawals', (req, res) => {
  res.json({ 
    success: true, 
    withdrawals: [] 
  });
});

export default router;