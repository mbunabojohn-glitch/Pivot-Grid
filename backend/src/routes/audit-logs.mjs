import express from 'express';
import authShorthand from '../middleware/auth.js';
import { listAuditLogs } from '../controllers/auditLogsController.mjs';

const { requireAuth } = authShorthand;

const router = express.Router();

router.get('/', requireAuth, listAuditLogs);

export default router;
