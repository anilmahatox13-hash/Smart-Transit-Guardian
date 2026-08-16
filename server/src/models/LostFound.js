const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  passengerName: { type: String, required: true },
  passengerPhone: { type: String, required: true },
  itemDescription: { type: String, required: true },
  chowkLost: { type: String, required: true },
  travelDate: { type: String, required: true },
  status: { type: String, enum: ['reported', 'found', 'resolved'], default: 'reported' }
}, { timestamps: true });

module.exports = mongoose.model('LostFound', lostFoundSchema);