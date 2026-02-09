const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/accounts', require('./accounts'));
router.use('/trades', require('./trades'));
router.use('/withdrawals', require('./withdrawals'));
router.use('/deposits', require('./deposits'));
router.use('/auth', require('./auth'));
router.use('/reports', require('./reports'));

module.exports = router;
