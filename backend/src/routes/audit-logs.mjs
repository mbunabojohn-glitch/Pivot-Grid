import express from 'express';
import authShorthand from '../middleware/auth.js';
import ctrl from '../controllers/auditLogsController.js';

const { requireAuth } = authShorthand;
const { listAuditLogs } = ctrl;

const router = express.Router();

router.get('/', requireAuth, listAuditLogs);

export default router;
