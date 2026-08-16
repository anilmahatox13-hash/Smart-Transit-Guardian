const { Location, Bus, Trip } = require('../models');

// @desc    Ingest real-time GPS telemetry from bus/driver device
// @route   POST /api/locations
// @access  Driver / Admin
const updateLocation = async (req, res) => {
  try {
    const { busId, tripId, latitude, longitude, speed, heading } = req.body;

    if (!busId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide busId, latitude, and longitude.'
      });
    }

    // Validate coordinate ranges
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates provided.'
      });
    }

    const coordinates = [lng, lat]; // GeoJSON format: [longitude, latitude]

    // Atomic Upsert into Location telemetry buffer
    const locationRecord = await Location.findOneAndUpdate(
      { busId },
      {
        tripId: tripId || null,
        location: {
          type: 'Point',
          coordinates
        },
        speed: speed || 0,
        heading: heading || 0,
        updatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Synchronize latest location on the Bus document
    await Bus.findByIdAndUpdate(busId, {
      lastLocation: {
        type: 'Point',
        coordinates
      },
      lastUpdated: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Telemetry ingested successfully.',
      telemetry: locationRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error ingesting telemetry.'
    });
  }
};

// @desc    Get latest live location for a specific bus
// @route   GET /api/buses/:id/location
// @access  Protected
const getBusLocation = async (req, res) => {
  try {
    const location = await Location.findOne({ busId: req.params.id })
      .populate('busId', 'busNumber status capacity');

    if (!location) {
      // Fallback: check lastLocation on Bus model
      const bus = await Bus.findById(req.params.id);
      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'Bus not found.'
        });
      }

      return res.status(200).json({
        success: true,
        source: 'bus_static_fallback',
        location: {
          busId: bus._id,
          location: bus.lastLocation,
          updatedAt: bus.lastUpdated
        }
      });
    }

    res.status(200).json({
      success: true,
      source: 'live_telemetry',
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving bus location.'
    });
  }
};

module.exports = {
  updateLocation,
  getBusLocation
};
