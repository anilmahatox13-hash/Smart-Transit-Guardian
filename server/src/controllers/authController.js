const jwt = require('jsonwebtoken');
const { User } = require('../models');

const otpStore = new Map();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Send OTP to Phone or Email
const sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body; // email or phone
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide an email or phone number.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(identifier.toLowerCase().trim(), { otp, expiresAt });

    console.log(`[SmartTransit Security] OTP for ${identifier}: ${otp}`);

    res.status(200).json({
      success: true,
      message: `Verification OTP sent to ${identifier}.`,
      otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register with Email OR Phone
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, otp } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ success: false, message: 'Provide name, password, and either email or phone.' });
    }

    const identifier = (email || phone).toLowerCase().trim();
    const record = otpStore.get(identifier);
    if (otp) {
      if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
      }
      otpStore.delete(identifier);
    }

    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email: email.toLowerCase() }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email or phone.' });
    }

    const user = await User.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone: phone || undefined,
      password,
      role: (role === 'driver' || role === 'admin') ? role : 'passenger',
      isVerified: true
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login with Email OR Phone
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/phone and password.' });
    }

    const cleanIdentifier = identifier.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { phone: cleanIdentifier }
      ]
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check email/phone or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        averageRating: user.averageRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rate Driver
const rateDriver = async (req, res) => {
  try {
    const { driverId, rating, comment } = req.body;
    if (!driverId || !rating) {
      return res.status(400).json({ success: false, message: 'Driver ID and rating (1-5) are required.' });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    driver.ratings.push({ passengerId: req.user.id, rating: Number(rating), comment });
    const total = driver.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    driver.averageRating = Number((total / driver.ratings.length).toFixed(1));
    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully.',
      averageRating: driver.averageRating
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const cleanIdentifier = identifier.toLowerCase().trim();
    const record = otpStore.get(cleanIdentifier);

    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { phone: cleanIdentifier }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    user.password = newPassword;
    await user.save();
    otpStore.delete(cleanIdentifier);

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Drivers List (For Admin and Substitution)
const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', active: true }).select('name email phone averageRating');
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
      message: 'Profile updated successfully.',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
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
  rateDriver,
  getDrivers,
  getMe,
  updateProfile
};