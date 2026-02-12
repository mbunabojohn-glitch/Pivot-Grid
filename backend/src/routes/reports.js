const express = require('express');
const { optionalAuth } = require('../middleware/auth.middleware');
const Reports = require('../controllers/reportsController');

const router = express.Router();

router.get('/weekly', optionalAuth, Reports.weeklySummary);
router.get('/growth', optionalAuth, Reports.growthCurve);

module.exports = router;

