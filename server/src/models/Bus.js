const mongoose = require('mongoose');

const chowkStopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sequence: { type: Number, required: true },
  coordinates: { type: [Number], required: true }, // [lng, lat]
  estimatedMinutesFromStart: { type: Number, default: 0 },
  fareFromStart: { type: Number, default: 0 }
});

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  busName: { type: String, default: 'Super Express', trim: true },
  registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  country: { type: String, enum: ['Nepal', 'India'], default: 'Nepal' },
  stateProvince: { type: String, default: 'Bagmati Province' },
  district: { type: String, default: 'Kathmandu' },
  busType: { type: String, enum: ['AC Deluxe', 'Super Deluxe', 'Express', 'Sleeper Coach'], default: 'AC Deluxe' },
  originChowk: { type: String, required: true, default: 'Gongabu Bus Park' },
  destinationChowk: { type: String, required: true, default: 'Prithvi Chowk (Pokhara)' },
  baseFare: { type: Number, default: 600 },
  capacity: { type: Number, required: true, min: 10, max: 120, default: 40 },
  currentOccupancy: { type: Number, default: 16 },
  crowdStatus: { type: String, enum: ['vacant', 'moderate', 'full'], default: 'vacant' },
  contactPhone: { type: String, default: '+977 9801234567' },
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
    coordinates: { type: [Number], default: [85.3240, 27.7172] }, // [lng, lat]
    speed: { type: Number, default: 42 },
    heading: { type: Number, default: 90 },
    currentChowkIndex: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

busSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('Bus', busSchema);