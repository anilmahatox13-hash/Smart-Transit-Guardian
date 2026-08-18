const { Bus, User } = require('../models');
const { getIO } = require('../config/socket');

const DEFAULT_COORDS = {
  'Kathmandu': [85.3240, 27.7172],
  'Gongabu New Bus Park': [85.3120, 27.7340],
  'Kalanki Chowk': [85.2810, 27.6930],
  'Kaski (Pokhara)': [83.9856, 28.2096],
  'Prithvi Chowk': [83.9856, 28.2096],
  'Chitwan': [84.4385, 27.6805],
  'Mugling Highway Bazaar': [84.5560, 27.8610],
  'Parsa (Birgunj)': [84.8760, 27.0130],
  'Hetauda Bus Park': [85.0320, 27.4280],
  'Butwal Bus Terminal': [83.4650, 27.7000],
  'Dharan Bus Park': [87.2830, 26.8120]
};

// @desc    Get all active buses (Public)
// @route   GET /api/buses
const getBuses = async (req, res) => {
  try {
    const { origin, destination, isLive, verificationStatus, search, busType } = req.query;
    let query = {};

    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }

    if (isLive !== undefined) {
      query.isLive = isLive === 'true';
    }

    if (busType && busType !== 'all') {
      query.busType = busType;
    }

    if (origin) {
      query.$or = [
        { originDistrict: { $regex: origin.trim(), $options: 'i' } },
        { originChowk: { $regex: origin.trim(), $options: 'i' } },
        { 'routeChowks.name': { $regex: origin.trim(), $options: 'i' } }
      ];
    }

    if (destination) {
      query.destDistrict = { $regex: destination.trim(), $options: 'i' };
    }

    if (search) {
      const q = search.trim();
      query.$or = [
        { busName: { $regex: q, $options: 'i' } },
        { busNumber: { $regex: q, $options: 'i' } },
        { registrationNumber: { $regex: q, $options: 'i' } },
        { originDistrict: { $regex: q, $options: 'i' } },
        { destDistrict: { $regex: q, $options: 'i' } },
        { originChowk: { $regex: q, $options: 'i' } },
        { destinationChowk: { $regex: q, $options: 'i' } },
        { 'routeChowks.name': { $regex: q, $options: 'i' } }
      ];
    }

    const buses = await Bus.find(query)
      .populate('driverId', 'name phone averageRating driverKyc')
      .populate('operatorId', 'name phone operatorKyc')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single bus details
// @route   GET /api/buses/:id
const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driverId', 'name phone averageRating driverKyc')
      .populate('operatorId', 'name phone operatorKyc');

    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new Bus (Operator / Admin)
// @route   POST /api/buses
const createBus = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.operatorId = req.user.role === 'admin' && payload.operatorId ? payload.operatorId : req.user.id;
    payload.verificationStatus = req.user.role === 'admin' ? 'verified' : (payload.verificationStatus || 'verified');

    // Ensure default coordinates
    if (!payload.currentLocation || !payload.currentLocation.coordinates || payload.currentLocation.coordinates.length < 2) {
      const fallback = DEFAULT_COORDS[payload.originChowk] || DEFAULT_COORDS[payload.originDistrict] || [85.3120, 27.7340];
      payload.currentLocation = { type: 'Point', coordinates: fallback };
    }

    // Auto-generate route chowks if provided as raw list
    if (Array.isArray(payload.routeChowks) && payload.routeChowks.length > 0) {
      payload.routeChowks = payload.routeChowks.map((chowk, idx) => ({
        ...chowk,
        coordinates: chowk.coordinates && chowk.coordinates.length === 2
          ? chowk.coordinates
          : DEFAULT_COORDS[chowk.name] || [85.3120 + (idx * 0.05), 27.7340 + (idx * 0.03)]
      }));
    }

    const bus = await Bus.create(payload);

    try {
      const io = getIO();
      io.emit('new_bus_registered', bus);
    } catch (e) {}

    res.status(201).json({ success: true, message: 'Bus added to fleet successfully.', bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Bus details (Owner of bus or Admin)
// @route   PUT /api/buses/:id
const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    // Authorization check
    if (req.user.role !== 'admin' && bus.operatorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this bus.' });
    }

    const updatedBus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('driverId', 'name phone').populate('operatorId', 'name phone');

    res.status(200).json({ success: true, message: 'Bus details updated successfully.', bus: updatedBus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Bus from fleet (Owner of bus or Admin)
// @route   DELETE /api/buses/:id
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    // Authorization check
    if (req.user.role !== 'admin' && bus.operatorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this bus.' });
    }

    await Bus.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: `Bus ${bus.busNumber} removed from active fleet.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject Vehicle KYC (Authority Only)
// @route   PATCH /api/buses/:id/verify
const verifyBusKYC = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    bus.verificationStatus = status || 'verified';
    if (remarks) bus.verificationRemarks = remarks;
    await bus.save();

    res.status(200).json({
      success: true,
      message: `Bus ${bus.busNumber} verification status updated to: ${bus.verificationStatus}`,
      bus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Driver Broadcasts Real-Time GPS Location
// @route   PATCH /api/buses/:id/location
const updateLocation = async (req, res) => {
  try {
    const { coordinates, speed, currentChowkIndex, isLive } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      bus.currentLocation = { type: 'Point', coordinates };
    }
    if (speed !== undefined) bus.currentSpeed = Number(speed);
    if (currentChowkIndex !== undefined) bus.currentChowkIndex = Number(currentChowkIndex);
    if (isLive !== undefined) bus.isLive = Boolean(isLive);

    await bus.save();

    try {
      const io = getIO();
      io.emit('bus_location_update', {
        busId: bus._id,
        currentLocation: bus.currentLocation,
        currentSpeed: bus.currentSpeed,
        currentChowkIndex: bus.currentChowkIndex,
        isLive: bus.isLive,
        updatedAt: bus.updatedAt
      });
    } catch (wsErr) {}

    res.status(200).json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Operator's Fleet
// @route   GET /api/buses/operator/my-fleet
const getOperatorFleet = async (req, res) => {
  try {
    const buses = await Bus.find({ operatorId: req.user.id })
      .populate('driverId', 'name phone driverKyc')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Driver's Assigned Bus
// @route   GET /api/buses/driver/my-bus
const getDriverBus = async (req, res) => {
  try {
    let bus = await Bus.findOne({ driverId: req.user.id })
      .populate('operatorId', 'name phone operatorKyc');

    if (!bus) {
      bus = await Bus.findOne({ isLive: true });
    }

    res.status(200).json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  verifyBusKYC,
  updateLocation,
  getOperatorFleet,
  getDriverBus
};