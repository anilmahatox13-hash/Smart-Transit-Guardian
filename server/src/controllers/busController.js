const { Bus, User, Route } = require('../models');

// @desc    Get all buses
// @route   GET /api/buses
// @access  Protected
const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name startPoint endPoint');

    res.status(200).json({
      success: true,
      count: buses.length,
      buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching buses.'
    });
  }
};

// @desc    Create new bus
// @route   POST /api/buses
// @access  Admin only
const createBus = async (req, res) => {
  try {
    const { busNumber, registrationNumber, capacity, driverId, routeId } = req.body;

    if (!busNumber || !registrationNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide busNumber, registrationNumber, and capacity.'
      });
    }

    const busExists = await Bus.findOne({
      $or: [{ busNumber: busNumber.toUpperCase() }, { registrationNumber: registrationNumber.toUpperCase() }]
    });

    if (busExists) {
      return res.status(400).json({
        success: false,
        message: 'A bus with this bus number or registration number already exists.'
      });
    }

    const bus = await Bus.create({
      busNumber: busNumber.toUpperCase(),
      registrationNumber: registrationNumber.toUpperCase(),
      capacity,
      driverId: driverId || null,
      routeId: routeId || null
    });

    if (driverId) {
      await User.findByIdAndUpdate(driverId, { assignedBus: bus._id });
    }

    res.status(201).json({
      success: true,
      message: 'Bus created successfully.',
      bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating bus.'
    });
  }
};

// @desc    Update bus details
// @route   PUT /api/buses/:id
// @access  Admin only
const updateBus = async (req, res) => {
  try {
    let bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.'
      });
    }

    bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully.',
      bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating bus.'
    });
  }
};

// @desc    Delete a bus
// @route   DELETE /api/buses/:id
// @access  Admin only
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.'
      });
    }

    await Bus.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting bus.'
    });
  }
};

module.exports = {
  getBuses,
  createBus,
  updateBus,
  deleteBus
};
