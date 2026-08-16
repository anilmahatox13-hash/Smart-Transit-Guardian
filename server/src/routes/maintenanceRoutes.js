const express = require('express');
const router = express.Router();
const { getMaintenanceRecords, createMaintenanceRecord } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin', 'driver'), getMaintenanceRecords)
  .post(protect, authorize('admin'), createMaintenanceRecord);

module.exports = router;
