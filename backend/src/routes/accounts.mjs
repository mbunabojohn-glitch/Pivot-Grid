import express from 'express';
import authMw from '../middleware/auth.middleware.js';
import Account from '../models/Account.js';
import { getSummary } from '../controllers/accountsController.mjs';

const { requireAuth } = authMw;

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  res.json({ data: [], message: 'Accounts listing stub' });
});

router.post('/', requireAuth, async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/:id/summary', requireAuth, async (req, res) => {
  return getSummary(req, res);
});

export default router;
