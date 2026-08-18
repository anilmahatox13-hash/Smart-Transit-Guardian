const mongoose = require('mongoose');

const routeChowkSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  district: { type: String, trim: true },
  sequence: { type: Number, required: true },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true
  },
  estimatedMinutesFromStart: { type: Number, default: 0 },
  fareFromStart: { type: Number, default: 0 }
});

const busSchema = new mongoose.Schema({
  busName: { type: String, required: true, trim: true },
  busNumber: { type: String, required: true, trim: true, uppercase: true },
  registrationNumber: { type: String, required: true, trim: true, uppercase: true },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  substituteDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactPhone: { type: String, trim: true },
  
  originCountry: { type: String, default: 'Nepal' },
  originProvince: { type: String, default: 'Bagmati Province' },
  originDistrict: { type: String, required: true, trim: true },
  originChowk: { type: String, required: true, trim: true },
  
  destCountry: { type: String, default: 'Nepal' },
  destProvince: { type: String, default: 'Gandaki Province' },
  destDistrict: { type: String, required: true, trim: true },
  destinationChowk: { type: String, required: true, trim: true },
  
  busType: {
    type: String,
    enum: ['AC Deluxe', 'Super Deluxe', 'Luxury Sleeper', 'Sleeper Coach', 'Express', 'City Metro'],
    default: 'AC Deluxe'
  },
  baseFare: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, default: 40 },
  currentOccupancy: { type: Number, default: 0 },
  crowdStatus: {
    type: String,
    enum: ['low', 'moderate', 'full'],
    default: 'low'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  },
  bluebookNumber: { type: String, trim: true },
  routePermitNumber: { type: String, trim: true },
  insurancePolicyNumber: { type: String, trim: true },

  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [85.3120, 27.7340]
    }
  },
  currentChowkIndex: { type: Number, default: 0 },
  isLive: { type: Boolean, default: true },
  currentSpeed: { type: Number, default: 45 },
  isDriverAbsent: { type: Boolean, default: false },

  // Owner Bank Account & Digital Wallet Payment Setup
  payoutDetails: {
    esewaId: { type: String, trim: true, default: '' },
    khaltiId: { type: String, trim: true, default: '' },
    upiId: { type: String, trim: true, default: '' },
    bankName: { type: String, trim: true, default: 'Nabil Bank Ltd' },
    accountNumber: { type: String, trim: true, default: '' },
    accountHolderName: { type: String, trim: true, default: '' },
    qrCodeImage: { type: String, default: '' } // Base64 or Image URL
  },

  routeChowks: [routeChowkSchema]
}, { timestamps: true });

busSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Bus', busSchema);