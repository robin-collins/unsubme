const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/analytics');

router.get('/', getDashboardData);

module.exports = router;
