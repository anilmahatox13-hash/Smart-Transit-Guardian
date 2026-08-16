const express = require('express');
const router = express.Router();
const { getFleetOverview } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/overview', protect, authorize('admin'), getFleetOverview);

module.exports = router;
