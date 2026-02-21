import express from 'express';
import authShorthand from '../middleware/auth.js';
import Deposit from '../models/Deposit.js';

const { requireAuth } = authShorthand;
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  res.json({ data: [], message: 'Deposits listing stub' });
});

export default router;
