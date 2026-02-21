import express from 'express';
import authShorthand from '../middleware/auth.js';
import { weekly } from '../controllers/performanceController.mjs';

const { requireAuth } = authShorthand;
const router = express.Router();

router.get('/weekly', requireAuth, weekly);

export default router;
