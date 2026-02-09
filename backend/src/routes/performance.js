const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Performance = require('../controllers/performanceController');

const router = express.Router();

router.get('/weekly', requireAuth, Performance.weekly);

module.exports = router;

