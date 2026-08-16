const express = require('express');
const router = express.Router();
const { getAllBuses, createBus, updateBus, deleteBus } = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllBuses);
router.post('/', protect, authorize('admin'), createBus);
router.put('/:id', protect, authorize('admin'), updateBus);
router.delete('/:id', protect, authorize('admin'), deleteBus);

module.exports = router;