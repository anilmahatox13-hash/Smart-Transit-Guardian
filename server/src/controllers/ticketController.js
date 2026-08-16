const crypto = require('crypto');
const Ticket = require('../models/Ticket');
const { Bus } = require('../models');

// Phone Validation Regex (Nepal +977 98/97 or India +91 6-9)
const isValidPhone = (phone) => {
  const clean = phone.replace(/[\s\-]/g, '');
  const nepalRegex = /^(?:\+?977)?[9][78]\d{8}$/;
  const indiaRegex = /^(?:\+?91)?[6-9]\d{9}$/;
  return nepalRegex.test(clean) || indiaRegex.test(clean);
};

// @desc    Book Seats & Issue Cryptographically Signed Ticket
// @route   POST /api/tickets/book
const bookTicket = async (req, res) => {
  try {
    const {
      busId,
      passengerName,
      passengerPhone,
      passengerEmail,
      selectedSeats,
      originChowk,
      destinationChowk,
      travelDate,
      totalFare,
      currency,
      paymentMethod
    } = req.body;

    // 1. Validation Checks
    if (!busId || !passengerName || !passengerPhone || !selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory booking details.' });
    }

    if (!isValidPhone(passengerPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please enter a valid 10-digit Nepal (+977 98/97...) or India (+91 6-9...) mobile number.'
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Selected bus not found.' });
    }

    // 2. Prevent Double Booking (Atomic Check)
    const existingBookings = await Ticket.find({
      busId,
      travelDate: travelDate || new Date().toISOString().split('T')[0],
      status: { $in: ['confirmed', 'boarded'] },
      selectedSeats: { $in: selectedSeats }
    });

    if (existingBookings.length > 0) {
      const conflictSeats = existingBookings.flatMap(t => t.selectedSeats).filter(s => selectedSeats.includes(s));
      return res.status(409).json({
        success: false,
        message: `Seats [${conflictSeats.join(', ')}] were just booked by another passenger. Please select alternative seats.`
      });
    }

    // 3. Issue Ticket
    const paymentStatus = paymentMethod === 'cash_on_boarding' ? 'pending_cash' : 'paid';

    const ticket = await Ticket.create({
      busId,
      passengerId: req.user.id,
      passengerName: passengerName.trim(),
      passengerPhone: passengerPhone.trim(),
      passengerEmail: passengerEmail ? passengerEmail.trim().toLowerCase() : req.user.email,
      selectedSeats,
      originChowk: originChowk || bus.originChowk,
      destinationChowk: destinationChowk || bus.destinationChowk,
      travelDate: travelDate || new Date().toISOString().split('T')[0],
      totalFare: Number(totalFare) || bus.baseFare * selectedSeats.length,
      currency: currency || (bus.originCountry === 'Nepal' ? 'NPR' : 'INR'),
      paymentMethod,
      paymentStatus
    });

    // Update Bus occupancy count
    bus.currentOccupancy = Math.min(bus.capacity, (bus.currentOccupancy || 0) + selectedSeats.length);
    if (bus.currentOccupancy >= bus.capacity) bus.crowdStatus = 'full';
    else if (bus.currentOccupancy >= bus.capacity * 0.75) bus.crowdStatus = 'moderate';
    await bus.save();

    const populated = await Ticket.findById(ticket._id).populate('busId', 'busNumber busName registrationNumber contactPhone');

    res.status(201).json({
      success: true,
      message: paymentMethod === 'cash_on_boarding'
        ? 'Seat reserved! Pay cash directly to the bus conductor upon boarding.'
        : 'Payment verified! Your digital e-ticket has been generated.',
      ticket: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Active Tickets for Logged-In Passenger
// @route   GET /api/tickets/my-tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ passengerId: req.user.id })
      .populate('busId', 'busNumber busName registrationNumber contactPhone busType')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Public / Conductor Cryptographic Ticket Verifier
// @route   GET /api/tickets/verify/:ticketHash
const verifyTicket = async (req, res) => {
  try {
    const { ticketHash } = req.params;
    const ticket = await Ticket.findOne({ verificationHash: ticketHash })
      .populate('busId', 'busNumber busName registrationNumber contactPhone')
      .populate('passengerId', 'name phone');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'FRAUD ALERT: Invalid or counterfeit ticket. No matching cryptographic record found.'
      });
    }

    // Re-compute HMAC to ensure database record hasn't been altered
    const rawPayload = `${ticket.ticketNumber}:${ticket.busId._id}:${ticket.passengerPhone}:${ticket.selectedSeats.join(',')}:${ticket.totalFare}`;
    const secret = process.env.JWT_SECRET || 'smarttransit_secure_telematics_secret_key_2026';
    const computedHash = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

    const isValid = computedHash === ticket.verificationHash;

    res.status(200).json({
      success: true,
      valid: isValid,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        busNumber: ticket.busId?.busNumber,
        busName: ticket.busId?.busName,
        passengerName: ticket.passengerName,
        passengerPhone: ticket.passengerPhone,
        selectedSeats: ticket.selectedSeats,
        route: `${ticket.originChowk} ➔ ${ticket.destinationChowk}`,
        travelDate: ticket.travelDate,
        totalFare: `${ticket.currency} ${ticket.totalFare}`,
        paymentStatus: ticket.paymentStatus,
        status: ticket.status,
        issuedAt: ticket.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookTicket,
  getMyTickets,
  verifyTicket
};