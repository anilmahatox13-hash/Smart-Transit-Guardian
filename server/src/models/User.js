const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, sparse: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ['passenger', 'driver', 'operator', 'admin'],
    default: 'passenger'
  },
  governmentId: {
    idType: {
      type: String,
      enum: ['Citizenship (Nagarikta)', 'Passport', 'National ID (NID/Aadhaar)', 'Driving License', 'Voter ID'],
      default: 'Citizenship (Nagarikta)'
    },
    idNumber: { type: String, required: true, trim: true },
    issuingDistrictOrAuthority: { type: String, default: 'Kathmandu' },
    isVerified: { type: Boolean, default: true }
  },
  operatorKyc: {
    companyName: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    panVatNumber: { type: String, default: '' },
    businessAddress: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  },
  driverKyc: {
    licenseNumber: { type: String, default: '' },
    licenseCategory: { type: String, default: 'Heavy Vehicle (Category B/G)' },
    licenseExpiry: { type: String, default: '2029-12-31' },
    employedByOperatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    policeClearanceVerified: { type: Boolean, default: true },
    yearsOfExperience: { type: Number, default: 5 }
  },
  stateRegion: { type: String, default: 'Bagmati / Central' },
  ratings: [{
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 5.0 },
  active: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  twoFactorEnabled: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);