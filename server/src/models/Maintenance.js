const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['routine_service', 'engine_check', 'brake_repair', 'tire_rotation', 'electrical', 'emergency_repair'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  odometerReadingKm: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'overdue'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
