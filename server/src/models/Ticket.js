const mongoose = require('mongoose');
const crypto = require('crypto');

const ticketSchema = new mongoose.Schema({
  ticketNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  busId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bus', 
    required: true 
  },
  passengerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  passengerName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  passengerPhone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  passengerEmail: { 
    type: String, 
    trim: true, 
    lowercase: true 
  },
  selectedSeats: [{ 
    type: String, 
    required: true 
  }],
  originChowk: { 
    type: String, 
    required: true 
  },
  destinationChowk: { 
    type: String, 
    required: true 
  },
  travelDate: { 
    type: String, 
    required: true 
  },
  departureTime: { 
    type: String, 
    default: '07:30 AM' 
  },
  totalFare: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    enum: ['NPR', 'INR'], 
    default: 'NPR' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['esewa', 'phonepe', 'upi', 'khalti', 'mobile_banking', 'cash_on_boarding'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'pending_cash', 'cancelled', 'refunded'], 
    default: 'paid' 
  },
  transactionId: { 
    type: String, 
    default: () => 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase() 
  },
  // Anti-Counterfeiting Cryptographic Signature
  verificationHash: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['confirmed', 'boarded', 'completed', 'cancelled'], 
    default: 'confirmed' 
  }
}, { timestamps: true });

// Pre-save hook: Generate Cryptographic Hash Signature for Fraud Prevention
ticketSchema.pre('validate', function(next) {
  if (!this.ticketNumber) {
    this.ticketNumber = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
  }
  if (!this.verificationHash) {
    const rawPayload = `${this.ticketNumber}:${this.busId}:${this.passengerPhone}:${this.selectedSeats.join(',')}:${this.totalFare}`;
    const secret = process.env.JWT_SECRET || 'smarttransit_secure_telematics_secret_key_2026';
    this.verificationHash = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);