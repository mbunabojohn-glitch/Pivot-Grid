const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/accounts', require('./accounts'));
router.use('/trades', require('./trades'));
router.use('/withdrawals', require('./withdrawals'));
router.use('/deposits', require('./deposits'));
router.use('/auth', require('./auth.routes'));
router.use('/reports', require('./reports'));
router.use('/performance', require('./performance'));
router.use('/audit-logs', require('./audit-logs'));
router.use('/webhooks', require('./webhooks'));
router.use('/admin', require('./admin'));
router.use('/ai', require('./ai'));

module.exports = router;
