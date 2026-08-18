const crypto = require('crypto');
const Ticket = require('../models/Ticket');
const { Bus, User } = require('../models');

// @desc    Book Seats & Issue Digital Ticket
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

    if (!busId) {
      return res.status(400).json({ success: false, message: 'Bus selection is required.' });
    }

    if (!passengerName || !String(passengerName).trim()) {
      return res.status(400).json({ success: false, message: 'Passenger name is required.' });
    }

    if (!passengerPhone || String(passengerPhone).trim().length < 7) {
      return res.status(400).json({ success: false, message: 'A valid contact phone number is required.' });
    }

    if (!selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat.' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    const bookingDate = travelDate || new Date().toISOString().split('T')[0];

    // Check for seat conflict
    const existingConflict = await Ticket.findOne({
      busId,
      travelDate: bookingDate,
      status: { $in: ['confirmed', 'boarded'] },
      selectedSeats: { $in: selectedSeats }
    });

    if (existingConflict) {
      const conflictSeats = existingConflict.selectedSeats.filter(s => selectedSeats.includes(s));
      return res.status(409).json({
        success: false,
        message: `Seat(s) [${conflictSeats.join(', ')}] are already booked. Please select different seats.`
      });
    }

    // Determine passenger ID (from auth middleware or fallback)
    let passengerId = req.user?.id || req.user?._id;
    if (!passengerId) {
      const existingUser = await User.findOne({ phone: String(passengerPhone).trim() });
      passengerId = existingUser?._id || bus.operatorId;
    }

    const finalPaymentMethod = paymentMethod || 'cash_on_boarding';
    const finalPaymentStatus = finalPaymentMethod === 'cash_on_boarding' ? 'pending_cash' : 'paid';
    const computedFare = Number(totalFare) > 0 ? Number(totalFare) : (bus.baseFare || 500) * selectedSeats.length;

    const ticketNumber = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    const rawPayload = `${ticketNumber}:${bus._id}:${String(passengerPhone).trim()}:${selectedSeats.join(',')}:${computedFare}`;
    const secret = process.env.JWT_SECRET || 'smarttransit_secure_telematics_secret_key_2026';
    const verificationHash = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

    const ticket = await Ticket.create({
      ticketNumber,
      busId: bus._id,
      passengerId,
      passengerName: String(passengerName).trim(),
      passengerPhone: String(passengerPhone).trim(),
      passengerEmail: passengerEmail ? String(passengerEmail).trim().toLowerCase() : (req.user?.email || ''),
      selectedSeats,
      originChowk: originChowk || bus.originChowk || bus.originDistrict || 'Starting Hub',
      destinationChowk: destinationChowk || bus.destinationChowk || bus.destDistrict || 'Destination Hub',
      travelDate: bookingDate,
      totalFare: computedFare,
      currency: currency || (bus.originCountry === 'India' ? 'INR' : 'NPR'),
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      verificationHash,
      status: 'confirmed'
    });

    // Update bus occupancy
    bus.currentOccupancy = Math.min(bus.capacity, (bus.currentOccupancy || 0) + selectedSeats.length);
    await bus.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('busId', 'busNumber busName registrationNumber contactPhone busType originDistrict destDistrict payoutDetails');

    res.status(201).json({
      success: true,
      message: finalPaymentMethod === 'cash_on_boarding'
        ? 'Seat confirmed! Please pay cash to the bus conductor upon boarding.'
        : 'Payment verified! Your digital boarding pass has been generated.',
      ticket: populatedTicket || ticket
    });
  } catch (error) {
    console.error('Booking Controller Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while issuing ticket.' });
  }
};

// @desc    Get Passenger Tickets
// @route   GET /api/tickets/my-tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ passengerId: req.user.id })
      .populate('busId', 'busNumber busName registrationNumber contactPhone busType originDistrict destDistrict payoutDetails')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Ticket Authenticity
// @route   GET /api/tickets/verify/:identifier
const verifyTicket = async (req, res) => {
  try {
    const cleanId = String(req.params.identifier).trim();
    const ticket = await Ticket.findOne({
      $or: [
        { ticketNumber: cleanId.toUpperCase() },
        { verificationHash: cleanId }
      ]
    }).populate('busId', 'busNumber busName registrationNumber contactPhone originDistrict destDistrict');

    if (!ticket) {
      return res.status(404).json({ success: false, valid: false, message: 'Invalid or counterfeit ticket.' });
    }

    res.status(200).json({
      success: true,
      valid: true,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        busName: ticket.busId?.busName,
        busNumber: ticket.busId?.busNumber,
        passengerName: ticket.passengerName,
        passengerPhone: ticket.passengerPhone,
        selectedSeats: ticket.selectedSeats,
        route: `${ticket.originChowk} ➔ ${ticket.destinationChowk}`,
        travelDate: ticket.travelDate,
        totalFare: `${ticket.currency} ${ticket.totalFare}`,
        paymentMethod: ticket.paymentMethod,
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