const jwt = require('jsonwebtoken');
const { User, Bus } = require('../models');

// In-memory OTP store for verification (email -> { otp, expiresAt })
const otpStore = new Map();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Send 6-digit OTP for signup / password reset
// @route   POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email.toLowerCase(), { otp, expiresAt });

    console.log(`[SmartTransit Security] OTP for ${email}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent successfully.',
      otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP and register new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const record = otpStore.get(email.toLowerCase());
    if (otp) {
      if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
      }
      otpStore.delete(email.toLowerCase());
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const assignedRole = (role === 'driver' || role === 'passenger') ? role : 'passenger';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      phone: phone || '',
      isVerified: true
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered and verified successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        twoFactorEnabled: user.twoFactorEnabled || false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP, and new password.' });
    }

    const record = otpStore.get(email.toLowerCase());
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user account found with this email.' });
    }

    user.password = newPassword;
    await user.save();
    otpStore.delete(email.toLowerCase());

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedBus');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile & security settings
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, twoFactorEnabled, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;

    if (newPassword) {
      if (!currentPassword || !(await user.matchPassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Current password incorrect.' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile settings updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendOtp,
  register,
  login,
  resetPassword,
  getMe,
  updateProfile
};