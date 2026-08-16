const express = require('express');
const router = express.Router();
const {
  register,
  createDriverByOperator,
  login,
  sendOtp,
  resetPassword,
  rateDriver,
  getDrivers
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/operator/create-driver', protect, authorize('operator', 'admin'), createDriverByOperator);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/rate-driver', protect, rateDriver);
router.get('/drivers', protect, getDrivers);

module.exports = router;