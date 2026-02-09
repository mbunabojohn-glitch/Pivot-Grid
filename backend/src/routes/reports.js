const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Reports = require('../controllers/reportsController');

const router = express.Router();

router.get('/weekly', requireAuth, Reports.weeklySummary);
router.get('/growth', requireAuth, Reports.growthCurve);

module.exports = router;

