const { Emergency, Trip, Bus } = require('../models');

// @desc    Trigger SOS / report an emergency incident
// @route   POST /api/emergencies
// @access  Protected (All authenticated users)
const createEmergency = async (req, res) => {
  try {
    const { busId, tripId, type, description, latitude, longitude } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide incident type and description.'
      });
    }

    const coordinates = (latitude !== undefined && longitude !== undefined)
      ? [parseFloat(longitude), parseFloat(latitude)]
      : [80.5501, 16.2335];

    const emergency = await Emergency.create({
      userId: req.user.id,
      busId: busId || null,
      tripId: tripId || null,
      type,
      description,
      location: {
        type: 'Point',
        coordinates
      },
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: 'Emergency SOS alert recorded. Dispatch teams notified.',
      emergency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating emergency alert.'
    });
  }
};

// @desc    Get all emergency incidents
// @route   GET /api/emergencies
// @access  Admin / Driver
const getEmergencies = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};

    const emergencies = await Emergency.find(filter)
      .populate('userId', 'name email phone role')
      .populate('busId', 'busNumber registrationNumber')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: emergencies.length,
      emergencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching emergencies.'
    });
  }
};

// @desc    Acknowledge or resolve an emergency incident
// @route   PATCH /api/emergencies/:id
// @access  Admin only
const updateEmergencyStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    if (!status || !['open', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'open', 'investigating', or 'resolved'."
      });
    }

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency incident not found.'
      });
    }

    emergency.status = status;
    if (resolutionNotes) emergency.resolutionNotes = resolutionNotes;
    if (status === 'resolved') emergency.resolvedBy = req.user.id;

    await emergency.save();

    res.status(200).json({
      success: true,
      message: `Emergency incident marked as ${status}.`,
      emergency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating emergency.'
    });
  }
};

module.exports = {
  createEmergency,
  getEmergencies,
  updateEmergencyStatus
};
