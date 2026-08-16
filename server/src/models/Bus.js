const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  busName: { type: String, default: 'City Express', trim: true },
  registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  capacity: { type: Number, required: true, min: 10, max: 120 },
  currentOccupancy: { type: Number, default: 0 },
  stateRegion: { type: String, default: 'Bagmati / Central' },
  origin: { type: String, default: 'Central Terminal' },
  destination: { type: String, default: 'University Hub' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  substituteDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDriverAbsent: { type: Boolean, default: false },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  status: {
    type: String,
    enum: ['active', 'idle', 'maintenance', 'out_of_service'],
    default: 'idle'
  },
  lastLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [80.5501, 16.2335] },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

busSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('Bus', busSchema);