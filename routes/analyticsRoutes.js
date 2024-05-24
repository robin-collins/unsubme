// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/analyticsController');

router.get('/', getDashboardData);

module.exports = router;
