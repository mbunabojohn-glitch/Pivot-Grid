const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { listAuditLogs } = require('../controllers/auditLogsController');

const router = express.Router();

router.get('/', requireAuth, listAuditLogs);

module.exports = router;

