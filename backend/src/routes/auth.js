const express = require('express');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const Auth = require('../controllers/authController');

const router = express.Router();

router.post('/login', Auth.login);
router.post('/logout', requireAuth, Auth.logout);

module.exports = router;

