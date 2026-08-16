const { Maintenance, Bus } = require('../models');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Admin / Driver
const getMaintenanceRecords = async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate('busId', 'busNumber registrationNumber capacity status')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching maintenance records.'
    });
  }
};

// @desc    Create a new maintenance schedule
// @route   POST /api/maintenance
// @access  Admin only
const createMaintenanceRecord = async (req, res) => {
  try {
    const { busId, serviceType, dueDate, odometerReadingKm, notes } = req.body;

    if (!busId || !serviceType || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide busId, serviceType, and dueDate.'
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.'
      });
    }

    const record = await Maintenance.create({
      busId,
      serviceType,
      dueDate,
      odometerReadingKm: odometerReadingKm || 0,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance scheduled successfully.',
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error scheduling maintenance.'
    });
  }
};

module.exports = {
  getMaintenanceRecords,
  createMaintenanceRecord
};
