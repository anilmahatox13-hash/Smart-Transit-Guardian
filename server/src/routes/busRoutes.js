const express = require('express');
const router = express.Router();
const {
  getAllBuses,
  getOperatorBuses,
  getAdminComplianceBuses,
  createBus,
  verifyBus,
  updateBus,
  updateBusLocation,
  deleteBus,
  createLostFound
} = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllBuses);
router.get('/operator/my-fleet', protect, authorize('operator', 'admin'), getOperatorBuses);
router.get('/admin/compliance', protect, authorize('admin'), getAdminComplianceBuses);

router.post('/', protect, authorize('operator', 'admin'), createBus);
router.patch('/:id/verify', protect, authorize('admin'), verifyBus);
router.post('/telemetry', protect, updateBusLocation);
router.post('/lost-found', createLostFound);
router.put('/:id', protect, authorize('operator', 'admin', 'driver'), updateBus);
router.delete('/:id', protect, authorize('operator', 'admin'), deleteBus);

module.exports = router;