const express = require('express');
const { handle } = require('../webhooks/brokerWebhook');

const router = express.Router();

router.post('/broker', express.raw({ type: '*/*' }), handle);

module.exports = router;
