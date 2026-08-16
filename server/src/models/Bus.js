const mongoose = require('mongoose');

const chowkStopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: { type: String, default: '' },
  sequence: { type: Number, required: true },
  coordinates: { type: [Number], required: true },
  estimatedMinutesFromStart: { type: Number, default: 0 },
  fareFromStart: { type: Number, default: 0 }
});

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  busName: { type: String, required: true, trim: true },
  registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  
  // Owner / Operator Reference
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Owner Payout & Bank QR Details
  payoutDetails: {
    esewaId: { type: String, default: '9851000000' },
    khaltiId: { type: String, default: '9851000000' },
    upiId: { type: String, default: 'transit.operator@upi' },
    bankName: { type: String, default: 'Nabil Bank / SBI' },
    accountNumber: { type: String, default: '01200175000000' },
    accountHolderName: { type: String, default: 'Transit Operator Fleet' },
    qrCodeUrl: { type: String, default: '' }
  },

  // Vehicle Document Proofs (KYC Vault)
  documents: {
    bluebookNumber: { type: String, required: true, trim: true },
    routePermitNumber: { type: String, required: true, trim: true },
    permitValidityZone: { type: String, default: 'National Highway Corridor' },
    insurancePolicyNumber: { type: String, required: true, trim: true },
    fitnessCertificateExpiry: { type: String, default: '2027-12-31' }
  },

  verificationStatus: {
    type: String,
    enum: ['pending_verification', 'verified', 'rejected', 'suspended'],
    default: 'verified'
  },
  rejectionReason: { type: String, default: '' },

  // Origin Details
  originCountry: { type: String, default: 'Nepal' },
  originProvince: { type: String, default: 'Bagmati Province' },
  originDistrict: { type: String, default: 'Kathmandu' },
  originChowk: { type: String, required: true, default: 'Gongabu New Bus Park' },

  // Destination Details
  destCountry: { type: String, default: 'Nepal' },
  destProvince: { type: String, default: 'Gandaki Province' },
  destDistrict: { type: String, default: 'Kaski (Pokhara)' },
  destinationChowk: { type: String, required: true, default: 'Prithvi Chowk' },

  routeType: { 
    type: String, 
    enum: ['Local City Transit', 'Inter-District Highway Express', 'Inter-State / Cross-Border'],
    default: 'Inter-District Highway Express' 
  },
  busType: { 
    type: String, 
    enum: ['AC Deluxe', 'Super Deluxe', 'Express', 'Sleeper Coach', 'Standard Local'], 
    default: 'AC Deluxe' 
  },

  baseFare: { type: Number, required: true, default: 500 },
  maxLegalFareCeiling: { type: Number, default: 1200 },
  calculatedDistanceKm: { type: Number, default: 200 },

  capacity: { type: Number, required: true, min: 10, max: 120, default: 40 },
  currentOccupancy: { type: Number, default: 16 },
  crowdStatus: { type: String, enum: ['vacant', 'moderate', 'full'], default: 'vacant' },
  contactPhone: { type: String, required: true, default: '+977 9851000000' },
  
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  substituteDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDriverAbsent: { type: Boolean, default: false },

  routeChowks: [chowkStopSchema],
  status: {
    type: String,
    enum: ['active', 'idle', 'maintenance', 'out_of_service'],
    default: 'active'
  },
  lastLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [85.3240, 27.7172] },
    speed: { type: Number, default: 45 },
    heading: { type: Number, default: 90 },
    currentChowkIndex: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

busSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('Bus', busSchema);