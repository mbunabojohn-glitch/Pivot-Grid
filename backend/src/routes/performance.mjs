import express from 'express';
import authShorthand from '../middleware/auth.js';
import perfCtrl from '../controllers/performanceController.js';

const { requireAuth } = authShorthand;
const router = express.Router();

router.get('/weekly', requireAuth, perfCtrl.weekly);

export default router;
