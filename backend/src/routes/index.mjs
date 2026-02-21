import express from 'express';

import users from './users.js';
import accounts from './accounts.js';
import trades from './trades.js';
import withdrawals from './withdrawals.js';
import deposits from './deposits.js';
import auth from './auth.routes.js';
import reports from './reports.js';
import performance from './performance.js';
import auditLogs from './audit-logs.js';
import webhooks from './webhooks.js';
import admin from './admin.js';
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
