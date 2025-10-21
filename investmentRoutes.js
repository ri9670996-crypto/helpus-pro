import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    investments: [
      { id: 1, amount: 500, plan: 'Basic', status: 'active' }
    ]
  });
});

router.post('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Investment created successfully' 
  });
});

router.get('/stats', (req, res) => {
  res.json({ 
    success: true, 
    stats: {
      totalInvested: 500,
      totalReturns: 50,
      activePlans: 1
    }
  });
});

export default router;