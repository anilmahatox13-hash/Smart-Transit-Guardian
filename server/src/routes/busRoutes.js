const express = require('express');
const router = express.Router();
const { getBuses, createBus, updateBus, deleteBus } = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getBuses)
  .post(protect, authorize('admin'), createBus);

router.route('/:id')
  .put(protect, authorize('admin'), updateBus)
  .delete(protect, authorize('admin'), deleteBus);

module.exports = router;
