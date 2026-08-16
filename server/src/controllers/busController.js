const { Bus, User } = require('../models');

// Get all buses with populated primary and substitute drivers
const getAllBuses = async (req, res) => {
  try {
    const { stateRegion, origin, destination } = req.query;
    let filter = {};

    if (stateRegion && stateRegion !== 'all') {
      filter.stateRegion = stateRegion;
    }
    if (origin) {
      filter.origin = { $regex: origin, $options: 'i' };
    }
    if (destination) {
      filter.destination = { $regex: destination, $options: 'i' };
    }

    const buses = await Bus.find(filter)
      .populate('driverId', 'name phone averageRating')
      .populate('substituteDriverId', 'name phone averageRating')
      .populate('routeId', 'name startPoint endPoint');

    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create new bus
const createBus = async (req, res) => {
  try {
    const { busNumber, busName, registrationNumber, capacity, driverId, origin, destination, stateRegion, routeId } = req.body;

    const exists = await Bus.findOne({
      $or: [{ busNumber: busNumber.toUpperCase() }, { registrationNumber: registrationNumber.toUpperCase() }]
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Bus number or registration plate already exists.' });
    }

    const bus = await Bus.create({
      busNumber,
      busName: busName || 'Express Shuttle',
      registrationNumber,
      capacity: Number(capacity) || 40,
      driverId: driverId || null,
      origin: origin || 'City Center',
      destination: destination || 'North Campus',
      stateRegion: stateRegion || 'Bagmati / Central',
      routeId: routeId || null
    });

    const populated = await Bus.findById(bus._id).populate('driverId', 'name phone');
    res.status(201).json({ success: true, message: 'Bus added to fleet.', bus: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update bus details & Substitute Driver re-assignment
const updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { busName, capacity, status, driverId, substituteDriverId, isDriverAbsent, origin, destination, stateRegion } = req.body;

    const bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    if (busName) bus.busName = busName;
    if (capacity) bus.capacity = Number(capacity);
    if (status) bus.status = status;
    if (origin) bus.origin = origin;
    if (destination) bus.destination = destination;
    if (stateRegion) bus.stateRegion = stateRegion;
    if (driverId !== undefined) bus.driverId = driverId || null;
    if (substituteDriverId !== undefined) bus.substituteDriverId = substituteDriverId || null;
    if (isDriverAbsent !== undefined) bus.isDriverAbsent = isDriverAbsent;

    await bus.save();

    const updated = await Bus.findById(id)
      .populate('driverId', 'name phone averageRating')
      .populate('substituteDriverId', 'name phone averageRating');

    res.status(200).json({ success: true, message: 'Bus updated successfully.', bus: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete bus
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found.' });
    res.status(200).json({ success: true, message: 'Bus removed from active fleet.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBuses,
  createBus,
  updateBus,
  deleteBus
};