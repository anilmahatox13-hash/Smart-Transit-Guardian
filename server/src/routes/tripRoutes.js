const express = require('express');
const router = express.Router();
const { startTrip, endTrip, getActiveTrips } = require('../controllers/tripController');
const { protect, authorize } = require('../middleware/auth');

router.get('/active', protect, getActiveTrips);
router.post('/start', protect, authorize('driver', 'admin'), startTrip);
router.post('/:id/end', protect, authorize('driver', 'admin'), endTrip);

module.exports = router;
