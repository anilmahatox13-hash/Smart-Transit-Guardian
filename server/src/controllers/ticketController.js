const crypto = require('crypto');
const Ticket = require('../models').Ticket || require('../models/Ticket');
const { Bus } = require('../models');

// @desc    Book a new ticket (With QR and HMAC)
// @route   POST /api/tickets/book
const bookTicket = async (req, res) => {
  try {
    const { busId, selectedSeats, paymentMethod } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!busId || !selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: 'Bus ID and selected seats are required.' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ success: false, message: 'Target bus not found.' });

    const totalFare = (bus.baseFare || 500) * selectedSeats.length;
    const ticketNumber = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

    const secret = process.env.JWT_SECRET || 'smarttransit_secure_telematics_secret_key_2026';
    const verificationHash = crypto.createHmac('sha256', secret).update(ticketNumber).digest('hex');

    let paymentStatus = 'pending_cash';
    if (paymentMethod === 'qr_transfer') paymentStatus = 'pending_verification';

    const ticket = await Ticket.create({
      ticketNumber,
      busId: bus._id,
      passengerId: userId || bus.operatorId || bus._id,
      passengerName: req.user?.name || 'Guest Commuter',
      passengerPhone: req.user?.phone || '+977 9800000000',
      selectedSeats,
      originChowk: bus.originChowk || bus.originDistrict || 'Station',
      destinationChowk: bus.destinationChowk || bus.destDistrict || 'Station',
      travelDate: new Date().toISOString().split('T')[0],
      totalFare,
      currency: 'NPR',
      paymentMethod: paymentMethod || 'cash_on_boarding',
      paymentStatus,
      verificationHash,
      status: 'confirmed'
    });

    res.status(201).json({ success: true, message: 'Ticket booked successfully', ticket });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ success: false, message: 'Server error during booking process.' });
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
const getUserTickets = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const tickets = await Ticket.find({ passengerId: userId }).populate('busId', 'busName busNumber').sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching tickets.' });
  }
};

// @desc    Verify a ticket by Hash or Number
// @route   POST /api/tickets/verify
const verifyTicket = async (req, res) => {
  try {
    const { ticketNumber, hash } = req.body;
    const query = {};
    if (ticketNumber) query.ticketNumber = ticketNumber;
    if (hash) query.verificationHash = hash;

    const ticket = await Ticket.findOne(query).populate('busId', 'busName busNumber');
    if (!ticket) return res.status(404).json({ success: false, message: 'Invalid or missing ticket.' });

    res.status(200).json({ success: true, valid: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error verifying ticket.' });
  }
};

module.exports = { bookTicket, getUserTickets, verifyTicket };
