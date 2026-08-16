const express = require('express');
const router = express.Router();
const { register, login, sendOtp, resetPassword, rateDriver, getDrivers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/rate-driver', protect, rateDriver);
router.get('/drivers', getDrivers);

module.exports = router;