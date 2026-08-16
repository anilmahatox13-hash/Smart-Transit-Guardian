const { Trip, Bus, Route } = require('../models');

// @desc    Start a new trip
// @route   POST /api/trips/start
// @access  Driver / Admin
const startTrip = async (req, res) => {
  try {
    const { busId, routeId } = req.body;
    const driverId = req.user.role === 'admin' && req.body.driverId ? req.body.driverId : req.user.id;

    if (!busId || !routeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide busId and routeId.'
      });
    }

    // Verify bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.'
      });
    }

    // Idempotency check: Ensure bus is not already on an active trip
    const existingActiveTrip = await Trip.findOne({
      busId,
      status: 'in_progress'
    });

    if (existingActiveTrip) {
      return res.status(400).json({
        success: false,
        message: 'This bus already has an active trip in progress.',
        trip: existingActiveTrip
      });
    }

    // Create the active trip
    const trip = await Trip.create({
      busId,
      driverId,
      routeId,
      status: 'in_progress',
      startTime: new Date()
    });

    // Update bus state to active
    await Bus.findByIdAndUpdate(busId, {
      status: 'active',
      driverId,
      routeId
    });

    res.status(201).json({
      success: true,
      message: 'Trip started successfully.',
      trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error starting trip.'
    });
  }
};

// @desc    End an active trip
// @route   POST /api/trips/:id/end
// @access  Driver / Admin
const endTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found.'
      });
    }

    if (trip.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot end trip. Current status is already '${trip.status}'.`
      });
    }

    const endTime = new Date();
    const durationMinutes = Math.round((endTime - new Date(trip.startTime)) / 60000);

    trip.status = 'completed';
    trip.endTime = endTime;
    trip.actualDurationMinutes = durationMinutes > 0 ? durationMinutes : 1;
    await trip.save();

    // Reset bus status back to idle
    await Bus.findByIdAndUpdate(trip.busId, {
      status: 'idle'
    });

    res.status(200).json({
      success: true,
      message: 'Trip ended successfully.',
      trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error ending trip.'
    });
  }
};

// @desc    Get all active trips with bus, driver, and route details
// @route   GET /api/trips/active
// @access  Protected
const getActiveTrips = async (req, res) => {
  try {
    const activeTrips = await Trip.find({ status: 'in_progress' })
      .populate('busId', 'busNumber registrationNumber capacity status lastLocation')
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name startPoint endPoint stops distanceKm estimatedMinutes');

    res.status(200).json({
      success: true,
      count: activeTrips.length,
      trips: activeTrips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching active trips.'
    });
  }
};

module.exports = {
  startTrip,
  endTrip,
  getActiveTrips
};
