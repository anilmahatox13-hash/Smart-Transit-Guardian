const express = require('express');
const router = express.Router();
const { createEmergency, getEmergencies, updateEmergencyStatus } = require('../controllers/emergencyController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createEmergency)
  .get(protect, authorize('admin', 'driver'), getEmergencies);

router.route('/:id')
  .patch(protect, authorize('admin'), updateEmergencyStatus);

module.exports = router;
