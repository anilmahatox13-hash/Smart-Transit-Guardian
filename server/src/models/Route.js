const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sequence: {
    type: Number,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  estimatedMinutesFromStart: {
    type: Number,
    default: 0
  }
});

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    unique: true,
    trim: true
  },
  startPoint: {
    type: String,
    required: [true, 'Start point is required'],
    trim: true
  },
  endPoint: {
    type: String,
    required: [true, 'End point is required'],
    trim: true
  },
  stops: [stopSchema],
  distanceKm: {
    type: Number,
    default: 0
  },
  estimatedMinutes: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema);
