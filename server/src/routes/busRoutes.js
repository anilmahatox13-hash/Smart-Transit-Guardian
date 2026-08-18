const express = require('express');
const router = express.Router();
const {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  verifyBusKYC,
  updateLocation,
  getOperatorFleet,
  getDriverBus
} = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');
const { Bus } = require('../models');

// Public Bus Viewing
router.get('/', getBuses);
router.get('/operator/my-fleet', protect, authorize('operator', 'admin'), getOperatorFleet);
router.get('/driver/my-bus', protect, authorize('driver', 'admin', 'operator'), getDriverBus);
router.get('/:id', getBusById);

// Owner and Admin CRUD Operations
router.post('/', protect, authorize('operator', 'admin'), createBus);
router.put('/:id', protect, authorize('operator', 'admin'), updateBus);
router.delete('/:id', protect, authorize('operator', 'admin'), deleteBus);

// Specific Actions
router.patch('/:id/verify', protect, authorize('admin'), verifyBusKYC);
router.patch('/:id/location', protect, authorize('driver', 'admin', 'operator'), updateLocation);

// Update Bus Payout Details (eSewa / Khalti / UPI / Bank QR)
router.patch('/:id/payout', protect, authorize('operator', 'admin'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    if (bus.operatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update payout details for this vehicle' });
    }

    bus.payoutDetails = {
      ...bus.payoutDetails,
      ...req.body
    };

    await bus.save();
    res.status(200).json({ success: true, message: 'Payment gateway and QR details updated successfully.', payoutDetails: bus.payoutDetails });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;