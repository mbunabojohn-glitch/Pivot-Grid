import express from 'express';

import users from './users.mjs';
import accounts from './accounts.mjs';
import trades from './trades.mjs';
import withdrawals from './withdrawals.mjs';
import deposits from './deposits.mjs';
import auth from './auth.routes.js';
import reports from './reports.mjs';
import performance from './performance.mjs';
import auditLogs from './audit-logs.mjs';
import webhooks from './webhooks.mjs';
import admin from './admin.mjs';
import ai from './ai.js';

const router = express.Router();

router.use('/users', users);
router.use('/accounts', accounts);
router.use('/trades', trades);
router.use('/withdrawals', withdrawals);
router.use('/deposits', deposits);
router.use('/auth', auth);
router.use('/reports', reports);
router.use('/performance', performance);
router.use('/audit-logs', auditLogs);
router.use('/webhooks', webhooks);
router.use('/admin', admin);
router.use('/ai', ai);

export default router;
