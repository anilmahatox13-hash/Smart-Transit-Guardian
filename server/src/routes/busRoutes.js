const express = require('express');
const router = express.Router();
const { getAllBuses, createBus, updateBus, updateBusLocation, deleteBus, createLostFound } = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllBuses);
router.post('/telemetry', protect, updateBusLocation);
router.post('/lost-found', createLostFound);
router.post('/', protect, authorize('admin'), createBus);
router.put('/:id', protect, authorize('admin', 'driver'), updateBus);
router.delete('/:id', protect, authorize('admin'), deleteBus);

module.exports = router;