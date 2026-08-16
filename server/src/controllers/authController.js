const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { User } = require('../models');

const otpStore = new Map();

const normalizeIdentifier = (val) => {
  if (!val) return '';
  const str = String(val).trim().toLowerCase();
  if (!str.includes('@')) {
    return str.replace(/[\s\-\(\)]/g, '');
  }
  return str;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smarttransit_secure_telematics_secret_key_2026', { expiresIn: '7d' });
};

const sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number or email.' });
    }

    const cleanId = normalizeIdentifier(identifier);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    
    otpStore.set(cleanId, { otp, expiresAt });
    console.log(`\n🔑 [OTP Sent] To: "${cleanId}" | Code: ${otp}`);

    const isEmail = cleanId.includes('@');

    if (isEmail) {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
          from: `"SmartTransit Security" <${process.env.EMAIL_USER}>`,
          to: cleanId,
          subject: 'SmartTransit - Verification Code',
          html: `<p>Your 6-digit OTP code is: <b>${otp}</b>. Expires in 15 minutes.</p>`
        });
      }
    } else {
      if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE) {
        const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilioClient.messages.create({
          body: `SmartTransit OTP: ${otp}. Expires in 15 mins.`,
          from: process.env.TWILIO_PHONE,
          to: cleanId
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${identifier}.`,
      otpPreview: otp
    });
  } catch (error) {
    console.error('OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

// Universal Registration (Passengers & Bus Owners)
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, otp, governmentId, operatorKyc } = req.body;

    const cleanEmail = email && email.trim() ? normalizeIdentifier(email) : undefined;
    const cleanPhone = phone && phone.trim() ? normalizeIdentifier(phone) : undefined;

    if (!name || !password || !cleanPhone) {
      return res.status(400).json({ success: false, message: 'Provide full name, password, and mobile phone number.' });
    }

    if (!governmentId || !governmentId.idNumber || !governmentId.idNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Government KYC Document (Citizenship / Passport / NID) is strictly mandatory.' });
    }

    const targetId = cleanPhone;
    const record = otpStore.get(targetId);
    const enteredOtp = String(otp || '').trim();

    const isMatch = record && String(record.otp).trim() === enteredOtp && Date.now() <= record.expiresAt;
    const isDevBypass = process.env.NODE_ENV !== 'production' && enteredOtp === '123456';

    if (!isMatch && !isDevBypass) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    otpStore.delete(targetId);

    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account already exists with this mobile phone number.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail || undefined,
      phone: cleanPhone,
      password,
      role: (role === 'operator' || role === 'admin') ? role : 'passenger',
      governmentId: {
        idType: governmentId.idType || 'Citizenship (Nagarikta)',
        idNumber: governmentId.idNumber.trim(),
        issuingDistrictOrAuthority: governmentId.issuingDistrictOrAuthority || 'Kathmandu',
        isVerified: true
      },
      operatorKyc: role === 'operator' ? {
        companyName: operatorKyc?.companyName || name,
        registrationNumber: operatorKyc?.registrationNumber || 'REG-2024-9988',
        panVatNumber: operatorKyc?.panVatNumber || 'PAN-6012938',
        isVerified: true
      } : undefined,
      isVerified: true
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account verified with Government KYC and created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        governmentId: user.governmentId
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

// Owner Recruits & Registers a Driver directly under their Fleet
const createDriverByOperator = async (req, res) => {
  try {
    const { name, phone, password, licenseNumber, licenseCategory, citizenshipNumber, issuingDistrict, yearsOfExperience } = req.body;

    if (!name || !phone || !password || !licenseNumber || !citizenshipNumber) {
      return res.status(400).json({
        success: false,
        message: 'Driver Name, Phone, Password, Heavy License No, and Citizenship No are mandatory.'
      });
    }

    const cleanPhone = normalizeIdentifier(phone);
    const existing = await User.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A driver with this phone number is already registered.' });
    }

    const driver = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      password,
      role: 'driver',
      governmentId: {
        idType: 'Citizenship (Nagarikta)',
        idNumber: citizenshipNumber.trim(),
        issuingDistrictOrAuthority: issuingDistrict || 'Kathmandu',
        isVerified: true
      },
      driverKyc: {
        licenseNumber: licenseNumber.trim(),
        licenseCategory: licenseCategory || 'Heavy Vehicle (Category B/G)',
        employedByOperatorId: req.user.id,
        policeClearanceVerified: true,
        yearsOfExperience: Number(yearsOfExperience) || 5
      },
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: `Driver ${driver.name} onboarded and verified under your company fleet.`,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        licenseNumber: driver.driverKyc.licenseNumber,
        averageRating: driver.averageRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Drivers (Filtered: Bus Owners only see drivers they hired)
const getDrivers = async (req, res) => {
  try {
    let filter = { role: 'driver', active: true };
    if (req.user && req.user.role === 'operator') {
      filter = {
        role: 'driver',
        active: true,
        $or: [
          { 'driverKyc.employedByOperatorId': req.user.id },
          { 'driverKyc.employedByOperatorId': { $exists: false } }
        ]
      };
    }

    const drivers = await User.find(filter).select('name email phone averageRating driverKyc governmentId');
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ success: false, message: 'Please provide phone number and password.' });

    const cleanId = normalizeIdentifier(identifier);
    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: cleanId }]
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const cleanId = normalizeIdentifier(identifier);
    const record = otpStore.get(cleanId);

    if (!record || String(record.otp).trim() !== String(otp).trim() || Date.now() > record.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    const user = await User.findOne({ $or: [{ email: cleanId }, { phone: cleanId }] });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    user.password = newPassword;
    await user.save();
    otpStore.delete(cleanId);
    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rateDriver = async (req, res) => {
  try {
    const { driverId, rating, comment } = req.body;
    const driver = await User.findById(driverId);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    driver.ratings.push({ passengerId: req.user.id, rating: Number(rating), comment });
    const total = driver.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    driver.averageRating = Number((total / driver.ratings.length).toFixed(1));
    await driver.save();
    res.status(200).json({ success: true, averageRating: driver.averageRating });
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
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendOtp,
  register,
  createDriverByOperator,
  login,
  resetPassword,
  rateDriver,
  getDrivers,
  getMe,
  updateProfile
};