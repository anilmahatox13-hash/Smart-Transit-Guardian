const express = require('express');
const router = express.Router();
const { updateLocation, getBusLocation } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('driver', 'admin'), updateLocation);
router.get('/bus/:id', protect, getBusLocation);

module.exports = router;
