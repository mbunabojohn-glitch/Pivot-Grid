import express from 'express';
import authMw from '../middleware/auth.middleware.js';
import * as Reports from '../controllers/reportsController.mjs';

const { optionalAuth } = authMw;
const router = express.Router();

router.get('/weekly', optionalAuth, Reports.weeklySummary);
router.get('/growth', optionalAuth, Reports.growthCurve);

export default router;
