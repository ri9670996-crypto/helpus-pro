import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    withdrawals: [] 
  });
});

router.post('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Withdrawal request submitted' 
  });
});

router.get('/methods', (req, res) => {
  res.json({ 
    success: true, 
    methods: ['bank', 'crypto', 'paypal'] 
  });
});

export default router;